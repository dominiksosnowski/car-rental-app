<!-- src/views/workshop/WorkshopPayments.vue -->
<template>
  <v-container fluid class="pa-4">

    <!-- Nagłówek i odświeżanie -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Płatności</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn
          color="secondary"
          :loading="loadingActive"
          @click="fetchRepairs"
        >
          Odśwież listę
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela z płatnościami (zakończone naprawy) -->
    <v-data-table
      :headers="headers"
      :items="payments"
      item-key="id"
      class="elevation-1"
    >
      <!-- Data płatności -->
      <template #item.payment_date="{ item }">
        {{ formatDate(item.completion_date) }}
      </template>

      <!-- Kwota -->
      <template #item.amount="{ item }">
        {{ formatCurrency(sumParts(item)) }}
      </template>

      <!-- Forma płatności -->
      <template #item.payment_method="{ item }">
        {{ item.payment_method || '–' }}
      </template>

      <!-- Brak danych -->
      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak płatności do wyświetlenia —
        </v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useActiveRepairsStore } from '@/stores/activeRepairsStore'

const store = useActiveRepairsStore()
const { workshop_active_repairs, loadingActive } = storeToRefs(store)

// Lista płatności: tylko zakończone naprawy
const payments = computed(() =>
  (workshop_active_repairs.value || []).filter(r => r.completed)
)

const headers = [
  { title: 'Data płatności',    key: 'payment_date' },
  { title: 'Kwota',             key: 'amount',         sortable: false },
  { title: 'Forma płatności',   key: 'payment_method', sortable: false },
]

async function fetchRepairs() {
  await store.fetchActiveRepairs()
}

function formatDate(date) {
  if (!date) return '–'
  const dt = new Date(date)
  return isNaN(dt) ? '–' : dt.toLocaleDateString('pl-PL')
}

function sumParts(repair) {
  return (repair.parts || []).reduce((sum, p) => sum + (p.cost || 0), 0)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value || 0)
}

onMounted(fetchRepairs)
</script>

<style scoped>
.mb-4    { margin-bottom: 1rem; }
.text-h5 { font-size: 1.5rem; font-weight: 500; }
.pa-4    { padding: 1rem; }
</style>
