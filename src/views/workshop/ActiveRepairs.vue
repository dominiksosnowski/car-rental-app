<template>
  <v-container fluid class="pa-4">
    <!-- Nagłówek i akcje -->
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
      <v-col cols="12" md="8" class="text-right">
        <v-btn color="primary" @click="openAdd">Dodaj naprawę</v-btn>
      </v-col>
    </v-row>

    <!-- MOBILE: karty -->
    <v-row v-if="$vuetify.display.smAndDown">
      <v-col v-for="item in activeRepairs" :key="item.id" cols="12">
        <v-card outlined>
          <v-card-title class="justify-space-between">
            <span class="text-subtitle-1">
              <v-icon start color="indigo">mdi-car-wrench</v-icon>
              {{ item.vehicle_make }} {{ item.vehicle_model }}
            </span>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div>
              <v-icon start color="blue">mdi-calendar-arrow-right</v-icon>
              <strong>Przyjęcie:</strong> {{ formatDate(item.arrival_date) }}
            </div>
            <div>
              <v-icon start color="blue">mdi-calendar-check</v-icon>
              <strong>Planowane zakończenie:</strong> {{ formatDate(item.completion_date) }}
            </div>
            <div>
              <v-icon start color="teal">mdi-account</v-icon>
              <strong>Klient:</strong> {{ item.first_name }} {{ item.last_name }}
            </div>
            <div>
              <v-icon start color="green">mdi-phone</v-icon>
              <strong>Telefon:</strong>
              <a v-if="item.phone" :href="`tel:${item.phone.replace(/\s+/g, '')}`">{{ item.phone }}</a>
              <span v-else>–</span>
            </div>
            <div>
              <v-icon start color="grey">mdi-card-account-details</v-icon>
              <strong>VIN:</strong> {{ item.vin || '–' }}
            </div>
            <div>
              <v-icon start color="orange">mdi-currency-usd</v-icon>
              <strong>Kwota:</strong> {{ formatCurrency(sumParts(item)) }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn size="small" prepend-icon="mdi-pencil" @click="openEdit(item)">Edytuj</v-btn>
            <v-btn size="small" color="primary" prepend-icon="mdi-check"
                   :disabled="item.completed || loadingActive"
                   @click="finishRepair(item)">Zakończ</v-btn>
          </v-card-actions>
          <!-- Lista części jako rozwijana sekcja -->
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon start>mdi-tools</v-icon> Części
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <RepairPartsList :repairId="item.id" @added="fetchActive" />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>

    <!-- DESKTOP: tabela z expand -->
    <v-data-table
      v-else
      :headers="headers"
      :items="activeRepairs"
      item-key="id"
      show-expand
      v-model:expanded="expanded"
      class="elevation-1"
    >
      <template #item.arrival_date="{ item }">{{ formatDate(item.arrival_date) }}</template>
      <template #item.completion_date="{ item }">{{ formatDate(item.completion_date) }}</template>
      <template #item.client="{ item }">{{ item.first_name }} {{ item.last_name }}</template>
      <template #item.phone="{ item }">
        <span v-if="item.phone"><a :href="`tel:${item.phone.replace(/\s+/g, '')}`">{{ item.phone }}</a></span>
        <span v-else>–</span>
      </template>
      <template #item.vehicle="{ item }">{{ item.vehicle_make }} {{ item.vehicle_model }}</template>
      <template #item.vin="{ item }">{{ item.vin }}</template>
      <template #item.total="{ item }">{{ formatCurrency(sumParts(item)) }}</template>
      <template #item.finish="{ item }">
        <v-btn small color="primary" :disabled="item.completed || loadingActive" @click="finishRepair(item)">Zakończ</v-btn>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon dense @click="openEdit(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
      </template>
      <template #expanded-row="{ item }">
        <tr>
          <td :colspan="headers.length">
            <v-card flat class="pa-4">
              <RepairPartsList :repairId="item.id" @added="fetchActive" />
            </v-card>
          </td>
        </tr>
      </template>
      <template #no-data>
        <v-alert color="info" variant="outlined">— Brak aktywnych (niezakończonych) napraw —</v-alert>
      </template>
    </v-data-table>

    <!-- Dialog dodawania/edycji naprawy -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-toolbar flat color="primary" dark>
          <v-toolbar-title>{{ selectedRepair ? 'Edytuj naprawę' : 'Dodaj naprawę' }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
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
const search = ref('')

const activeRepairs = computed(() => {
  const term = search.value.trim().toLowerCase()
  return (workshop_active_repairs.value || [])
    .filter(r => !r.completed)
    .filter(r => {
      if (!term) return true
      const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase()
      const make = (r.vehicle_make || '').toLowerCase()
      const model = (r.vehicle_model || '').toLowerCase()
      return (
        fullName.includes(term) ||
        make.includes(term) ||
        model.includes(term)
      )
    })
})


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
