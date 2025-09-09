<!-- src/components/workshop/WorkshopScheduledRepairForm.vue -->
<template>
  <v-form
    ref="formRef"
    v-model="valid"
    @submit.prevent="submit"
    lazy-validation
    autocomplete="off"
  >
    <!-- 1. Data przyjazdu -->
    <v-row>
  <v-col cols="12" md="6">
    <v-text-field
      v-model="date"
      label="Data przyjazdu"
      type="date"
      prepend-inner-icon="mdi-calendar"
      :rules="[v => !!v || 'Data jest wymagana']"
      required
    />
  </v-col>
</v-row>

    <!-- 2. Imię i nazwisko -->
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

    <!-- 3. Telefon -->
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

    <!-- 4. Marka i model -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="vehicleMake" label="Marka pojazdu" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="vehicleModel" label="Model pojazdu" />
      </v-col>
    </v-row>

    <!-- 5. Silnik -->
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="engine" label="Silnik" />
      </v-col>
    </v-row>

    <!-- 6. VIN -->
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="vin" label="Numer VIN" />
      </v-col>
    </v-row>

    <!-- 7. Opis naprawy -->
    <v-row>
      <v-col cols="12">
        <v-textarea
          v-model="repairDescription"
          label="Opis naprawy"
          :rules="[v => !!v || 'Opis jest wymagany']"
          required
          rows="4"
          auto-grow
        />
      </v-col>
    </v-row>

    <!-- Akcje -->
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
import { useScheduledRepairsStore } from '@/stores/scheduledRepairsStore'

const props = defineProps({
  repair: { type: Object, default: null }
})
const emit = defineEmits(['added', 'updated', 'cancel'])

// form refs & validation
const formRef           = ref(null)
const valid             = ref(false)
const menuDate          = ref(false)

// form fields
const date              = ref('')
const firstName         = ref('')
const lastName          = ref('')
const phone             = ref('')
const vehicleMake       = ref('')
const vehicleModel      = ref('')
const engine            = ref('')
const vin               = ref('')
const repairDescription = ref('')

// local status
const localLoading = ref(false)
const localError   = ref(null)

// new store
const store  = useScheduledRepairsStore()
const isEdit = computed(() => !!props.repair)

// reset & populate on prop change
watch(
  () => props.repair,
  (r) => {
    date.value              = r?.arrival_date?.slice(0, 10) || ''
    firstName.value         = r?.first_name         || ''
    lastName.value          = r?.last_name          || ''
    phone.value             = r?.phone              || ''
    vehicleMake.value       = r?.vehicle_make       || ''
    vehicleModel.value      = r?.vehicle_model      || ''
    engine.value            = r?.engine             || ''
    vin.value               = r?.vin                || ''
    repairDescription.value = r?.repair_description || ''

    formRef.value?.resetValidation()
    localError.value = null
  },
  { immediate: true }
)

function onCancel() {
  formRef.value.resetValidation()
  emit('cancel')
}

async function submit() {
  const isValid = await formRef.value.validate()
  if (!isValid) return

  localLoading.value = true
  localError.value   = null

  const payload = {
    arrival_date:       date.value
      ? new Date(date.value).toISOString()
      : null,
    first_name:         firstName.value,
    last_name:          lastName.value,
    phone:              phone.value,
    vehicle_make:       vehicleMake.value || null,
    vehicle_model:      vehicleModel.value || null,
    engine:             engine.value || null,
    vin:                vin.value || null,
    repair_description: repairDescription.value
  }

  try {
    if (isEdit.value) {
      await store.updateScheduledRepair(props.repair.id, payload)
      emit('updated')
    } else {
      await store.createScheduledRepair(payload)
      emit('added')
    }
    formRef.value.resetValidation()
  } catch (e) {
    localError.value =
      e?.message || 'Wystąpił błąd podczas zapisywania naprawy'
  } finally {
    localLoading.value = false
  }
}
</script>

<style scoped>
.mt-4 { margin-top: 1rem; }
</style>
