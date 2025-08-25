<template>
  <v-container fluid class="pa-4">
    <!-- Wyszukiwarka -->
    <v-row justify="center" class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Wyszukaj klienta lub pojazd"
          prepend-inner-icon="mdi-magnify"
          clearable
        />
      </v-col>
    </v-row>

    <!-- Wersja mobilna: karty -->
    <v-row v-if="$vuetify.display.smAndDown">
      <v-col
        v-for="item in filteredRentals"
        :key="item.id"
        cols="12"
      >
        <v-card outlined>
          <v-card-title class="justify-space-between">
            <span class="text-subtitle-1">
              <v-icon start color="primary">mdi-account</v-icon>
              {{ item.client_first }} {{ item.client_last }}
            </span>
          </v-card-title>
          <v-card-subtitle>
            <span class="text-caption">
              <v-icon start color="teal">mdi-calendar-range</v-icon>
              {{ formatDate(item.start_date) }} — {{ formatDate(item.end_date) }}
            </span>
          </v-card-subtitle>
          <v-divider />
          <v-card-text>
            <div>
              <v-icon start color="indigo">mdi-car</v-icon>
              <strong>Pojazd:</strong>
              {{ item.vehicles?.brand }} {{ item.vehicles?.model }} ({{ item.vehicles?.reg_number }})
            </div>
            <div>
              <v-icon start color="green">mdi-phone</v-icon>
              <strong>Tel.:</strong>
              <a :href="`tel:${item.client_phone?.replace(/\s+/g,'')}`">
                {{ item.client_phone || '–' }}
              </a>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Wersja desktopowa: tabela -->
    <v-data-table
      v-else
      :headers="headers"
      :items="filteredRentals"
      :items-per-page="20"
      class="elevation-1"
    >
      <template #item.from="{ item }">{{ formatDate(item.start_date) }}</template>
      <template #item.to="{ item }">{{ formatDate(item.end_date) }}</template>
      <template #item.client="{ item }">{{ item.client_first }} {{ item.client_last }}</template>
      <template #item.phone="{ item }">
        <a :href="`tel:${item.client_phone.replace(/\s+/g,'')}`">{{ item.client_phone }}</a>
      </template>
      <template #item.vehicle="{ item }">
        {{ item.vehicles?.brand || '–' }} {{ item.vehicles?.model || '' }} {{ item.vehicles?.reg_number || '–' }}
      </template>
      <template #no-data>
        <v-alert type="info" variant="outlined">— Brak pasujących wypożyczeń —</v-alert>
      </template>
    </v-data-table>

    <!-- Loader -->
    <v-progress-linear v-if="loading" indeterminate color="primary" />
  </v-container>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRentalStore } from '@/stores/rentalStore'

const rentalStore = useRentalStore()
const { list: rentals, loading } = storeToRefs(rentalStore)

const searchQuery = ref('')

watch(searchQuery, async (val) => {
  if (val.trim().length >= 2) {
    await rentalStore.fetchArchived({ search: val.trim() })
  }
})

const filteredRentals = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return rentals.value.filter(r => {
    const fullName = `${r.client_first} ${r.client_last}`.toLowerCase()
    const vehicle = `${r.vehicles?.brand || ''} ${r.vehicles?.model || ''} ${r.vehicles?.reg_number || ''}`.toLowerCase()
    return fullName.includes(query) || vehicle.includes(query)
  })
})

const headers = [
  { title: 'Od', key: 'from' },
  { title: 'Do', key: 'to' },
  { title: 'Pojazd', key: 'vehicle' },
  { title: 'Klient', key: 'client' },
  { title: 'Numer telefonu', key: 'phone' },
]

function formatDate(dateStr) {
  if (!dateStr) return '–'
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(dateStr))
}
</script>
