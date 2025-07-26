// src/stores/vehicleStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useVehicleStore = defineStore('vehicle', {
  state: () => ({
    // lista aktywnych (nie sprzedanych)
    list: [],
    // lista sprzedanych/archiwalnych
    archived: [],
    loading: false,
    error:   null,
  }),

  actions: {
    /**
     * Pobierz wszystkie pojazdy nieoznaczone jako sprzedane
     */
    async fetchActive() {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) {
        this.error = error.message
      } else {
        this.list = data
      }

      this.loading = false
    },

    /**
     * Pobierz wszystkie pojazdy oznaczone jako sprzedane
     */
    async fetchArchived() {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('archived', true)
        .order('created_at',   { ascending: false })

      if (error) {
        this.error = error.message
      } else {
        this.archived = data
      }

      this.loading = false
    },

    /**
     * Dodaj nowy pojazd – zawsze archived: false
     */
    async addVehicle(payload) {
      this.loading = true
      this.error   = null

      const toInsert = { ...payload, archived: false }
      const { data, error } = await supabase
        .from('vehicles')
        .insert([toInsert])
        .select()

      this.loading = false

      if (error) {
        this.error = error.message
        return null
      }

      // dodajemy na początek listy aktywnych
      this.list.unshift(data[0])
      return data[0]
    },

    /**
     * Aktualizuj dane pojazdu
     */
    async updateVehicle(id, payload) {
      this.loading = true
      this.error   = null

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

      // zamieniamy w liście aktywnych
      this.list = this.list.map(v => v.id === id ? data[0] : v)
      return data[0]
    },

    /**
     * Oznacz pojazd jako sprzedany (archiwizuj):
     *  - ustawia archived=true
     *  - usuwa z listy aktywnych
     *  - dopisuje do archiwum
     */
    async archiveVehicle(id) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('vehicles')
        .update({ archived: true })
        .eq('id', id)
        .select()

      this.loading = false

      if (error) {
        this.error = error.message
      } else {
        // odfiltruj z aktywnych
        this.list = this.list.filter(v => v.id !== id)
        // dopisz do archiwum
        this.archived.unshift(data[0])
      }
    }
  }
})
