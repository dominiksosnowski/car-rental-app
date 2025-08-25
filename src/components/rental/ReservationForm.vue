<template>
  <v-form @submit.prevent="onSubmit" ref="formRef" v-model="formValid">
    <v-row>
      <!-- Imię i nazwisko -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="firstName"
          label="Imię"
          :rules="[v => !!v || 'Imię jest wymagane']"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="lastName"
          label="Nazwisko"
          :rules="[v => !!v || 'Nazwisko jest wymagane']"
          required
        />
      </v-col>

      <!-- Telefon -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="phone"
          label="Telefon"
          type="tel"
          :rules="[v => !!v || 'Telefon jest wymagany']"
          required
        />
      </v-col>

      <!-- Start rezerwacji -->
      <v-col cols="12" md="3">
        <v-text-field
          v-model="startDate"
          label="Start"
          type="date"
          :rules="[v => !!v || 'Data startu jest wymagana']"
          required
          prepend-inner-icon="mdi-calendar"
        />
      </v-col>

      <!-- Koniec rezerwacji -->
      <v-col cols="12" md="3">
        <v-text-field
          v-model="endDate"
          label="Koniec"
          type="date"
          :rules="[v => !!v || 'Data końca jest wymagana']"
          required
          prepend-inner-icon="mdi-calendar"
        />
      </v-col>

      <!-- Wybór pojazdu -->
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="vehicleId"
          :items="vehicleOptions"
          item-title="text"
          item-value="value"
          label="Pojazd"
          :disabled="!startDate || !endDate || vehicleOptions.length === 0"
          :rules="[v => !!v || 'Wybierz pojazd']"
          clearable
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
import { storeToRefs } from 'pinia'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useRentalStore } from '@/stores/rentalStore'

const emit = defineEmits(['added','cancel'])

const firstName = ref('')
const lastName  = ref('')
const phone     = ref('')
const startDate = ref('')
const endDate   = ref('')
const vehicleId = ref('')
const notes     = ref('')

const formRef   = ref(null)
const formValid = ref(false)

const vehicleStore     = useVehicleStore()
const reservationStore = useReservationStore()
const rentalStore      = useRentalStore()

const { list: vehicles }                     = storeToRefs(vehicleStore)
const { list: reservations, loading, error } = storeToRefs(reservationStore)
const { list: rentals }                      = storeToRefs(rentalStore)

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchActive(),
    reservationStore.fetchAll(),
    rentalStore.fetchAll()
  ])
})

function toLocalMidnight(dateStr) {
  if (!dateStr) return null
  return new Date(`${dateStr}T00:00:00`)
}

const busyVehicleIds = computed(() => {
  if (!startDate.value || !endDate.value) return []

  const newStart = toLocalMidnight(startDate.value)
  const newEnd   = toLocalMidnight(endDate.value)

  const fromRentals = rentals.value
    .filter(r => !r.archived && r.vehicle_id)
    .filter(r => {
      const rStart = toLocalMidnight(r.start_date)
      const rEnd   = r.end_date
        ? toLocalMidnight(r.end_date)
        : new Date(8640000000000000)
      return rStart < newEnd && rEnd > newStart
    })
    .map(r => r.vehicle_id)

  const fromReservations = reservations.value
    .filter(r => r.start_date)
    .filter(r => {
      const resStart = toLocalMidnight(r.start_date)
      const resEnd   = r.end_date
        ? toLocalMidnight(r.end_date)
        : toLocalMidnight(r.start_date)
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
    text:  `${v.brand} ${v.model} (${v.reg_number})`,
    value: v.id
  }))
)

function cancel() {
  emit('cancel')
}

async function onSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value   = null

  const conflict = await reservationStore.hasConflict(
    vehicleId.value,
    startDate.value,
    endDate.value
  )
  if (conflict) {
    loading.value = false
    error.value   = 'Ten pojazd jest już zajęty w tym terminie.'
    return
  }

  const payload = {
    first_name: firstName.value,
    last_name:  lastName.value,
    phone:      phone.value,
    vehicle_id: vehicleId.value,
    start_date: startDate.value,
    end_date:   endDate.value,
    notes:      notes.value
  }

  const result = await reservationStore.addReservation(payload)
  loading.value = false

  if (result) {
    formRef.value.resetValidation()
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
