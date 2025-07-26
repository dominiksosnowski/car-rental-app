<!-- src/components/rental/EditReservationForm.vue -->
<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">Edytuj rezerwację</span>
    </v-card-title>
    <v-divider />

    <v-card-text>
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
          <v-col cols="12" md="6">
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
          <v-col cols="12" md="6">
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
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn text @click="$emit('cancel')">Anuluj</v-btn>
      <v-btn color="primary" :loading="loading" @click="onSubmit">
        Zapisz
      </v-btn>
    </v-card-actions>

    <v-alert
      v-if="error"
      color="error"
      variant="outlined"
      class="m-4"
    >
      {{ error }}
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { storeToRefs }                    from 'pinia'
import { useVehicleStore }                from '@/stores/vehicleStore'
import { useReservationStore }            from '@/stores/reservationStore'
import { useRentalStore }                 from '@/stores/rentalStore'

const props = defineProps({
  reservation: { type: Object, required: true }
})
const emit = defineEmits(['updated','cancel'])

const vehicleStore     = useVehicleStore()
const reservationStore = useReservationStore()
const rentalStore      = useRentalStore()

const { list: vehiclesList }                = storeToRefs(vehicleStore)
const { list: reservations, loading, error } = storeToRefs(reservationStore)
const { list: rentals }                     = storeToRefs(rentalStore)

// initialize
const firstName = ref(props.reservation.first_name)
const lastName  = ref(props.reservation.last_name)
const phone     = ref(props.reservation.phone)
const startDate = ref(props.reservation.start_date)
const endDate   = ref(props.reservation.end_date)
const vehicleId = ref(props.reservation.vehicle_id)
const notes     = ref(props.reservation.notes || '')

const menuStart = ref(false)
const menuEnd   = ref(false)

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchActive(),
    reservationStore.fetchAll(),
    rentalStore.fetchAll()
  ])
})

// busy IDs (exclude this reservation)
const busyVehicleIds = computed(() => {
  if (!startDate.value || !endDate.value) return []

  const s = new Date(startDate.value)
  const e = new Date(endDate.value)

  const fromRentals = rentals.value
    .filter(r => !r.archived && r.vehicle_id)
    .filter(r => {
      const rs = new Date(r.start_date)
      const re = r.end_date
        ? new Date(r.end_date)
        : new Date(8640000000000000)
      return rs < e && re > s
    })
    .map(r => r.vehicle_id)

  const fromReservations = reservations.value
    .filter(r => r.id !== props.reservation.id && r.start_date)
    .filter(r => {
      const rs = new Date(r.start_date)
      const re = r.end_date
        ? new Date(r.end_date)
        : new Date(r.start_date)
      return rs < e && re > s
    })
    .map(r => r.vehicle_id)

  return Array.from(new Set([...fromRentals, ...fromReservations]))
})

const availableVehicles = computed(() =>
  vehiclesList.value.filter(v =>
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

// watch for prop changes
watch(
  () => props.reservation,
  r => {
    firstName.value = r.first_name
    lastName.value  = r.last_name
    phone.value     = r.phone
    startDate.value = r.start_date
    endDate.value   = r.end_date
    vehicleId.value = r.vehicle_id
    notes.value     = r.notes || ''
  },
  { immediate: true }
)

async function onSubmit() {
  loading.value = true
  error.value   = null

  // normalize dates
  const sd = startDate.value
  const ed = endDate.value

  const conflict = await reservationStore.hasConflict(
    vehicleId.value,
    sd,
    ed,
    props.reservation.id
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
    start_date: sd,
    end_date:   ed,
    notes:      notes.value
  }

  const updated = await reservationStore.updateReservation(
    props.reservation.id,
    payload
  )
  loading.value = false
  if (updated) emit('updated', updated)
}
</script>
