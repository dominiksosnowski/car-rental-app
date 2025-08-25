import { defineStore } from 'pinia'
import { supabase }    from '@/lib/supabase'
import { useAuthStore } from './authStore'

// … importy jak poprzednio …
export const useReservationStore = defineStore('reservation', {
  state: () => ({ list: [], loading: false, error: null }),
  actions: {
    async fetchAll() {
      this.loading = true
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            vehicles:vehicle_id ( brand, model, reg_number )
          `)
        .order('start_date', { ascending: true })

      if (error) this.error = error.message
      else     this.list  = data

      this.loading = false
    },

async addReservation(payload) {
    this.loading = true
    this.error   = null

    const { data, error } = await supabase
      .from('reservations')
      .insert([payload])
      .select()              // tylko pola tabeli, bez joinów

    this.loading = false

    if (error) {
      this.error = error.message
      return null
    }

    // usuń: this.list.push(data[0])
    return data[0]
  },

    async updateReservation(id, payload) {
      this.loading = true
      this.error   = null

      const { data, error } = await supabase
        .from('reservations')
        .update({ ...payload })
        .eq('id', id)
        .select()

      this.loading = false
      if (error) {
        this.error = error.message
        return null
      }


      return data[0]
    },

    async deleteReservation(id) {
      this.loading = true
      this.error   = null

      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)

      this.loading = false
      if (error) {
        this.error = error.message
      } else {
        this.list = this.list.filter(r => r.id !== id)
      }
    },

    async hasConflict(vehicleId, startDate, endDate) {
  // szukamy istnienia rezerwacji o nakładającym się okresie
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('vehicle_id', vehicleId)
    // nowa start < istniejące end AND nowy end > istniejące start
    .lt('start_date', endDate)
    .gt('end_date', startDate);

  if (error) {
    throw new Error(error.message);
  }
  return data.length > 0;
}

  },
})