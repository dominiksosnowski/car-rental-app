<!-- src/components/rental/EditRentalForm.vue -->
<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">Edytuj wypożyczenie</span>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form @submit.prevent="onSubmit" ref="form">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="clientFirst" label="Imię" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="clientLast" label="Nazwisko" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="clientPhone"
              label="Telefon"
              type="tel"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="startDate"
              label="Start"
              type="date"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="endDate"
              label="Koniec"
              type="date"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="vehicleId"
              :items="vehicles"
              item-title="label"
              item-value="id"
              label="Pojazd"
              required
            />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field
              v-model.number="dailyRate"
              label="Stawka (doba)"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field
              v-model.number="monthlyRate"
              label="Stawka (miesiąc)"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-checkbox v-model="deposit" label="Kaucja" />
          </v-col>

          <!-- DODANE NOTATKI -->
          <v-col cols="12">
            <v-textarea
              v-model="notes"
              label="Notatki"
              rows="3"
              auto-grow
            />
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

    <v-alert v-if="error" color="error" variant="outlined" class="m-4">
      {{ error }}
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { storeToRefs }                   from 'pinia'
import { useVehicleStore }               from '@/stores/vehicleStore'
import { useRentalStore }                from '@/stores/rentalStore'

const props = defineProps({
  rental: { type: Object, required: true }
})
const emit = defineEmits(['updated', 'cancel'])

const clientFirst = ref('')
const clientLast  = ref('')
const clientPhone = ref('')
const startDate   = ref('')
const endDate     = ref('')
const vehicleId   = ref(null)
const dailyRate   = ref(0)
const monthlyRate = ref(0)
const deposit     = ref(false)

// nowy stan dla notatek
const notes = ref('')

// synchronizacja przy otwarciu edycji
watch(
  () => props.rental,
  r => {
    clientFirst.value = r.client_first
    clientLast.value  = r.client_last
    clientPhone.value = r.client_phone
    startDate.value   = r.start_date
    endDate.value     = r.end_date
    vehicleId.value   = r.vehicle_id
    dailyRate.value   = r.daily_rate
    monthlyRate.value = r.monthly_rate
    deposit.value     = r.deposit

    // zaciągamy istniejące notatki
    notes.value = r.notes || ''
  },
  { immediate: true }
)

const vehicleStore = useVehicleStore()
const rentalStore  = useRentalStore()
const { list: vehiclesRaw } = storeToRefs(vehicleStore)
const { loading, error }    = storeToRefs(rentalStore)

onMounted(() => vehicleStore.fetchActive())

const vehicles = computed(() =>
  vehiclesRaw.value.map(v => ({
    id: v.id,
    label: `${v.brand} ${v.model} (${v.reg_number})`
  }))
)

async function onSubmit() {
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
    notes:         notes.value            // ← dorzucamy notatki
  }

  const updated = await rentalStore.updateRental(props.rental.id, payload)
  loading.value = false

  if (updated) {
    emit('updated', updated)
  }
}
</script>
