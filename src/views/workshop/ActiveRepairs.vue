<!-- src/views/workshop/ActiveRepairs.vue -->
<template>
  <v-container fluid class="pa-4">
    <!-- Nagłówek i akcje -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Aktualne naprawy</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="openAdd">Dodaj naprawę</v-btn>
        <v-btn
          color="secondary"
          :loading="loadingActive"
          @click="fetchActive"
        >
          Odśwież listę
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela z rozwijanymi wierszami -->
    <v-data-table
      :headers="headers"
      :items="activeRepairs"
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

      <!-- 8. Zakończ -->
      <template #item.finish="{ item }">
        <v-btn
          small
          color="primary"
          :disabled="item.completed || loadingActive"
          @click="finishRepair(item)"
        >
          Zakończ
        </v-btn>
      </template>

      <!-- 9. Akcje -->
      <template #item.actions="{ item }">
        <v-btn icon dense @click="openEdit(item)">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
      </template>

      <!-- 10. Expanded row -->
      <template #expanded-row="{ item }">
        <tr>
          <td :colspan="headers.length">
            <v-card flat class="pa-4">
              <RepairPartsList
                :repairId="item.id"
                @added="fetchActive"
              />
            </v-card>
          </td>
        </tr>
      </template>

      <!-- 11. No data -->
      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak aktywnych (niezakończonych) napraw —
        </v-alert>
      </template>
    </v-data-table>

    <!-- Dialog dodawania/edycji naprawy -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-toolbar flat color="primary" dark>
          <v-toolbar-title>
            {{ selectedRepair ? 'Edytuj naprawę' : 'Dodaj naprawę' }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <ActiveRepairForm
            :repair="selectedRepair"
            @added="onAdded"
            @updated="onUpdated"
            @cancel="closeDialog"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useActiveRepairsStore } from '@/stores/activeRepairsStore'
import ActiveRepairForm from '@/components/workshop/ActiveRepairForm.vue'
import RepairPartsList from '@/components/workshop/RepairPartsList.vue'

// Pinia store
const store = useActiveRepairsStore()
const { workshop_active_repairs, loadingActive } = storeToRefs(store)

// Filtrujemy tylko naprawy niezakończone
const activeRepairs = computed(() =>
  (workshop_active_repairs.value || []).filter(r => !r.completed)
)

const expanded      = ref([])
const dialog        = ref(false)
const selectedRepair= ref(null)

function openAdd() {
  selectedRepair.value = null
  dialog.value = true
}

function openEdit(item) {
  selectedRepair.value = { ...item }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
}

async function onAdded() {
  closeDialog()
  await fetchActive()
}

async function onUpdated() {
  closeDialog()
  await fetchActive()
}

const headers = [
  { title: 'Data przyjazdu',   key: 'arrival_date' },
  { title: 'Data zakończenia', key: 'completion_date' },
  { title: 'Klient',           key: 'client' },
  { title: 'Telefon',          key: 'phone' },
  { title: 'Marka i model',    key: 'vehicle' },
  { title: 'VIN',              key: 'vin' },
  { title: 'Kwota do zapłaty', key: 'total',    sortable: false },
  { title: 'Edytuj',            key: 'actions',  sortable: false },
  { title: 'Zakończ',          key: 'finish',   sortable: false },
]

async function fetchActive() {
  await store.fetchActiveRepairs()
}

async function finishRepair(item) {
  await store.updateActiveRepair(item.id, { completed: true })
  await fetchActive()
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

onMounted(fetchActive)
</script>

<style scoped>
.mb-4    { margin-bottom: 1rem; }
.text-h5 { font-size: 1.5rem; font-weight: 500; }
.pa-4    { padding: 1rem; }
</style>
