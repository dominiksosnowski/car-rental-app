import { defineStore } from 'pinia'
import { supabase }    from '@/lib/supabase'

export const useRepairStore = defineStore('repair', {
  state: () => ({
    list:    [],
    loading: false,
    error:   null,
  }),

  actions: {
    // 2.1 Pobierz wszystkie naprawy z relacją do pojazdu
    async fetchAll() {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('repairs')
        .select(`
          *,
          vehicle:vehicle_id (
            id, brand, model, reg_number
          )
        `)
        .order('date', { ascending: false })

      this.loading = false
      if (error) this.error = error.message
      else      this.list  = data
    },

    // 2.2 Dodaj naprawę
    async addRepair(payload) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('repairs')
        .insert([payload])
        .select(`
          *,
          vehicle:vehicle_id (
            id, brand, model, reg_number
          )
        `)

      this.loading = false
      if (error) {
        this.error = error.message
        return null
      }

      this.list.unshift(data[0])
      return data[0]
    },

    // 2.3 Edytuj naprawę
    async updateRepair(id, payload) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('repairs')
        .update(payload)
        .eq('id', id)
        .select(`
          *,
          vehicle:vehicle_id (
            id, brand, model, reg_number
          )
        `)

      this.loading = false
      if (error) {
        this.error = error.message
        return null
      }

      this.list = this.list.map(r => r.id === id ? data[0] : r)
      return data[0]
    },

    // 2.4 Usuń naprawę
    async deleteRepair(id) {
      this.loading = true
      this.error   = null

      const { error } = await supabase
        .from('repairs')
        .delete()
        .eq('id', id)

      this.loading = false
      if (error) {
        this.error = error.message
      } else {
        this.list = this.list.filter(r => r.id !== id)
      }
    },

    // 2.5 Pobierz naprawy konkretnego pojazdu (opcjonalnie)
    async fetchByVehicle(vehicleId) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('repairs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false })

      this.loading = false
      if (error) this.error = error.message
      else      this.list  = data
    },
  },
})
