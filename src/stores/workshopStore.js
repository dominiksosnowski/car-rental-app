// src/stores/workshopStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useWorkshopStore = defineStore('workshop', {
  state: () => ({
    customers: [],
    vehicles: [],
    orders: [],
    parts: [],
    loading: false
  }),

  actions: {
    async fetchAll() {
      this.loading = true

      // pobierz klientów
      const { data: customers, error: cErr } =
        await supabase.from('workshop_customers').select('*')
      if (cErr) throw cErr
      this.customers = customers

      // pobierz pojazdy
      const { data: vehicles, error: vErr } =
        await supabase.from('workshop_vehicles').select('*')
      if (vErr) throw vErr
      this.vehicles = vehicles

      // pobierz zlecenia + relacje
      const { data: orders, error: oErr } = await supabase
        .from('workshop_repair_orders')
        .select(`
          *,
          workshop_customers (
            first_name, last_name, phone
          ),
          workshop_vehicles (
            brand, model, engine, vin
          )
        `)
      if (oErr) throw oErr
      this.orders = orders

      // pobierz części
      const { data: parts, error: pErr } =
        await supabase.from('workshop_repair_parts').select('*')
      if (pErr) throw pErr
      this.parts = parts

      this.loading = false
    },

    async addOrder(payload) {
      const { data, error } = await supabase
        .from('workshop_repair_orders')
        .insert(payload)
        .single()
      if (error) throw error
      this.orders.push(data)
      return data
    },

    async updateOrder(id, payload) {
      const { data, error } = await supabase
        .from('workshop_repair_orders')
        .update(payload)
        .eq('id', id)
        .single()
      if (error) throw error

      const idx = this.orders.findIndex(o => o.id === id)
      if (idx !== -1) this.orders[idx] = data
      return data
    },

    async deleteOrder(id) {
      const { error } = await supabase
        .from('workshop_repair_orders')
        .delete()
        .eq('id', id)
      if (error) throw error
      this.orders = this.orders.filter(o => o.id !== id)
    },

    async archiveOrder(id) {
      return this.updateOrder(id, { status: 'archived' })
    }
  }
})
