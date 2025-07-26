<!-- src/views/vehicles/Vehicles.vue -->
<template>
  <v-container fluid class="pa-4">
    <!-- Header i przyciski -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Pojazdy: {{ vehicles.length }}</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="showAddForm = true">
          Nowy pojazd
        </v-btn>
        <v-btn
          color="secondary"
          :loading="loading"
          class="ml-2"
          @click="fetchActive"
        >
          Odśwież
        </v-btn>
        <v-btn text class="ml-4" @click="$router.push({ name: 'ArchivedVehicles' })">
          Sprzedane →
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela pojazdów -->
    <v-data-table
      :headers="headers"
      :items="vehicles"
      :items-per-page="30"
      item-key="id"
      class="elevation-1"
    >
      <template #item.inspection_date="{ item }">
        {{ formatDateLong(item.inspection_date) }}
      </template>
      <template #item.insurance_date="{ item }">
        {{ formatDateLong(item.insurance_date) }}
      </template>
      <template #item.earnings="{ item }">
        {{ formatCurrency(earningsByVehicle[item.id] || 0) }}
      </template>

      <!-- Edytuj -->
      <template #item.edit="{ item }">
        <v-btn icon small @click="startEdit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>

      <!-- Sprzedaj -->
      <template #item.delete="{ item }">
        <v-btn icon small color="success" @click="archive(item.id)">
          <v-icon>mdi-cash</v-icon>
        </v-btn>
      </template>

      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak pojazdów —
        </v-alert>
      </template>
    </v-data-table>

    <!-- Dialog: dodawanie pojazdu -->
    <v-dialog v-model="showAddForm" max-width="1000" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">Nowy pojazd</span>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <VehicleForm
            @added="onAdded"
            @cancel="showAddForm = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog: edycja pojazdu -->
    <v-dialog v-model="showEditForm" max-width="1000" persistent>
      <v-card v-if="editingVehicle">
        <v-card-title>
          <span class="text-h6">Edytuj pojazd</span>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <EditVehicleForm
            :vehicle="editingVehicle"
            @updated="onUpdated"
            @cancel="showEditForm = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Błąd globalny -->
    <v-alert v-if="error" color="error" variant="outlined" class="mt-4">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed }  from 'vue'
import { storeToRefs }               from 'pinia'
import VehicleForm                   from '@/components/rental/VehicleForm.vue'
import EditVehicleForm               from '@/components/rental/EditVehicleForm.vue'
import { useVehicleStore }           from '@/stores/vehicleStore'
import { useRentalStore }            from '@/stores/rentalStore'
import { usePaymentStore }           from '@/stores/paymentStore'

const vehicleStore = useVehicleStore()
const rentalStore  = useRentalStore()
const paymentStore = usePaymentStore()

// listy i stany błędów/loading
const { list: vehicles, loading, error } = storeToRefs(vehicleStore)
const { list: rentals }                  = storeToRefs(rentalStore)
const { list: payments }                 = storeToRefs(paymentStore)

// formularze
const showAddForm    = ref(false)
const showEditForm   = ref(false)
const editingVehicle = ref(null)

// init danych
onMounted(async () => {
  await fetchActive()
  await rentalStore.fetchAll()
  await paymentStore.fetchAll()
})

// fetch only active (niearchiwalne)
function fetchActive() {
  return vehicleStore.fetchActive()
}

// po dodaniu
async function onAdded() {
  showAddForm.value = false
  await fetchActive()
}

// edycja
function startEdit(v) {
  editingVehicle.value = { ...v }
  showEditForm.value    = true
}
async function onUpdated() {
  showEditForm.value   = false
  editingVehicle.value = null
  await fetchActive()
}

// archiwizacja
async function archive(id) {
  if (!confirm('Oznaczyć jako sprzedany?')) return
  await vehicleStore.archiveVehicle(id)
}

// pomocnik: formatowanie dat z nazwami miesięcy
function formatDateLong(dateStr) {
  if (!dateStr) return '–'
  return new Intl.DateTimeFormat('pl-PL', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  }).format(new Date(dateStr))
}

// pomocnik: formatowanie waluty
function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(val || 0)
}

// obliczamy sumę wpłat dla każdego pojazdu
const earningsByVehicle = computed(() => {
  return rentals.value.reduce((acc, r) => {
    const sumForThisRent = payments.value
      .filter(p => p.rental_id === r.id)
      .reduce((s, p) => s + Number(p.amount), 0)
    acc[r.vehicle_id] = (acc[r.vehicle_id] || 0) + sumForThisRent
    return acc
  }, {})
})

// nagłówki tabeli (dodaliśmy kolumnę earnings)
const headers = [
  { title: 'Samochód',      key: 'brand',         align: 'start' },
  { title: 'Model',      key: 'model' },
  { title: 'Nr rej.',    key: 'reg_number' },
  { title: 'Ubezp.',     key: 'insurance_date',  align: 'center' },
  { title: 'Przegląd',    key: 'inspection_date', align: 'center' },
  { title: 'Zarobek',    key: 'earnings',      sortable: false, align: 'end' },
  { title: 'Edytuj',     key: 'edit',          sortable: false, align: 'center' },
  { title: 'Sprzedaj',   key: 'delete',        sortable: false, align: 'center' },
]
</script>

<style scoped>
/* tutaj ewentualne dodatkowe style */
</style>
