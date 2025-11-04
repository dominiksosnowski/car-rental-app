import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const useProjectsDashboardStore = defineStore('projectsDashboard', {
  state: () => ({
    rowsAllTime: [],
    rowsMonth: [],
    rowsDay: [],        // 👈 nowa tabela dla godzin danego dnia
    loading: false,
    error: null
  }),

  actions: {
    async fetchDashboard(start, end) {
      this.loading = true
      this.error = null
      try {
        // 1) Pobierz aktywne projekty
        const { data: projects, error: projErr } = await supabase
          .from('projects')
          .select('id, name, company_rate, currency')
          .eq('active', true)
        if (projErr) throw projErr

        const rateMap = new Map()
        for (const p of projects) {
          rateMap.set(p.id, { rate: Number(p.company_rate) || 0, currency: p.currency })
        }

        // 2) Wszystkie wpisy (all time)
        const { data: entriesAll, error: allErr } = await supabase
          .from('time_entries')
          .select('project_id, hours')
        if (allErr) throw allErr

        const aggAll = new Map()
        for (const e of entriesAll) {
          if (!rateMap.has(e.project_id)) continue
          const hours = Number(e.hours) || 0
          const { rate } = rateMap.get(e.project_id)
          const earned = hours * rate
          if (!aggAll.has(e.project_id)) {
            aggAll.set(e.project_id, { hours: 0, earned: 0 })
          }
          aggAll.get(e.project_id).hours += hours
          aggAll.get(e.project_id).earned += earned
        }

        // 3) Wpisy dla wybranego miesiąca
        const { data: entriesMonth, error: monthErr } = await supabase
          .from('time_entries')
          .select('project_id, hours, work_date')
          .gte('work_date', start)
          .lte('work_date', end)
        if (monthErr) throw monthErr

        const aggMonth = new Map()
        for (const e of entriesMonth) {
          if (!rateMap.has(e.project_id)) continue
          const hours = Number(e.hours) || 0
          const { rate } = rateMap.get(e.project_id)
          const earned = hours * rate
          if (!aggMonth.has(e.project_id)) {
            aggMonth.set(e.project_id, { hours: 0, earned: 0 })
          }
          aggMonth.get(e.project_id).hours += hours
          aggMonth.get(e.project_id).earned += earned
        }

        // 4) Zbuduj wiersze
        this.rowsAllTime = projects.map(p => ({
          project_id: p.id,
          name: p.name,
          hours: aggAll.get(p.id)?.hours || 0,
          earned: aggAll.get(p.id)?.earned || 0,
          currency: p.currency
        }))

        this.rowsMonth = projects.map(p => ({
          project_id: p.id,
          name: p.name,
          hours: aggMonth.get(p.id)?.hours || 0,
          earned: aggMonth.get(p.id)?.earned || 0,
          currency: p.currency
        }))
      } catch (err) {
        console.error('Błąd pobierania dashboardu projektów:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    // 👇 NOWA AKCJA: godziny danego dnia
async fetchDayHours(date) {
  this.loading = true
  this.error = null
  try {
    const { data: entries, error } = await supabase
      .from('time_entries')
      .select(`
        id,
        hours,
        work_date,
        note,
        employee:employees (id, first_name, last_name),
        project:projects (id, name, location)
      `)
      .eq('work_date', date)   // date w formacie 'YYYY-MM-DD'

    if (error) throw error

    this.rowsDay = entries.map(e => ({
      id: e.id,
      employee_id: e.employee?.id,
      employee: e.employee
        ? `${e.employee.first_name} ${e.employee.last_name}`
        : 'Nieznany',
      project_id: e.project?.id,
      project: e.project?.name || 'Brak',
      location: e.project?.location || 'Brak',
      hours: Number(e.hours) || 0,
      note: e.note || ''
    }))
  } catch (err) {
    console.error('Błąd pobierania godzin dnia:', err)
    this.error = err.message
  } finally {
    this.loading = false
  }
}


  }
})
