import { defineStore } from 'pinia'
import { supabase }    from '@/lib/supabase'

export const useRentalStore = defineStore('rental', {
  state: () => ({
    list:    [],
    loading: false,
    error:   null,
  }),

  actions: {
    // pobranie wszystkich wypożyczeń wraz z danymi pojazdu
    async fetchAll() {
      this.loading = true
      const { data, error } = await supabase
        .from('rentals')
       .select(`*, vehicles:vehicle_id(brand, model, reg_number)`)
        .eq('archived', false)              // <-- tylko aktywne
        .order('start_date', { ascending: false })
      this.loading = false

      if (error) this.error = error.message
      else      this.list  = data
    },

    async archiveRental(id) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('rentals')
        .update({ archived: true })
        .eq('id', id)

      this.loading = false
      if (error) {
        this.error = error.message
      } else {
        // usuwamy z lokalnej listy
        this.list = this.list.filter(r => r.id !== id)
      }
    },

    // (Opcjonalnie) Pobieramy zarchiwizowane wypożyczenia
    async fetchArchived() {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('rentals')
        .select(`*, vehicles:vehicle_id(brand, model, reg_number)`)
        .eq('archived', true)
        .order('start_date', { ascending: false })

      this.loading = false
      if (error) this.error = error.message
      else      this.list  = data
    },

    // dodawanie – od razu pobieramy joined vehicles
    async addRental(payload) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('rentals')
        .insert([payload])
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            brand,
            model,
            reg_number
          )
        `)

      this.loading = false

      if (error) {
        this.error = error.message
        return null
      }

      // data[0] zawiera rental.vehicles
      this.list.unshift(data[0])
      return data[0]
    },

    // edycja – analogicznie: update + select relacji
    async updateRental(id, payload) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('rentals')
        .update({ ...payload })
        .eq('id', id)
        .select(`
          *,
          vehicles (
            brand,
            model,
            reg_number
          )
        `)

      this.loading = false

      if (error) {
        this.error = error.message
        return null
      }

      // zamieniamy tylko zmieniony element
      this.list = this.list.map(r =>
        r.id === id ? data[0] : r
      )
      return data[0]
    },

    // usuwanie
    async deleteRental(id) {
      this.loading = true
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', id)
      this.loading = false

      if (error) this.error = error.message
      else       this.list = this.list.filter(r => r.id !== id)
    },
  },
})
