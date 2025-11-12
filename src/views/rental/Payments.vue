<template>
  <v-container>
    <h2 class="text-h5 mb-4">Lista płatności</h2>

        <v-data-table
        :headers="headers"
        :items="payments"
        :loading="loading"
        density="compact"
        :items-per-page="20"
        :sort-by="['paid_at']"
        :sort-desc="[false]"
        >
        <template #item.paid_at="{ item }">
            {{ formatDate(item.paid_at) }}
        </template>

        <template #item.vehicle="{ item }">
            {{ item.rentals?.vehicles
            ? `${item.rentals.vehicles.brand} ${item.rentals.vehicles.model} (${item.rentals.vehicles.reg_number})`
            : '—' }}
        </template>

        <template #item.client="{ item }">
            {{ item.rentals
            ? `${item.rentals.client_first} ${item.rentals.client_last}`
            : '—' }}
        </template>
        </v-data-table>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const payments = ref([])
const loading  = ref(false)

const headers = [
  { title: 'Data płatności', key: 'paid_at' },
  { title: 'Samochód', key: 'vehicle' },
  { title: 'Klient', key: 'client' },
  { title: 'Kwota', key: 'amount', align: 'end' },
  { title: 'Metoda', key: 'payment_method' },
  { title: 'Notatki', key: 'notes' }
]

function formatDate(d) {
  return d
    ? new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(d))
    : '—'
}

onMounted(async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      rentals:rental_id (
        id,
        client_first,
        client_last,
        vehicles:vehicle_id (
          brand,
          model,
          reg_number
        )
      )
    `)
    .order('paid_at', { ascending: true })

  if (!error) {
    payments.value = data || []
  } else {
    console.error('Błąd pobierania płatności:', error.message)
  }
  loading.value = false
})
</script>
