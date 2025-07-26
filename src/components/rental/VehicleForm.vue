<!-- src/components/rental/VehicleForm.vue -->
<template>
  <v-form @submit.prevent="onSubmit" ref="form">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="brand"
          label="Marka"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="model"
          label="Model"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="regNumber"
          label="Nr rej."
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="status"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          label="Status"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="inspectionDate"
          label="Badanie techniczne"
          type="date"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="insuranceDate"
          label="Ubezpieczenie"
          type="date"
          required
        />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" class="text-right">
        <v-btn text class="mr-2" @click="cancel">
          Anuluj
        </v-btn>
        <v-btn type="submit" color="primary" :loading="loading">
          {{ loading ? 'Dodaję...' : 'Dodaj pojazd' }}
        </v-btn>
      </v-col>
    </v-row>

    <v-alert
      v-if="error"
      color="error"
      variant="outlined"
      class="mt-4"
    >
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'

const emit = defineEmits(['added', 'cancel'])

const brand          = ref('')
const model          = ref('')
const regNumber      = ref('')
const status         = ref('available')
const inspectionDate = ref('')
const insuranceDate  = ref('')

// select options
const statusOptions = [
  { label: 'Dostępny',    value: 'available'   },
  { label: 'Niedostępny', value: 'unavailable' }
]

const store   = useVehicleStore()
const loading = ref(false)
const error   = ref(null)

function cancel() {
  emit('cancel')
}

async function onSubmit() {
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
    // reset pól
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
