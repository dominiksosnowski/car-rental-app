import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useVehicleStore = defineStore('vehicle', {
  state: () => ({
    list: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) this.error = error.message
      else this.list = data

      this.loading = false
    },

    async addVehicle(payload) {
      this.loading = true
      this.error = null

      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ ...payload }])
        .select()

      this.loading = false

      if (error) {
        this.error = error.message
        return null
      }

      this.list.unshift(data[0])
      return data[0]
    },

        // Usuń pojazd
    async deleteVehicle(id) {
      this.loading = true
      this.error = null

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      this.loading = false

      if (error) {
        this.error = error.message
      } else {
        // odfiltruj z listy
        this.list = this.list.filter(v => v.id !== id)
      }
    },

    // Zaktualizuj pojazd
    async updateVehicle(id, payload) {
      this.loading = true
      this.error = null

      const { data, error } = await supabase
        .from('vehicles')
        .update({ ...payload })
        .eq('id', id)
        .select()

      this.loading = false

      if (error) {
        this.error = error.message
        return null
      }

      // zamień w liście zaktualizowany rekord
      this.list = this.list.map(v => v.id === id ? data[0] : v)
      return data[0]
    }
  },

})
