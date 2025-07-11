<!-- src/components/rental/EditRentalForm.vue -->
<template>
  <div class="overlay">
    <form @submit.prevent="onSubmit" class="edit-rental-form">
      <h3>Edytuj wypożyczenie</h3>

      <label>
        Imię
        <input v-model="clientFirst" type="text" required />
      </label>

      <label>
        Nazwisko
        <input v-model="clientLast" type="text" required />
      </label>

      <label>
        Telefon
        <input v-model="clientPhone" type="tel" required />
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
        Stawka za dobę
        <input
          v-model.number="dailyRate"
          type="number"
          step="0.01"
          min="0"
          required
        />
      </label>

      <label>
        Stawka za miesiąc
        <input
          v-model.number="monthlyRate"
          type="number"
          step="0.01"
          min="0"
          required
        />
      </label>

      <label class="checkbox">
        <input v-model="deposit" type="checkbox" />
        Kaucja (tak/nie)
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
import { ref, watch, onMounted } from 'vue'
import { storeToRefs }           from 'pinia'
import { useVehicleStore }       from '@/stores/vehicleStore'
import { useRentalStore }        from '@/stores/rentalStore'

const props = defineProps({
  rental: { type: Object, required: true }
})
const emit = defineEmits(['updated', 'cancel'])

// lokalne pola formularza
const clientFirst  = ref(props.rental.client_first)
const clientLast   = ref(props.rental.client_last)
const clientPhone  = ref(props.rental.client_phone)
const startDate    = ref(props.rental.start_date)
const endDate      = ref(props.rental.end_date)
const vehicleId    = ref(props.rental.vehicle_id)
const dailyRate    = ref(props.rental.daily_rate)
const monthlyRate  = ref(props.rental.monthly_rate)
const deposit      = ref(props.rental.deposit)

// store'y
const vehicleStore = useVehicleStore()
const rentalStore  = useRentalStore()

// reactive refs
const { loading, error }          = storeToRefs(rentalStore)
const { list: vehiclesList }      = storeToRefs(vehicleStore)

// ładujemy listę pojazdów
onMounted(() => {
  vehicleStore.fetchAll()
})

// gdy zmieni się props.rental, synchronizujemy pola
watch(
  () => props.rental,
  r => {
    clientFirst.value  = r.client_first
    clientLast.value   = r.client_last
    clientPhone.value  = r.client_phone
    startDate.value    = r.start_date
    endDate.value      = r.end_date
    vehicleId.value    = r.vehicle_id
    dailyRate.value    = r.daily_rate
    monthlyRate.value  = r.monthly_rate
    deposit.value      = r.deposit
  }
)

function onCancel() {
  emit('cancel')
}

async function onSubmit() {
  loading.value = true
  error.value   = null

  const payload = {
    client_first:  clientFirst.value,
    client_last:   clientLast.value,
    client_phone:  clientPhone.value,
    vehicle_id:    vehicleId.value,
    start_date:    startDate.value,
    end_date:      endDate.value,
    daily_rate:    dailyRate.value,
    monthly_rate:  monthlyRate.value,
    deposit:       deposit.value,
  }

  const updated = await rentalStore.updateRental(props.rental.id, payload)
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-rental-form {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

label {
  display: flex;
  flex-direction: column;
}

label.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
