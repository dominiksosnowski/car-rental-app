<!-- src/views/workshop/CompletedRepairs.vue -->
<template>
  <v-container fluid class="pa-4">

    <!-- Nagłówek i odświeżanie -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Zakończone naprawy</h2>
      </v-col>
    </v-row>

    <!-- Tabela tylko z zakończonymi naprawami -->
      <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Szukaj po kliencie, marce lub modelu"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <!-- MOBILE: karty -->
    <v-row v-if="$vuetify.display.smAndDown" dense>
      <v-col v-for="repair in filteredRepairs" :key="repair.id" cols="12">
        <v-card outlined>
          <v-card-title class="d-flex align-center">
          
                         <v-icon start color="blue">mdi-account</v-icon>
              {{ repair.first_name }} {{ repair.last_name }}
          </v-card-title>
          <v-card-subtitle>
              <v-icon start color="primary">mdi-calendar</v-icon>
              {{ formatDate(repair.arrival_date) }} → {{ formatDate(repair.completion_date) || "Brak daty"}}
          </v-card-subtitle>
          <v-divider />

          <v-list dense>
            <v-list-item>
                <div>
              <v-icon start color="pink">mdi-cash</v-icon> Zapłacono <strong>{{ formatCurrency(sumParts(repair)) }}</strong>
            </div>
 
            </v-list-item>
            <v-list-item>
              <v-icon start color="green">mdi-phone</v-icon>
              <a v-if="repair.phone" :href="`tel:${repair.phone.replace(/\s+/g, '')}`">{{ repair.phone }}</a>
              <span v-else>brak</span>
            </v-list-item>
            <v-list-item>
              <v-icon start color="orange">mdi-car</v-icon>
              {{ repair.vehicle_make }} {{ repair.vehicle_model }}
            </v-list-item>
            <v-list-item>
              <v-icon start color="purple">mdi-pound</v-icon>
              VIN: {{ repair.vin }}
            </v-list-item>
              <v-btn
                size="large"
                block
                variant="outlined"
                color="primary"
                @click="toggleExpand(repair.id)"
              >
                <v-icon>{{ expanded.includes(repair.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>Lista części 
              </v-btn>
          </v-list>

          <v-expand-transition>
            <div v-if="expanded.includes(repair.id)">
              <v-divider />
              <FinishedRepairPartsList :repairId="repair.id" />
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <!-- DESKTOP: tabela -->
    <v-data-table
      v-else
      :headers="headers"
      :items="filteredRepairs"
      item-key="id"
      show-expand
      v-model:expanded="expanded"
      class="elevation-1"
    >
      <!-- sloty kolumn tak jak w Twoim obecnym kodzie -->
      <template #item.arrival_date="{ item }">{{ formatDate(item.arrival_date) }}</template>
      <template #item.completion_date="{ item }">{{ formatDate(item.completion_date) }}</template>
      <template #item.client="{ item }">{{ item.first_name }} {{ item.last_name }}</template>
      <template #item.phone="{ item }">
        <span v-if="item.phone"><a :href="`tel:${item.phone.replace(/\s+/g, '')}`">{{ item.phone }}</a></span>
        <span v-else>brak</span>
      </template>
      <template #item.vehicle="{ item }">{{ item.vehicle_make }} {{ item.vehicle_model }}</template>
      <template #item.vin="{ item }">{{ item.vin }}</template>
      <template #item.total="{ item }">{{ formatCurrency(sumParts(item)) }}</template>
      <template #item.payment_method="{ item }">{{ item.payment_method || 'brak' }}</template>

      <template #expanded-row="{ item }">
        <tr>
          <td :colspan="headers.length">
            <v-card flat class="pa-4">
              <FinishedRepairPartsList :repairId="item.id" />
            </v-card>
          </td>
        </tr>
      </template>

      <template #no-data>
        <v-alert color="info" variant="outlined">— Brak zakończonych napraw —</v-alert>
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
  if (!d) return 'brak'
  const dt = new Date(d)
  return isNaN(dt) ? 'brak' : dt.toLocaleDateString('pl-PL')
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

const search = ref('')

const filteredRepairs = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return completedRepairs.value

  return completedRepairs.value.filter(r => {
    const client = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase()
    const make   = (r.vehicle_make || '').toLowerCase()
    const model  = (r.vehicle_model || '').toLowerCase()
    return client.includes(term) || make.includes(term) || model.includes(term)
  })
})
function toggleExpand(id) {
  if (expanded.value.includes(id)) {
    expanded.value = expanded.value.filter(e => e !== id)
  } else {
    expanded.value.push(id)
  }
}

</script>

<style scoped>
.mb-4    { margin-bottom: 1rem; }
.text-h5 { font-size: 1.5rem; font-weight: 500; }
.pa-4    { padding: 1rem; }
</style>
