// src/stores/activeRepairsStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const useActiveRepairsStore = defineStore('activeRepairs', {
  state: () => ({
    // lista bieżących (aktywnych) napraw
    workshop_active_repairs: [],

    // flagi ładowania i błędów dla aktywnych napraw
    loadingActive: false,
    errorActive: null
  }),

  getters: {
    // wszystkie aktywne naprawy
    allActiveRepairs: state => state.workshop_active_repairs,

    // suma kosztów części dla danej naprawy
    sumPartsFor: state => repairId => {
      const repair = state.workshop_active_repairs.find(r => r.id === repairId)
      if (!repair || !repair.parts) return 0
      return repair.parts.reduce((sum, p) => sum + (p.cost || 0), 0)
    }
  },

  actions: {
    // 1. Pobierz listę aktywnych napraw wraz z ich częściami oraz polami completed i payment_method
    async fetchActiveRepairs() {
      this.loadingActive = true
      this.errorActive   = null

      const { data, error } = await supabase
        .from('workshop_active_repairs')
        .select(`
          id,
          arrival_date,
          completion_date,
          first_name,
          last_name,
          phone,
          vehicle_make,
          vehicle_model,
          vin,
          completed,
          payment_method,
          workshop_repair_parts (
            id,
            repair_id,
            part_name,
            part_cost
          )
        `)
        .order('arrival_date', { ascending: true })

      if (error) {
        console.error('fetchActiveRepairs error:', error)
        this.errorActive   = error.message
        this.loadingActive = false
        return
      }

      // Mapujemy części na pola name/cost, zachowując completed i payment_method
      this.workshop_active_repairs = data.map(r => ({
        ...r,
        parts: (r.workshop_repair_parts || []).map(p => ({
          id: p.id,
          repair_id: p.repair_id,
          name: p.part_name,
          cost: p.part_cost
        }))
      }))

      this.loadingActive = false
      return this.workshop_active_repairs
    },

    // 2. Dodaj nową aktywną naprawę (payload powinien zawierać arrival_date, completion_date, first_name, last_name, phone, vehicle_make, vehicle_model, vin, completed, payment_method)
    async createActiveRepair(payload) {
      this.loadingActive = true
      this.errorActive   = null

      const { data, error } = await supabase
        .from('workshop_active_repairs')
        .insert(payload)
        .single()

      if (error) {
        console.error('createActiveRepair error:', error)
        this.errorActive   = error.message
        this.loadingActive = false
        return null
      }

      // Dodajemy nową naprawę na początek listy z pustą tablicą parts
      this.workshop_active_repairs.unshift({ ...data, parts: [] })
      this.loadingActive = false
      return data
    },

    // 3. Zaktualizuj istniejącą aktywną naprawę pod kątem dowolnych pól, w tym completed i payment_method
    async updateActiveRepair(id, payload) {
      this.loadingActive = true
      this.errorActive   = null

      const { data, error } = await supabase
        .from('workshop_active_repairs')
        .update(payload)
        .eq('id', id)
        .single()

      if (error) {
        console.error('updateActiveRepair error:', error)
        this.errorActive   = error.message
        this.loadingActive = false
        return null
      }

      const idx = this.workshop_active_repairs.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.workshop_active_repairs.splice(idx, 1, {
          ...data,
          parts: this.workshop_active_repairs[idx].parts || []
        })
      }

      this.loadingActive = false
      return data
    },

    // 4. Usuń aktywną naprawę
    async deleteActiveRepair(id) {
      this.loadingActive = true
      this.errorActive   = null

      const { error } = await supabase
        .from('workshop_active_repairs')
        .delete()
        .eq('id', id)
        .single()

      if (error) {
        console.error('deleteActiveRepair error:', error)
        this.errorActive   = error.message
        this.loadingActive = false
        return false
      }

      this.workshop_active_repairs =
        this.workshop_active_repairs.filter(r => r.id !== id)

      this.loadingActive = false
      return true
    }
  }
})
