// src/stores/scheduledRepairsStore.js
import { defineStore } from 'pinia'
import { supabase }   from '@/supabase'

export const useScheduledRepairsStore = defineStore('scheduledRepairs', {
  state: () => ({
    // lista umówionych (planned) napraw
    scheduledRepairs: [],

    // flagi ładowania i błędów dla umówionych napraw
    loadingScheduled: false,
    errorScheduled:   null,
  }),

  getters: {
    // dostęp do wszystkich zaplanowanych napraw
    allScheduledRepairs: (state) => state.scheduledRepairs,
  },

  actions: {
    // 1. Pobierz listę umówionych napraw
    async fetchScheduledRepairs() {
      this.loadingScheduled = true
      this.errorScheduled   = null

      const { data, error } = await supabase
        .from('workshop_scheduled_repairs')
        .select('*')
        .order('arrival_date', { ascending: true })

      if (error) {
        console.error('fetchScheduledRepairs error:', error)
        this.errorScheduled = error.message
      } else {
        this.scheduledRepairs = data
      }

      this.loadingScheduled = false
      return data
    },

    // 2. Dodaj nową umówioną naprawę
    async createScheduledRepair(payload) {
      this.loadingScheduled = true
      this.errorScheduled   = null

      const { data, error } = await supabase
        .from('workshop_scheduled_repairs')
        .insert(payload)
        .single()

      if (error) {
        console.error('createScheduledRepair error:', error)
        this.errorScheduled   = error.message
        this.loadingScheduled = false
        return null
      }

      // dopisz na początek listy
      this.scheduledRepairs.unshift(data)
      this.loadingScheduled = false
      return data
    },

    // 3. Zaktualizuj istniejącą umówioną naprawę
    async updateScheduledRepair(id, payload) {
      this.loadingScheduled = true
      this.errorScheduled   = null

      const { data, error } = await supabase
        .from('workshop_scheduled_repairs')
        .update(payload)
        .eq('id', id)
        .single()

      if (error) {
        console.error('updateScheduledRepair error:', error)
        this.errorScheduled   = error.message
        this.loadingScheduled = false
        return null
      }

      // zastąp zaktualizowany rekord w tablicy
      const idx = this.scheduledRepairs.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.scheduledRepairs.splice(idx, 1, data)
      }

      this.loadingScheduled = false
      return data
    },

    // 4. Usuń umówioną naprawę
    async deleteScheduledRepair(id) {
      this.loadingScheduled = true
      this.errorScheduled   = null

      const { error } = await supabase
        .from('workshop_scheduled_repairs')
        .delete()
        .eq('id', id)
        .single()

      if (error) {
        console.error('deleteScheduledRepair error:', error)
        this.errorScheduled   = error.message
        this.loadingScheduled = false
        return false
      }

      // usuń z lokalnej tablicy
      this.scheduledRepairs = this.scheduledRepairs.filter(r => r.id !== id)
      this.loadingScheduled = false
      return true
    },
  }
})
