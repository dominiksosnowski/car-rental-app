// src/stores/payrollStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

// Pomocnicza funkcja do lokalnego formatu YYYY-MM-DD
function localYMD(dateStr) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const usePayrollStore = defineStore('payroll', {
  state: () => ({
    rows: []
  }),

  actions: {
    async fetchForMonth(start, end) {
      this.rows = []

      // 1) Pobierz wpisy z time_entries wraz z danymi projektu
      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select(`
          employee_id,
          hours,
          work_date,
          project:projects (
            name, 
            employee_rate
          )
        `)
        .gte('work_date', start)
        .lte('work_date', end)

      if (entriesError) throw entriesError

      // 2) Pobierz zaliczki
      const { data: advancesData, error: advancesError } = await supabase
        .from('advances')
        .select('employee_id, amount, advance_date, note')
        .gte('advance_date', start)
        .lte('advance_date', end)


      if (advancesError && advancesError.code !== '42P01') {
        throw advancesError
      }

      // Grupowanie zaliczek po pracowniku
      const advancesByEmp = new Map()
      for (const a of advancesData ?? []) {
        const empId = Number(a.employee_id)
        const amount = Number(a.amount) || 0

        if (!advancesByEmp.has(empId)) {
          advancesByEmp.set(empId, { sum: 0, details: [] })
        }
        const adv = advancesByEmp.get(empId)
        adv.sum += amount
        adv.details.push({
          date: localYMD(a.advance_date),
          amount,
          note: a.note || ''
        })
      }


      // 3) Agregacja wpisów czasu pracy po pracowniku
      const rowsMap = new Map()

      for (const e of entries ?? []) {
        const empId = Number(e.employee_id)
        const hours = Number(e.hours) || 0
        const rate = Number(e.project?.employee_rate) || 0
        const earned = hours * rate
        const place = e.project?.name || 'Nieznane miejsce'

        if (!rowsMap.has(empId)) {
          rowsMap.set(empId, {
            employee_id: empId,
            hours_sum: 0,
            gross_sum: 0,
            advances_sum: 0,
            net_sum: 0,
            details: [],
            advances_details: []
          })
        }

        const row = rowsMap.get(empId)
        row.hours_sum += hours
        row.gross_sum += earned

        const idx = row.details.findIndex(d => d.place === place)
        if (idx === -1) {
          row.details.push({ place, hours, earned })
        } else {
          row.details[idx].hours += hours
          row.details[idx].earned += earned
        }
      }

      // 4) Dodanie zaliczek i wyliczenie netto
      for (const row of rowsMap.values()) {
        const advData = advancesByEmp.get(row.employee_id) || { sum: 0, details: [] }
        row.advances_sum = advData.sum
        row.advances_details = advData.details
        row.net_sum = row.gross_sum - row.advances_sum
      }

      // 5) Ustaw wiersze
      this.rows = Array.from(rowsMap.values())
        .sort((a, b) => String(a.employee_id).localeCompare(String(b.employee_id)))
    }
  }
})
