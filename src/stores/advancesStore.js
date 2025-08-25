import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAdvancesStore = defineStore('advances', {
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
          .from('advances')
          .select('*')
          .gte('advance_date', start)
          .lte('advance_date', end)
          .order('advance_date', { ascending: false })

        if (error) throw error
        this.list = data || []
      } catch (err) {
        console.error('Błąd pobierania zaliczek:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async add(entry) {
      try {
        const { error } = await supabase
          .from('advances')
          .insert([entry])

        if (error) throw error
      } catch (err) {
        console.error('Błąd dodawania zaliczki:', err)
        this.error = err.message
      }
    },

    async remove(id) {
      try {
        const { error } = await supabase
          .from('advances')
          .delete()
          .eq('id', id)

        if (error) throw error
      } catch (err) {
        console.error('Błąd usuwania zaliczki:', err)
        this.error = err.message
      }
    }
  }
})
