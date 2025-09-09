<template>
  <v-form @submit.prevent="onSubmit" ref="formRef" v-model="formValid" autocomplete="off">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="clientFirst"
          label="Imię"
          :rules="[v => !!v || 'Imię jest wymagane']"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="clientLast"
          label="Nazwisko"
          :rules="[v => !!v || 'Nazwisko jest wymagane']"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="clientPhone"
          label="Telefon"
          type="tel"
          :rules="[v => !!v || 'Telefon jest wymagany']"
          required
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="vehicleId"
          :items="vehicles"
          item-title="label"
          item-value="id"
          label="Pojazd"
          :rules="[v => !!v || 'Pojazd jest wymagany']"
          clearable
          required
        />
      </v-col>

      <v-col cols="6" md="3">
        <v-text-field
          v-model="startDate"
          label="Start"
          type="date"
          :rules="[v => !!v || 'Data startu jest wymagana']"
          required
        />
      </v-col>

      <v-col cols="6" md="3">
        <v-text-field
          v-model="endDate"
          label="Koniec"
          type="date"
        />
      </v-col>

      <v-col cols="6" md="3">
        <v-text-field
          v-model.number="dailyRate"
          label="Stawka (doba)"
          type="number"
          min="0"
          step="0.01"
        />
      </v-col>

      <v-col cols="6" md="3">
        <v-text-field
          v-model.number="monthlyRate"
          label="Stawka (miesiąc)"
          type="number"
          min="0"
          step="0.01"
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-checkbox
          v-model="deposit"
          label="Kaucja"
        />
      </v-col>
    </v-row>

    <v-col cols="12">
      <v-textarea
        v-model="notes"
        label="Notatki"
        rows="3"
        auto-grow
      />
    </v-col>

    <v-row class="mt-4">
      <v-col cols="12" class="text-right">
        <v-btn text class="ml-2" @click="emitCancel">
          Anuluj
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          type="submit"
        >
          {{ loading
            ? 'Zapisywanie…'
            : isEdit
              ? 'Zapisz zmiany'
              : 'Dodaj wypożyczenie' }}
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
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useRentalStore } from '@/stores/rentalStore'

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
const notes       = ref(props.rental?.notes        || '')

const vehicleStore = useVehicleStore()
const rentalStore  = useRentalStore()

const { list: vehiclesRaw } = storeToRefs(vehicleStore)
const { loading, error }    = storeToRefs(rentalStore)

onMounted(() => vehicleStore.fetchActive())

// lista pojazdów z marką i numerem rejestracyjnym
const vehicles = computed(() =>
  vehiclesRaw.value.map(v => ({
    id:    v.id,
    label: `${v.brand} ${v.model} (${v.reg_number})`
  }))
)

const formRef   = ref(null)
const formValid = ref(false)

function emitCancel() {
  emit('cancel')
}

async function onSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value   = null

  const payload = {
    client_first:  clientFirst.value,
    client_last:   clientLast.value,
    client_phone:  clientPhone.value,
    vehicle_id:    vehicleId.value,
    start_date:    startDate.value,
    end_date:      endDate.value || null,
    daily_rate:    dailyRate.value,
    monthly_rate:  monthlyRate.value,
    deposit:       deposit.value,
    notes:         notes.value,  
  }

  let saved
  if (isEdit.value) {
    saved = await rentalStore.updateRental(props.rental.id, payload)
  } else {
    saved = await rentalStore.addRental(payload)
  }

  loading.value = false

  if (saved) {
    formRef.value.resetValidation()
    emit('saved', saved)
  }
}
</script>
