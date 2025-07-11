<template>
  <form @submit.prevent="onSubmit" class="reservation-form">
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
      Pojazd
      <select v-model="vehicleId" required>
        <option
          v-for="v in vehiclesList"
          :key="v.id"
          :value="v.id"
        >
          {{ v.brand }} {{ v.model }} ({{ v.reg_number }})
        </option>
      </select>
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
      <select
        v-model="vehicleId"
        :disabled="!startDate || !endDate"
        required
      >
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

    <button type="submit" :disabled="loading">
      {{ loading ? 'Rezerwuję…' : 'Zarezerwuj' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs }            from 'pinia'
import { useVehicleStore }        from '@/stores/vehicleStore'
import { useReservationStore }    from '@/stores/reservationStore'

const emit = defineEmits(['added'])

// pola formularza
const firstName = ref('')
const lastName  = ref('')
const phone     = ref('')
const startDate = ref('')
const endDate   = ref('')
const vehicleId = ref('')
const notes     = ref('')

// store'y
const vehicleStore     = useVehicleStore()
const reservationStore = useReservationStore()

// reactive refs
const { list: vehicles }      = storeToRefs(vehicleStore)
const { list: reservations,
        loading,
        error }              = storeToRefs(reservationStore)

// ładujemy dane przy montowaniu
onMounted(async () => {
  await vehicleStore.fetchAll()
  await reservationStore.fetchAll()
})

// obliczamy ID pojazdów zajętych w podanym okresie
const busyVehicleIds = computed(() => {
  if (!startDate.value || !endDate.value) return []
  return reservations.value
    .filter(r =>
      // prawdziwe nachodzenie przedziałów: 
      // r.start_date < endDate && r.end_date > startDate
      r.start_date < endDate.value &&
      r.end_date   > startDate.value
    )
    .map(r => r.vehicle_id)
})

// lista dostępnych pojazdów
const availableVehicles = computed(() =>
  vehicles.value.filter(v => !busyVehicleIds.value.includes(v.id))
)

async function onSubmit() {
  loading.value = true
  error.value   = null

  const payload = {
    first_name: firstName.value,
    last_name:  lastName.value,
    phone:      phone.value,
    vehicle_id: vehicleId.value,
    start_date: startDate.value,
    end_date:   endDate.value,
    notes:      notes.value,
  }

  // finalne sprawdzenie konfliktu (opcjonalne, dla bezpieczeństwa)
  const conflict = await reservationStore.hasConflict(
    vehicleId.value,
    startDate.value,
    endDate.value
  )
  if (conflict) {
    loading.value = false
    error.value   = 'Ten pojazd jest już zarezerwowany w tym terminie.'
    return
  }

  const result = await reservationStore.addReservation(payload)
  loading.value = false

  if (result) {
    // reset formularza
    firstName.value = lastName.value = phone.value = ''
    startDate.value = endDate.value = vehicleId.value = notes.value = ''
    emit('added', result)
  }
}
</script>

<style scoped>
.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
}

label {
  display: flex;
  flex-direction: column;
}

select:disabled {
  opacity: 0.6;
}

.no-vehicles {
  color: #666;
  font-style: italic;
}

button {
  padding: 0.5rem;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
