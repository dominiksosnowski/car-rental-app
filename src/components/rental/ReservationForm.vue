<!-- src/components/rental/ReservationForm.vue -->
<template>
  <v-form @submit.prevent="onSubmit" ref="form">
    <v-row>
      <!-- Imię i nazwisko -->
      <v-col cols="12" md="6">
        <v-text-field v-model="firstName" label="Imię" required />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="lastName" label="Nazwisko" required />
      </v-col>

      <!-- Telefon -->
      <v-col cols="12" md="6">
        <v-text-field v-model="phone" label="Telefon" type="tel" required />
      </v-col>

      <!-- Start rezerwacji -->
      <v-col cols="12" md="3">
        <v-menu
          v-model="menuStart"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              v-model="startDate"
              label="Start"
              readonly
              prepend-inner-icon="mdi-calendar"
              required
            />
          </template>
          <v-date-picker
            v-model="startDate"
            locale="pl"
            first-day-of-week="1"
            value-format="yyyy-MM-dd"
            @update:model-value="menuStart = false"
          />
        </v-menu>
      </v-col>

      <!-- Koniec rezerwacji -->
      <v-col cols="12" md="3">
        <v-menu
          v-model="menuEnd"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              v-model="endDate"
              label="Koniec"
              readonly
              prepend-inner-icon="mdi-calendar"
              required
            />
          </template>
          <v-date-picker
            v-model="endDate"
            locale="pl"
            first-day-of-week="1"
            value-format="yyyy-MM-dd"
            @update:model-value="menuEnd = false"
          />
        </v-menu>
      </v-col>

      <!-- Wybór pojazdu -->
      <v-col cols="12" md="6">
        <v-select
          v-model="vehicleId"
          :items="vehicleOptions"
          item-title="text"
          item-value="value"
          label="Pojazd"
          :disabled="!startDate || !endDate || vehicleOptions.length === 0"
          required
        />
        <v-alert
          v-if="startDate && endDate && vehicleOptions.length === 0"
          color="info"
          variant="outlined"
          class="mt-2"
        >
          Brak dostępnych pojazdów w wybranym terminie.
        </v-alert>
      </v-col>

      <!-- Notatki -->
      <v-col cols="12">
        <v-textarea v-model="notes" label="Notatki" rows="3" />
      </v-col>
    </v-row>

    <!-- Akcja -->
    <v-row class="mt-4">
      <v-col cols="12" class="text-right">
        <v-btn text class="mr-2" @click="cancel">Anuluj</v-btn>
        <v-btn type="submit" color="primary" :loading="loading">
          {{ loading ? 'Rezerwuję…' : 'Zarezerwuj' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Błąd -->
    <v-alert v-if="error" color="error" variant="outlined" class="mt-4">
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs }             from 'pinia'
import { useVehicleStore }         from '@/stores/vehicleStore'
import { useReservationStore }     from '@/stores/reservationStore'
import { useRentalStore }          from '@/stores/rentalStore'

const emit = defineEmits(['added','cancel'])

const firstName = ref('')
const lastName  = ref('')
const phone     = ref('')
const startDate = ref('')
const endDate   = ref('')
const vehicleId = ref('')
const notes     = ref('')

const menuStart = ref(false)
const menuEnd   = ref(false)

const vehicleStore     = useVehicleStore()
const reservationStore = useReservationStore()
const rentalStore      = useRentalStore()

const { list: vehicles }               = storeToRefs(vehicleStore)
const { list: reservations, loading, error } = storeToRefs(reservationStore)
const { list: rentals }                = storeToRefs(rentalStore)

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchActive(),
    reservationStore.fetchAll(),
    rentalStore.fetchAll()
  ])
})

const busyVehicleIds = computed(() => {
  if (!startDate.value || !endDate.value) return []

  const newStart = new Date(startDate.value)
  const newEnd   = new Date(endDate.value)

  // 1) Rentals: if no end_date → infinite busy; otherwise check overlap
  const fromRentals = rentals.value
    .filter(r => !r.archived && r.vehicle_id)
    .filter(r => {
      const rStart = new Date(r.start_date)
      const rEnd   = r.end_date
        ? new Date(r.end_date)
        : new Date(8640000000000000)  // treat no end_date as never returned
      return rStart < newEnd && rEnd > newStart
    })
    .map(r => r.vehicle_id)

  // 2) Reservations: as before
  const fromReservations = reservations.value
    .filter(r => r.start_date)
    .filter(r => {
      const resStart = new Date(r.start_date)
      const resEnd   = r.end_date
        ? new Date(r.end_date)
        : new Date(r.start_date)
      return resStart < newEnd && resEnd > newStart
    })
    .map(r => r.vehicle_id)

  return Array.from(new Set([...fromRentals, ...fromReservations]))
})

const availableVehicles = computed(() =>
  vehicles.value.filter(v =>
    v.status !== 'unavailable' &&
    !busyVehicleIds.value.includes(v.id)
  )
)

const vehicleOptions = computed(() =>
  availableVehicles.value.map(v => ({
    text:  `${v.brand} ${v.model} ${v.reg_number}`,
    value: v.id
  }))
)

function cancel() {
  emit('cancel')
}

async function onSubmit() {
  loading.value = true
  error.value   = null

  // Walidacja konfliktu
  const conflict = await reservationStore.hasConflict(
    vehicleId.value,
    // wymuś czysty format YYYY-MM-DD przed sprawdzeniem
    new Date(startDate.value).toISOString().slice(0,10),
    new Date(endDate.value).toISOString().slice(0,10)
  )
  if (conflict) {
    loading.value = false
    error.value   = 'Ten pojazd jest już zajęty w tym terminie.'
    return
  }

  // Przygotuj payload z dokładnym formatem YYYY-MM-DD
  const payload = {
    first_name: firstName.value,
    last_name:  lastName.value,
    phone:      phone.value,
    vehicle_id: vehicleId.value,
    start_date: new Date(startDate.value).toISOString().slice(0,10),
    end_date:   new Date(endDate.value).toISOString().slice(0,10),
    notes:      notes.value
  }

  const result = await reservationStore.addReservation(payload)
  loading.value = false

  if (result) {
    firstName.value = ''
    lastName.value  = ''
    phone.value     = ''
    startDate.value = ''
    endDate.value   = ''
    vehicleId.value = ''
    notes.value     = ''
    emit('added', result)
  }
}
</script>
