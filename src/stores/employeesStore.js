import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    list: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('last_name', { ascending: true })

        if (error) throw error
        this.list = data || []
      } catch (err) {
        console.error('Błąd przy pobieraniu pracowników:', err)
        this.error = err.message || 'Nie udało się pobrać listy'
      } finally {
        this.loading = false
      }
    },

    async add(employee) {
      this.error = null
      try {
        const { error } = await supabase
          .from('employees')
          .insert([employee])

        if (error) throw error
        await this.fetchAll()
      } catch (err) {
        console.error('Błąd przy dodawaniu pracownika:', err)
        this.error = err.message
      }
    },

    async update(id, updates) {
      this.error = null
      try {
        const { error } = await supabase
          .from('employees')
          .update(updates)
          .eq('id', id)

        if (error) throw error
        await this.fetchAll()
      } catch (err) {
        console.error('Błąd przy aktualizacji pracownika:', err)
        this.error = err.message
      }
    },

    async remove(id) {
      this.error = null
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id)

        if (error) throw error
        await this.fetchAll()
      } catch (err) {
        console.error('Błąd przy usuwaniu pracownika:', err)
        this.error = err.message
      }
    }
  }
})
