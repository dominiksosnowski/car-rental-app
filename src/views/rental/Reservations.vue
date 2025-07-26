<!-- src/views/rental/Reservations.vue -->
<template>
  <v-container fluid class="pa-4">
    <!-- Nagłówek i akcje -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Rezerwacje</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="showAddForm = true">
          Nowa rezerwacja
        </v-btn>
        <v-btn
          color="secondary"
          :loading="loading"
          class="ml-2"
          @click="fetchReservations"
        >
          Odśwież listę
        </v-btn>
      </v-col>
    </v-row>

    <!-- Dialog: dodawanie rezerwacji -->
    <v-dialog v-model="showAddForm" max-width="1000" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">Nowa rezerwacja</span>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <ReservationForm
            @added="onReservationAdded"
            @cancel="showAddForm = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Tabela rezerwacji -->
    <v-data-table
      :headers="headers"
      :items="reservations"
      :items-per-page="20"
      item-key="id"
      class="elevation-1"
    >
      <template #item.client="{ item }">
        {{ item.first_name }} {{ item.last_name }} 
      </template>
      <template #item.phone="{ item }">
         <a :href="`tel:${item.phone.replace(/\s+/g,'')}`" class="text-decoration-none">{{ item.phone }}</a>
      </template>
      <template #item.vehicle="{ item }">
        {{ item.vehicles?.brand || '–' }}
        {{ item.vehicles?.model || '' }}
        ({{ item.vehicles?.reg_number || '–' }})
      </template>
      <template #item.period="{ item }">
        {{ formatDate(item.start_date) }} – {{ formatDate(item.end_date) }}
      </template>
      <template #item.notes="{ item }">
        {{ item.notes || '–' }}
      </template>
      <template #item.edit="{ item }">
        <v-btn icon small @click="startEdit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template #item.delete="{ item }">
        <v-btn icon small color="error" @click="remove(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak rezerwacji —
        </v-alert>
      </template>
    </v-data-table>

    <!-- Dialog: edycja rezerwacji -->
    <v-dialog v-model="showEditForm" max-width="1000" persistent>
      <v-card v-if="editing">
        <v-card-title>
          <span class="text-h6">Edytuj rezerwację</span>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <EditReservationForm
            :reservation="editing"
            @updated="onReservationUpdated"
            @cancel="showEditForm = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Błąd -->
    <v-alert v-if="error" color="error" variant="outlined" class="mt-4">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted }      from 'vue'
import { storeToRefs }         from 'pinia'
import ReservationForm         from '@/components/rental/ReservationForm.vue'
import EditReservationForm     from '@/components/rental/EditReservationForm.vue'
import { useReservationStore } from '@/stores/reservationStore'

const store = useReservationStore()
const { list: reservations, loading, error } = storeToRefs(store)

const showAddForm  = ref(false)
const showEditForm = ref(false)
const editing      = ref(null)

const headers = [
  { title: 'Klient',   key: 'client',   sortable: false },
  { title: 'Nr telefonu',   key: 'phone',   sortable: false },
  { title: 'Pojazd',   key: 'vehicle',  sortable: false },
  { title: 'Okres',    key: 'period',   sortable: false },
  { title: 'Notatki',  key: 'notes',    sortable: false },
  { title: 'Edytuj',   key: 'edit',     sortable: false, align: 'center' },
  { title: 'Usuń',     key: 'delete',   sortable: false, align: 'center' },
]

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '–'
}

async function fetchReservations() {
  await store.fetchAll()
}

onMounted(fetchReservations)

async function onReservationAdded() {
  showAddForm.value = false
  await fetchReservations()
}

function startEdit(r) {
  editing.value = { ...r }
  showEditForm.value = true
}

async function onReservationUpdated() {
  showEditForm.value = false
  editing.value = null
  await fetchReservations()
}

async function remove(id) {
  if (!confirm('Usuń tę rezerwację?')) return
  await store.deleteReservation(id)
  await fetchReservations()
}
</script>
