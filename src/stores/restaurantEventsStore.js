import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

function todayStr() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export const useRestaurantEventsStore = defineStore('restaurantEvents', {
  state: () => ({
    upcoming: [],
    past: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchUpcoming() {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('restaurant_events')
        .select('*')
        .eq('archived', false)
        .gte('event_date', todayStr())
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true })

      this.loading = false
      if (error) this.error = error.message
      this.upcoming = data || []
    },

    async fetchPast() {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('restaurant_events')
        .select('*')
        .or(`archived.eq.true,event_date.lt.${todayStr()}`)
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: false })

      this.loading = false
      if (error) this.error = error.message
      this.past = data || []
    },

    async add(payload) {
    const rate = Number(payload.rate_per_person || 0)
    const people = Number(payload.people_count || 0)
      const insert = {
        event_date: payload.event_date,
        event_time: payload.event_time,
        title: payload.title?.trim(),
        contact_name: payload.contact_name?.trim(),
        people_count: people,
        phone: payload.phone?.trim(),
        email: payload.email?.trim() || null,
        deposit: Number(payload.deposit || 0),
        rate_per_person: rate,
        total_amount: rate * people, // 🔹 wyliczenie
        payment_method: payload.payment_method || null,
        special_requests: payload.special_requests || null,
        kitchen_notes: payload.kitchen_notes || null
      }
      const { data, error } = await supabase
        .from('restaurant_events')
        .insert([insert])
        .select('*')
        .single()

      if (error) throw error
      // Dociągnij listy na świeżo
      await this.fetchUpcoming()
      return data
    },

    async update(id, updates) {
      const rate = Number(updates.rate_per_person || 0)
      const people = Number(updates.people_count || 0)
      const patch = {
        ...updates,
        people_count: updates.people_count != null ? Number(updates.people_count) : undefined,
        deposit: updates.deposit != null ? Number(updates.deposit) : undefined,
        total_amount: rate * people
      }
      const { data, error } = await supabase
        .from('restaurant_events')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      await Promise.all([this.fetchUpcoming(), this.fetchPast()])
      return data
    },

    async archive(id) {
      const { error } = await supabase
        .from('restaurant_events')
        .update({ archived: true })
        .eq('id', id)

      if (error) throw error
      await Promise.all([this.fetchUpcoming(), this.fetchPast()])
    },

    async remove(id) {
      const { error } = await supabase
        .from('restaurant_events')
        .delete()
        .eq('id', id)
      if (error) throw error
      await Promise.all([this.fetchUpcoming(), this.fetchPast()])
    }
  }
})
