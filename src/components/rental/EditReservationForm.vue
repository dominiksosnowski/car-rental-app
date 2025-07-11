<template>
  <div class="overlay">
    <form @submit.prevent="onSubmit" class="edit-res-form">
      <h3>Edytuj rezerwację</h3>

      <label>
        Imię
        <input v-model="firstName" type="text" required />
      </label>

      <label>
        Nazwisko
        <input v-model="lastName" type="text" required />
      </label>

      <label>
        Telefon
        <input v-model="phone" type="tel" required />
      </label>

      <label>
        Start
        <input v-model="startDate" type="date" required />
      </label>

      <label>
        Koniec
        <input v-model="endDate" type="date" required />
      </label>

      <label>
        Pojazd
        <select v-model="vehicleId" :disabled="!startDate || !endDate" required>
          <option
            v-for="v in availableVehicles"
            :key="v.id"
            :value="v.id"
          >
            {{ v.brand }} {{ v.model }} ({{ v.reg_number }})
          </option>
        </select>
      </label>

      <p
        v-if="startDate && endDate && availableVehicles.length === 0"
        class="no-vehicles"
      >
        Brak dostępnych pojazdów w wybranym terminie.
      </p>

      <label>
        Notatki
        <textarea v-model="notes" rows="3"></textarea>
      </label>

      <div class="buttons">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Zapisywanie…' : 'Zapisz' }}
        </button>
        <button type="button" @click="onCancel">Anuluj</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { storeToRefs }                   from 'pinia'
import { useVehicleStore }               from '@/stores/vehicleStore'
import { useReservationStore }           from '@/stores/reservationStore'

const props = defineProps({
  reservation: { type: Object, required: true }
})
const emit = defineEmits(['updated', 'cancel'])

// lokalny stan formularza
const firstName = ref(props.reservation.first_name)
const lastName  = ref(props.reservation.last_name)
const phone     = ref(props.reservation.phone)
const startDate = ref(props.reservation.start_date)
const endDate   = ref(props.reservation.end_date)
const vehicleId = ref(props.reservation.vehicle_id)
const notes     = ref(props.reservation.notes)

// store'y
const vehicleStore     = useVehicleStore()
const reservationStore = useReservationStore()

// reactive refs
const { loading, error, list: reservations } = storeToRefs(reservationStore)
const { list: vehiclesList }                 = storeToRefs(vehicleStore)

// załaduj auta i rezerwacje
onMounted(async () => {
  await vehicleStore.fetchAll()
  await reservationStore.fetchAll()
})

// aktualizuj pola, gdy props się zmieni
watch(
  () => props.reservation,
  r => {
    firstName.value = r.first_name
    lastName.value  = r.last_name
    phone.value     = r.phone
    startDate.value = r.start_date
    endDate.value   = r.end_date
    vehicleId.value = r.vehicle_id
    notes.value     = r.notes
  }
)

// Oblicz busyVehicleIds z wyjątkiem obecnej rezerwacji
const busyVehicleIds = computed(() => {
  if (!startDate.value || !endDate.value) return []
  return reservations.value
    .filter(r =>
      r.id !== props.reservation.id &&        // pomijamy samą siebie
      r.start_date < endDate.value &&
      r.end_date   > startDate.value
    )
    .map(r => r.vehicle_id)
})

// dostępne auta: albo nie są busy, albo to auto z edytowanej rezerwacji
const availableVehicles = computed(() =>
  vehiclesList.value.filter(v => {
    if (v.id === props.reservation.vehicle_id) return true
    return !busyVehicleIds.value.includes(v.id)
  })
)

function onCancel() {
  emit('cancel')
}

async function onSubmit() {
  loading.value = true
  error.value   = null

  // finalny check (opcjonalnie)
  const conflict = await reservationStore.hasConflict(
    vehicleId.value,
    startDate.value,
    endDate.value
  )
  if (conflict && vehicleId.value !== props.reservation.vehicle_id) {
    loading.value = false
    error.value   = 'Ten pojazd jest już zarezerwowany w tym terminie.'
    return
  }

  const payload = {
    first_name: firstName.value,
    last_name:  lastName.value,
    phone:      phone.value,
    vehicle_id: vehicleId.value,
    start_date: startDate.value,
    end_date:   endDate.value,
    notes:      notes.value,
  }

  const updated = await reservationStore.updateReservation(
    props.reservation.id,
    payload
  )

  loading.value = false

  if (updated) {
    emit('updated', updated)
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}

.edit-res-form {
  background: #fff;
  padding: 1.5rem;
  border-radius: 4px;
  max-width: 500px;
  width: 100%;
  display: flex; flex-direction: column; gap: 0.75rem;
}

label {
  display: flex; flex-direction: column;
}

select:disabled {
  opacity: 0.6;
}

.no-vehicles {
  color: #666; font-style: italic;
}

.buttons {
  display: flex; gap: 0.5rem; margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem; cursor: pointer;
}

.error {
  color: red; margin-top: 0.5rem;
}
</style>
