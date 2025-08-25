// src/stores/projectsStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useProjectsStore = defineStore('projects', {
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
          .from('projects')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error

        this.list = (data || []).map(p => ({
          ...p,
          company_rate: p.company_rate != null ? Number(p.company_rate) : null,
          employee_rate: p.employee_rate != null ? Number(p.employee_rate) : null
        }))
      } catch (err) {
        console.error('Błąd pobierania projektów:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async add(project) {
      this.error = null
      try {
        const payload = {
          name: project.name,
          company_rate: project.company_rate != null ? Number(project.company_rate) : 0,
          employee_rate: project.employee_rate != null ? Number(project.employee_rate) : 0,
          currency: project.currency || 'PLN',
          location: project.location ?? null,
          active: project.active ?? true
        }
        const { error } = await supabase.from('projects').insert([payload])
        if (error) throw error
      } catch (err) {
        console.error('Błąd dodawania projektu:', err)
        this.error = err.message
      }
    },

    async update(id, updates) {
      this.error = null
      try {
        const payload = {}
        if (updates.name !== undefined) payload.name = updates.name
        if (updates.company_rate !== undefined) payload.company_rate = Number(updates.company_rate)
        if (updates.employee_rate !== undefined) payload.employee_rate = Number(updates.employee_rate)
        if (updates.currency !== undefined) payload.currency = updates.currency
        if (updates.location !== undefined) payload.location = updates.location
        if (updates.active !== undefined) payload.active = updates.active

        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', id)

        if (error) throw error
      } catch (err) {
        console.error('Błąd aktualizacji projektu:', err)
        this.error = err.message
      }
    },

      async finish(id) {
        const { error } = await supabase
          .from('projects')
          .update({ active: false })
          .eq('id', id)
        if (error) throw error
        await this.fetchAll()
      },

  }
})
