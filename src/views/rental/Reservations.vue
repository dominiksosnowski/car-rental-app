<template>
  <v-container fluid class="pa-4">
    <!-- Nagłówek i akcje -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Rezerwacje</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="showAddForm = true">Nowa rezerwacja</v-btn>
        <v-btn
          color="secondary"
          :loading="loading"
          class="ml-2"
          @click="fetchReservations"
        >Odśwież listę</v-btn>
      </v-col>
    </v-row>

    <!-- MOBILE: karty -->
    <v-row v-if="$vuetify.display.smAndDown">
      <v-col v-for="item in reservations" :key="item.id" cols="12">
        <v-card outlined>
          <v-card-title class="justify-space-between">
            <span class="text-subtitle-1">
              <v-icon start color="indigo">mdi-account</v-icon>
              {{ item.first_name }} {{ item.last_name }}
            </span>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div>
              <v-icon start color="blue">mdi-calendar-start</v-icon>
              <strong>Od:</strong> {{ formatDate(item.start_date) }}
            </div>
            <div>
              <v-icon start color="blue">mdi-calendar-end</v-icon>
              <strong>Do:</strong> {{ formatDate(item.end_date) }}
            </div>
            <div>
              <v-icon start color="teal">mdi-car</v-icon>
              <strong>Pojazd:</strong>
              {{ item.vehicles?.brand || '–' }}
              {{ item.vehicles?.model || '' }}
              {{ item.vehicles?.reg_number || '–' }}
            </div>
            <div>
              <v-icon start color="green">mdi-phone</v-icon>
              <strong>Telefon:</strong>
              <a :href="`tel:${item.phone.replace(/\s+/g,'')}`" class="text-decoration-none">{{ item.phone }}</a>
            </div>
            <div>
              <v-icon start color="grey">mdi-note-text</v-icon>
              <strong>Uwagi:</strong> {{ item.notes || '–' }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn size="small" color="error" prepend-icon="mdi-delete" @click="remove(item.id)">Usuń</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- DESKTOP: tabela -->
    <v-data-table
      v-else
      :headers="headers"
      :items="reservations"
      :items-per-page="20"
      item-key="id"
      class="elevation-1"
    >
      <template #item.from="{ item }">{{ formatDate(item.start_date) }}</template>
      <template #item.to="{ item }">{{ formatDate(item.end_date) }}</template>
      <template #item.client="{ item }">{{ item.first_name }} {{ item.last_name }}</template>
      <template #item.phone="{ item }">
        <a :href="`tel:${item.phone.replace(/\s+/g,'')}`" class="text-decoration-none">{{ item.phone }}</a>
      </template>
      <template #item.vehicle="{ item }">
        {{ item.vehicles?.brand || '–' }}
        {{ item.vehicles?.model || '' }}
        {{ item.vehicles?.reg_number || '–' }}
      </template>
      <template #item.notes="{ item }">{{ item.notes || '–' }}</template>
      <template #item.delete="{ item }">
        <v-btn icon small color="error" @click="remove(item.id)"><v-icon>mdi-delete</v-icon></v-btn>
      </template>
      <template #no-data>
        <v-alert color="info" variant="outlined">— Brak rezerwacji —</v-alert>
      </template>
    </v-data-table>

    <!-- Dialog: dodawanie rezerwacji -->
    <v-dialog v-model="showAddForm" max-width="1000" persistent>
      <v-card>
        <v-card-title><span class="text-h6">Nowa rezerwacja</span></v-card-title>
        <v-divider />
        <v-card-text>
          <ReservationForm @added="onReservationAdded" @cancel="showAddForm = false" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog: edycja rezerwacji -->
    <v-dialog v-model="showEditForm" max-width="1000" persistent>
      <v-card v-if="editing">
        <v-card-title><span class="text-h6">Edytuj rezerwację</span></v-card-title>
        <v-divider />
        <v-card-text>
          <EditReservationForm :reservation="editing" @updated="onReservationUpdated" @cancel="showEditForm = false" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Błąd -->
    <v-alert v-if="error" color="error" variant="outlined" class="mt-4">{{ error }}</v-alert>
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
  { title: 'Od',    key: 'from',   sortable: false },
  { title: 'Do',    key: 'to',   sortable: false },
  { title: 'Klient',   key: 'client',   sortable: false },
  { title: 'Nr telefonu',   key: 'phone',   sortable: false },
  { title: 'Pojazd',   key: 'vehicle',  sortable: false },
  { title: 'Notatki',  key: 'notes',    sortable: false },
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
