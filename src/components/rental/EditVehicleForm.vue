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
        <v-btn text @click="cancel">Anuluj</v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          type="submit"
        >
          Zapisz zmiany
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
import { ref, watch } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'

const props = defineProps({
  vehicle: { type: Object, required: true }
})
const emit = defineEmits(['updated','cancel'])

const brand          = ref(props.vehicle.brand)
const model          = ref(props.vehicle.model)
const regNumber      = ref(props.vehicle.reg_number)
const status         = ref(props.vehicle.status)
const inspectionDate = ref(props.vehicle.inspection_date)
const insuranceDate  = ref(props.vehicle.insurance_date)

watch(
  () => props.vehicle,
  v => {
    brand.value          = v.brand
    model.value          = v.model
    regNumber.value      = v.reg_number
    status.value         = v.status
    inspectionDate.value = v.inspection_date
    insuranceDate.value  = v.insurance_date
  }
)

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

  const updated = await store.updateVehicle(props.vehicle.id, payload)
  loading.value = false

  if (updated) {
    emit('updated', updated)
  } else {
    error.value = store.error
  }
}
</script>
