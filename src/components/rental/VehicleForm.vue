<template>
  <form @submit.prevent="onSubmit" class="vehicle-form">
    <label>
      Marka
      <input v-model="brand" type="text" required />
    </label>

    <label>
      Model
      <input v-model="model" type="text" required />
    </label>

    <label>
      Registration Number
      <input v-model="regNumber" type="text" required />
    </label>

    <label>
      Status
      <select v-model="status">
        <option value="available">Dostępny</option>
        <option value="unavailable">Niedostępny</option>
      </select>
    </label>

    <label>
      Badanie techniczne
      <input v-model="inspectionDate" type="date" required />
    </label>

    <label>
      Ubezpieczenie
      <input v-model="insuranceDate" type="date" required />
    </label>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Dodaję...' : 'Dodaj pojazd' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'

const emit = defineEmits(['added'])

const brand          = ref('')
const model          = ref('')
const regNumber      = ref('')        // ← nowe pole
const status         = ref('available')
const inspectionDate = ref('')
const insuranceDate  = ref('')

const store   = useVehicleStore()
const loading = ref(false)
const error   = ref(null)

const onSubmit = async () => {
  loading.value = true
  error.value   = null

const payload = {
  brand:            brand.value,
  model:            model.value,
  reg_number:       regNumber.value,
  status:           status.value,
  inspection_date:  inspectionDate.value,
  insurance_date:   insuranceDate.value,
}

  const result = await store.addVehicle(payload)
  loading.value = false

  if (result) {
    // reset formularza
    brand.value          = ''
    model.value          = ''
    regNumber.value      = ''
    status.value         = 'available'
    inspectionDate.value = ''
    insuranceDate.value  = ''
    emit('added', result)
  } else {
    error.value = store.error
  }
}
</script>
