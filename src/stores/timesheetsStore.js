// src/stores/timesheetsStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useTimesheetsStore = defineStore('timesheets', {
  state: () => ({
    list: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchForRange(start, end) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select(`
            id,
            work_date,
            hours,
            note,
            employee_id,
            project_id,
            employees ( first_name, last_name ),
            projects ( name, employee_rate, currency )
          `)
          .gte('work_date', start)
          .lte('work_date', end)
          .order('work_date', { ascending: false })

        if (error) throw error
        this.list = data || []
      } catch (err) {
        console.error('Błąd pobierania wpisów czasu pracy:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async add(entry) {
      try {
        // Usuwamy 'rate', bo teraz nie jest potrzebny
        const payload = {
          employee_id: entry.employee_id,
          work_date: entry.work_date,
          hours: entry.hours,
          project_id: entry.project_id,
          note: entry.note || null
        }

        const { error } = await supabase
          .from('time_entries')
          .insert([payload])

        if (error) throw error
      } catch (err) {
        console.error('Błąd dodawania wpisu czasu pracy:', err)
        this.error = err.message
      }
    },

    async remove(id) {
      try {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', id)

        if (error) throw error
      } catch (err) {
        console.error('Błąd usuwania wpisu czasu pracy:', err)
        this.error = err.message
      }
    },
        async update(id, payload) {
      const { error } = await supabase
        .from('time_entries')
        .update(payload)
        .eq('id', id)
      if (error) throw error
    }
  }
})
