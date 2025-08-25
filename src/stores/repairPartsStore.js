// src/stores/repairPartsStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const useRepairPartsStore = defineStore('repairParts', {
  state: () => ({
    parts: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchParts(repairId) {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('workshop_repair_parts')
        .select('*')
        .eq('repair_id', repairId)
        .order('part_name', { ascending: true })

      if (error) {
        this.error = error.message
      } else {
        this.parts = data
      }

      this.loading = false
      return data
    },

    async createPart(repairId, payload) {
      this.loading = true
      this.error = null
      const record = { ...payload, repair_id: repairId }
      const { data, error } = await supabase
        .from('workshop_repair_parts')
        .insert(record)
        .single()

      if (error) {
        this.error = error.message
      } else {
        this.parts.unshift(data)
      }

      this.loading = false
      return data
    },

    async updatePart(id, payload) {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('workshop_repair_parts')
        .update(payload)
        .eq('id', id)
        .single()

      if (error) {
        this.error = error.message
      } else {
        // aktualizacja w lokalnym stanie
        const idx = this.parts.findIndex(p => p.id === id)
        if (idx !== -1) {
          this.parts[idx] = { ...this.parts[idx], ...data }
        }
      }

      this.loading = false
      return data
    },

    async deletePart(id) {
      this.loading = true
      this.error = null
      const { error } = await supabase
        .from('workshop_repair_parts')
        .delete()
        .eq('id', id)
        .single()

      if (error) {
        this.error = error.message
      } else {
        this.parts = this.parts.filter(p => p.id !== id)
      }

      this.loading = false
      return !error
    }
  }
})
