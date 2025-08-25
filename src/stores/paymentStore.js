// src/stores/paymentStore.js
import { defineStore } from 'pinia'
import { supabase }    from '@/lib/supabase'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    list:    [],     // wszystkie wpłaty
    loading: false,
    error:   null,
  }),

  actions: {
    // Pobierz wszystkie wpłaty
    async fetchAll() {
      this.loading = true
      this.error   = null
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('paid_at', { ascending: true })
      this.loading = false

      if (error) this.error = error.message
      else      this.list  = data
    },

    // Pobierz wpłaty dla jednego wypożyczenia
    async fetchByRental(rentalId) {
      this.loading = true
      this.error   = null
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('paid_at', { ascending: true })
      this.loading = false

      if (error) this.error = error.message
      else      this.list  = data
    },

    // Dodaj wpłatę
    async addPayment({ rental_id, amount, payment_method, notes, paid_at }) {
      this.loading = true
      this.error   = null
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          rental_id,
          amount,
          payment_method,
          notes,
          paid_at,
        }])
        .select()
      this.loading = false

      if (error) {
        this.error = error.message
        return null
      }
      this.list.push(data[0])
      return data[0]
    },

    // Usuń wpłatę
    async deletePayment(id) {
      this.loading = true
      this.error   = null
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
      this.loading = false

      if (error) {
        this.error = error.message
      } else {
        this.list = this.list.filter(p => p.id !== id)
      }
    },
  },
})
