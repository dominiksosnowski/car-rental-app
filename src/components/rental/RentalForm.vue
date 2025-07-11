<template>
  <form @submit.prevent="onSubmit" class="rental-form">
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

    <!-- DODANE POLE: wybór pojazdu -->
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
      Stawka (doba)
      <input
        v-model.number="dailyRate"
        type="number"
        step="0.01"
        min="0"
        required
      />
    </label>

    <label>
      Stawka (miesiąc)
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

    <button type="submit" :disabled="loading">
      {{ loading ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Dodaj wypożyczenie' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs }            from 'pinia'
import { useVehicleStore }        from '@/stores/vehicleStore'
import { useRentalStore }         from '@/stores/rentalStore'

const props = defineProps({
  rental: { type: Object, default: null }
})
const emit = defineEmits(['saved', 'cancel'])

const isEdit      = computed(() => !!props.rental)
const clientFirst = ref(props.rental?.client_first || '')
const clientLast  = ref(props.rental?.client_last  || '')
const clientPhone = ref(props.rental?.client_phone || '')
const vehicleId   = ref(props.rental?.vehicle_id   || '')
const startDate   = ref(props.rental?.start_date   || '')
const endDate     = ref(props.rental?.end_date     || '')
const dailyRate   = ref(props.rental?.daily_rate   || 0)
const monthlyRate = ref(props.rental?.monthly_rate || 0)
const deposit     = ref(props.rental?.deposit      || false)

const vehicleStore = useVehicleStore()
const rentalStore  = useRentalStore()

// reactive refs
const { list: vehiclesList } = storeToRefs(vehicleStore)
const { loading, error }     = storeToRefs(rentalStore)

// pobierz pojazdy do selecta
onMounted(() => vehicleStore.fetchAll())

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

  let saved
  if (isEdit.value) {
    saved = await rentalStore.updateRental(props.rental.id, payload)
  } else {
    saved = await rentalStore.addRental(payload)
  }

  loading.value = false

  if (saved) {
    emit('saved', saved)
  }
}
</script>

<style scoped>
.rental-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
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

button {
  padding: 0.5rem;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
