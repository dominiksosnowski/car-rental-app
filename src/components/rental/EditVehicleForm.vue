<template>
  <div class="edit-form-overlay">
    <form @submit.prevent="onSubmit" class="edit-form">
      <h3>Edytuj pojazd</h3>

      <label>Marka
        <input v-model="brand" type="text" required />
      </label>
      <label>Model
        <input v-model="model" type="text" required />
      </label>
      <label>Registration Number
        <input v-model="regNumber" type="text" required />
      </label>
      <label>Status
        <select v-model="status">
          <option value="available">Dostępny</option>
          <option value="unavailable">Niedostępny</option>
        </select>
      </label>
      <label>Badanie techniczne
        <input v-model="inspectionDate" type="date" required />
      </label>
      <label>Ubezpieczenie
        <input v-model="insuranceDate" type="date" required />
      </label>

      <div class="buttons">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Zapisywanie...' : 'Zapisz' }}
        </button>
        <button type="button" @click="$emit('cancel')">Anuluj</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'

const props = defineProps({
  vehicle: { type: Object, required: true }
})
const emit = defineEmits(['updated', 'cancel'])

const brand          = ref(props.vehicle.brand)
const model          = ref(props.vehicle.model)
const regNumber      = ref(props.vehicle.reg_number)
const status         = ref(props.vehicle.status)
const inspectionDate = ref(props.vehicle.inspection_date)
const insuranceDate  = ref(props.vehicle.insurance_date)

const store   = useVehicleStore()
const loading = ref(false)
const error   = ref(null)

// gdy props się zmieni, nadpisz lokalne refy
watch(() => props.vehicle, (v) => {
  brand.value          = v.brand
  model.value          = v.model
  regNumber.value      = v.reg_number
  status.value         = v.status
  inspectionDate.value = v.inspection_date
  insuranceDate.value  = v.insurance_date
})

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

  const updated = await store.updateVehicle(props.vehicle.id, payload)
  loading.value = false

  if (updated) {
    emit('updated', updated)
  } else {
    error.value = store.error
  }
}
</script>

<style scoped>
.edit-form-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.edit-form {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  max-width: 400px;
  width: 100%;
}
.buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
