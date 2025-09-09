<!-- src/components/workshop/ActiveRepairForm.vue -->
<template>
  <v-form
    ref="formRef"
    v-model="valid"
    @submit.prevent="submit"
    lazy-validation
    autocomplete="off"
  >
    <!-- 1. Data przyjazdu i zakończenia -->
   <v-row>
  <v-col cols="12" md="6">
    <v-text-field
      v-model="arrivalDate"
      label="Data przyjazdu"
      type="date"
      prepend-inner-icon="mdi-calendar"
      :rules="[v => !!v || 'Data jest wymagana']"
      required
    />
  </v-col>

  <v-col cols="12" md="6">
    <v-text-field
      v-model="completionDate"
      label="Data zakończenia"
      type="date"
      prepend-inner-icon="mdi-calendar"
    />
  </v-col>
</v-row>

    <!-- 2. Dane klienta i pojazdu -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="firstName"
          label="Imię klienta"
          :rules="[v => !!v || 'Imię jest wymagane']"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="lastName"
          label="Nazwisko klienta"
          :rules="[v => !!v || 'Nazwisko jest wymagane']"
          required
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="phone"
          label="Telefon"
          type="tel"
          :rules="[v => !!v || 'Telefon jest wymagany']"
          required
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="vehicleMake"
          label="Marka pojazdu"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="vehicleModel"
          label="Model pojazdu"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="vin"
          label="Numer VIN"
        />
      </v-col>
    </v-row>

<v-row>
  <v-col cols="12" md="6">
    <v-text-field
      v-model="engine"
      label="Silnik"
    />
  </v-col>
  <v-col cols="12" md="6">
    <v-text-field
      v-model="customerOrder"
      label="Zlecenie klienta"
    />
  </v-col>
</v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="paymentMethod"
          :items="paymentItems"
          label="Sposób płatności"
          :rules="[v => !!v || 'Wybierz sposób płatności']"
          required
        />
      </v-col>
    </v-row>

    <!-- 4. Akcje -->
    <v-row class="mt-4">
      <v-col cols="12" class="text-right">
        <v-btn text @click="onCancel" :disabled="localLoading">
          Anuluj
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="localLoading"
          :disabled="!valid || localLoading"
        >
          {{ isEdit ? 'Zapisz zmiany' : 'Dodaj naprawę' }}
        </v-btn>
      </v-col>
    </v-row>

    <v-alert
      v-if="localError"
      type="error"
      variant="outlined"
      class="mt-4"
      dense
      text
    >
      {{ localError }}
    </v-alert>
  </v-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useActiveRepairsStore } from '@/stores/activeRepairsStore'

const props = defineProps({
  repair: { type: Object, default: null }
})
const emit = defineEmits(['added', 'updated', 'cancel'])

const store        = useActiveRepairsStore()
const formRef      = ref(null)
const valid        = ref(false)
const localLoading = ref(false)
const localError   = ref(null)

const menuArrival    = ref(false)
const menuCompletion = ref(false)

const arrivalDate    = ref('')
const completionDate = ref('')
const firstName      = ref('')
const lastName       = ref('')
const phone          = ref('')
const vehicleMake    = ref('')
const vehicleModel   = ref('')
const vin            = ref('')
const engine        = ref('')
const customerOrder = ref('')


const paymentMethod = ref(null)
const paymentItems = [
  'Gotówka',
  'Karta',
  'Przelew',
  'Inne'
]


const isEdit = computed(() => !!props.repair)

watch(
  () => props.repair,
  (r) => {
    arrivalDate.value    = r?.arrival_date?.slice(0, 10)   || ''
    completionDate.value = r?.completion_date?.slice(0, 10) || null
    firstName.value      = r?.first_name                   || ''
    lastName.value       = r?.last_name                    || ''
    phone.value          = r?.phone                        || ''
    vehicleMake.value    = r?.vehicle_make                 || ''
    vehicleModel.value   = r?.vehicle_model                || ''
    vin.value            = r?.vin                          || ''
    engine.value         = r?.engine                       || ''
    customerOrder.value  = r?.customer_order               || ''
    paymentMethod.value  = r?.payment_method               || null

    formRef.value?.resetValidation()
    localError.value = null
  },
  { immediate: true }
)


const formattedDue = computed(() => {
  const amount = props.repair?.due_amount || 0
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN'
  }).format(amount)
})

function onCancel() {
  formRef.value.resetValidation()
  emit('cancel')
}

async function submit() {
  const ok = await formRef.value.validate()
  if (!ok) return

  localLoading.value = true
  localError.value   = null

const payload = {
  arrival_date:    arrivalDate.value
    ? new Date(arrivalDate.value).toISOString()
    : null,
  completion_date: completionDate.value
    ? new Date(completionDate.value).toISOString()
    : null,
  first_name:      firstName.value,
  last_name:       lastName.value,
  phone:           phone.value,
  vehicle_make:    vehicleMake.value || null,
  vehicle_model:   vehicleModel.value || null,
  vin:             vin.value || null,
  engine:          engine.value || null,
  customer_order:  customerOrder.value || null,
  payment_method:  paymentMethod.value
}


  try {
    let res
    if (isEdit.value) {
      res = await store.updateActiveRepair(props.repair.id, payload)
      emit('updated', res)
    } else {
      res = await store.createActiveRepair(payload)
      emit('added', res)
    }
    formRef.value.resetValidation()
  } catch (e) {
    localError.value =
      e?.message || 'Błąd zapisu aktywnej naprawy'
  } finally {
    localLoading.value = false
  }
}
</script>

<style scoped>
.mt-4 { margin-top: 1rem; }
</style>
