<!-- src/views/WorkshopScheduled.vue -->
<template>
  <v-container fluid class="pa-4">
    <!-- A. Nagłówek i akcje -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Umówione naprawy</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="openAddForm">
          Umów naprawę
        </v-btn>
        <v-btn
          color="secondary"
          :loading="loadingScheduled"
          class="ml-2"
          @click="fetchScheduledRepairs"
        >
          Odśwież listę
        </v-btn>
      </v-col>
    </v-row>

    <!-- B. Tabela umówionych napraw -->
    <v-data-table
      :headers="headers"
      :items="scheduledRepairs"
      :items-per-page="20"
      item-key="id"
      class="elevation-1"
      no-data-text="— Brak umówionych napraw —"
    >
      <template #item.arrival_date="{ item }">
        {{ formatDate(item.arrival_date) }}
      </template>
      <template #item.first_name="{ item }">
        {{ item.first_name || '–' }}
      </template>
      <template #item.last_name="{ item }">
        {{ item.last_name || '–' }}
      </template>
      <template #item.phone="{ item }">
        <span v-if="item.phone">
          <a :href="`tel:${item.phone.replace(/\s+/g, '')}`">
            {{ item.phone }}
          </a>
        </span>
        <span v-else>–</span>
      </template>
      <template #item.vehicle_make="{ item }">
        {{ item.vehicle_make || '–' }}
      </template>
      <template #item.vehicle_model="{ item }">
        {{ item.vehicle_model || '–' }}
      </template>
      <template #item.engine="{ item }">
        {{ item.engine || '–' }}
      </template>
      <template #item.vin="{ item }">
        {{ item.vin || '–' }}
      </template>
      <template #item.repair_description="{ item }">
        {{ item.repair_description || '–' }}
      </template>

      <!-- Edytuj -->
      <template #item.edit="{ item }">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-pencil"
          color="primary"
          @click="editScheduled(item)"
          :disabled="loadingScheduled"
        >
          Edytuj
        </v-btn>
      </template>

      <!-- Usuń -->
      <template #item.delete="{ item }">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-delete"
          color="warning"
          @click="confirmDeleteScheduled(item)"
          :disabled="loadingScheduled"
        >
          Usuń
        </v-btn>
      </template>

      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak umówionych napraw —
        </v-alert>
      </template>
    </v-data-table>

    <!-- Dialog dodawania/edycji -->
    <v-dialog v-model="showAddForm" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editing ? 'Edytuj naprawę' : 'Nowa naprawa' }}
          </span>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <WorkshopScheduledRepairForm
            :repair="editing"
            @added="onScheduledAdded"
            @updated="onScheduledUpdated"
            @cancel="closeForm"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-alert v-if="errorScheduled" color="error" variant="outlined" class="mt-4">
      {{ errorScheduled }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs }             from 'pinia'
import { useScheduledRepairsStore } from '@/stores/scheduledRepairsStore'
import WorkshopScheduledRepairForm from '@/components/workshop/WorkshopScheduledRepairForm.vue'

const store = useScheduledRepairsStore()
const { 
  scheduledRepairs,
  loadingScheduled,
  errorScheduled
} = storeToRefs(store)

const showAddForm = ref(false)
const editing     = ref(null)

const headers = [
  { title: 'Data przyjazdu', key: 'arrival_date' },
  { title: 'Imię',           key: 'first_name'   },
  { title: 'Nazwisko',       key: 'last_name'    },
  { title: 'Telefon',        key: 'phone'        },
  { title: 'Marka',          key: 'vehicle_make' },
  { title: 'Model',          key: 'vehicle_model'},
  { title: 'Silnik',         key: 'engine'       },
  { title: 'VIN',            key: 'vin'          },
  { title: 'Opis naprawy',   key: 'repair_description' },
  { title: 'Edytuj',         key: 'edit',  sortable: false },
  { title: 'Usuń',           key: 'delete', sortable: false }
]

function formatDate(d) {
  if (!d) return '–'
  const dt = new Date(d)
  return isNaN(dt) ? '–' : dt.toLocaleDateString('pl-PL')
}

onMounted(() => {
  fetchScheduledRepairs()
})

async function fetchScheduledRepairs() {
  await store.fetchScheduledRepairs()
}

function openAddForm() {
  editing.value     = null
  showAddForm.value = true
}

function closeForm() {
  showAddForm.value = false
  editing.value     = null
}

function editScheduled(item) {
  editing.value     = item
  showAddForm.value = true
}

async function confirmDeleteScheduled(item) {
  const ok = window.confirm(
    `Usunąć naprawę na ${formatDate(item.arrival_date)} dla ${item.first_name} ${item.last_name}?`
  )
  if (!ok) return

  await store.deleteScheduledRepair(item.id)
  await fetchScheduledRepairs()
}

async function onScheduledAdded() {
  closeForm()
  await fetchScheduledRepairs()
}

async function onScheduledUpdated() {
  closeForm()
  await fetchScheduledRepairs()
}
</script>

<style scoped>
.mb-4    { margin-bottom: 1rem; }
.text-h5 { font-size: 1.5rem; font-weight: 500; }
.pa-4    { padding: 1rem; }
.ml-2    { margin-left: 0.5rem; }
</style>
