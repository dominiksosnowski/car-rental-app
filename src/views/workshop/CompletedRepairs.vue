<!-- src/views/workshop/CompletedRepairs.vue -->
<template>
  <v-container fluid class="pa-4">

    <!-- Nagłówek i odświeżanie -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Zakończone naprawy</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn
          color="secondary"
          :loading="loadingActive"
          @click="fetchCompleted"
        >
          Odśwież listę
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela tylko z zakończonymi naprawami -->
    <v-data-table
      :headers="headers"
      :items="completedRepairs"
      item-key="id"
      show-expand
      v-model:expanded="expanded"
      class="elevation-1"
    >
      <!-- 1. Data przyjazdu -->
      <template #item.arrival_date="{ item }">
        {{ formatDate(item.arrival_date) }}
      </template>

      <!-- 2. Data zakończenia -->
      <template #item.completion_date="{ item }">
        {{ formatDate(item.completion_date) }}
      </template>

      <!-- 3. Klient -->
      <template #item.client="{ item }">
        {{ item.first_name }} {{ item.last_name }}
      </template>

      <!-- 4. Telefon -->
      <template #item.phone="{ item }">
        <span v-if="item.phone">
          <a :href="`tel:${item.phone.replace(/\s+/g, '')}`">
            {{ item.phone }}
          </a>
        </span>
        <span v-else>–</span>
      </template>

      <!-- 5. Marka i model -->
      <template #item.vehicle="{ item }">
        {{ item.vehicle_make }} {{ item.vehicle_model }}
      </template>

      <!-- 6. VIN -->
      <template #item.vin="{ item }">
        {{ item.vin }}
      </template>

      <!-- 7. Kwota do zapłaty -->
      <template #item.total="{ item }">
        {{ formatCurrency(sumParts(item)) }}
      </template>

      <!-- 8. Sposób zapłaty -->
      <template #item.payment_method="{ item }">
        {{ item.payment_method || '–' }}
      </template>

      <!-- Expanded row ze szczegółami części -->
      <template #expanded-row="{ item }">
        <tr>
          <td :colspan="headers.length">
            <v-card flat class="pa-4">
              <FinishedRepairPartsList
                :repairId="item.id"
              />
            </v-card>
          </td>
        </tr>
      </template>

      <!-- Brak danych -->
      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak zakończonych napraw —
        </v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useActiveRepairsStore } from '@/stores/activeRepairsStore'
import FinishedRepairPartsList from '@/components/workshop/FinishedRepairPartsList.vue'

const store = useActiveRepairsStore()
const { workshop_active_repairs, loadingActive } = storeToRefs(store)

// Filtrujemy tylko naprawy zakończone
const completedRepairs = computed(() =>
  (workshop_active_repairs.value || []).filter(r => r.completed)
)

const expanded = ref([])

const headers = [
  { title: 'Data przyjazdu',    key: 'arrival_date' },
  { title: 'Data zakończenia',  key: 'completion_date' },
  { title: 'Klient',            key: 'client' },
  { title: 'Telefon',           key: 'phone' },
  { title: 'Marka i model',     key: 'vehicle' },
  { title: 'VIN',               key: 'vin' },
  { title: 'Zapłacono',  key: 'total',          sortable: false },
  { title: 'Sposób zapłaty',    key: 'payment_method', sortable: false },
]

async function fetchCompleted() {
  await store.fetchActiveRepairs()
}

function formatDate(d) {
  if (!d) return '–'
  const dt = new Date(d)
  return isNaN(dt) ? '–' : dt.toLocaleDateString('pl-PL')
}

function sumParts(repair) {
  return (repair.parts || []).reduce((sum, p) => sum + (p.cost || 0), 0)
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(val || 0)
}

onMounted(fetchCompleted)
</script>

<style scoped>
.mb-4    { margin-bottom: 1rem; }
.text-h5 { font-size: 1.5rem; font-weight: 500; }
.pa-4    { padding: 1rem; }
</style>
