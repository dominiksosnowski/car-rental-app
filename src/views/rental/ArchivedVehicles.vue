<!-- src/views/ArchivedVehicles.vue -->
<template>
  <v-container fluid class="pa-4">
    <!-- Nagłówek i przycisk powrotu -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Archiwum pojazdów (sprzedane)</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn text @click="$router.back()">← Powrót</v-btn>
      </v-col>
    </v-row>

    <!-- Tabela sprzedanych pojazdów -->
    <v-data-table
      :headers="headers"
      :items="archived"
      :items-per-page="5"
      item-key="id"
      class="elevation-1"
    >
      <template #item.inspection_date="{ item }">
        {{ formatDate(item.inspection_date) }}
      </template>
      <template #item.insurance_date="{ item }">
        {{ formatDate(item.insurance_date) }}
      </template>
      <template #item.archived_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak sprzedanych pojazdów —
        </v-alert>
      </template>
    </v-data-table>

    <!-- Globalny błąd -->
    <v-alert
      v-if="error"
      color="error"
      variant="outlined"
      class="mt-4"
    >
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { onMounted }    from 'vue'
import { storeToRefs }  from 'pinia'
import { useVehicleStore } from '@/stores/vehicleStore'

const store          = useVehicleStore()
const { archived, loading, error } = storeToRefs(store)

// załaduj sprzedane pojazdy
onMounted(() => store.fetchArchived())

// formatuj daty
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '–'
}

// nagłówki tabeli
const headers = [
  { title: 'Marka',        key: 'brand',         align: 'start' },
  { title: 'Model',        key: 'model' },
  { title: 'Nr rej.',      key: 'reg_number' },
  { title: 'Badanie',      key: 'inspection_date', align: 'center' },
  { title: 'Ubezpieczenie',key: 'insurance_date', align: 'center' },
  { title: 'Sprzedany',    key: 'archived_at',    align: 'center' },
]
</script>
