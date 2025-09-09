<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">Edytuj naprawę</span>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form @submit.prevent="onSubmit" ref="formRef" v-model="formValid" autocomplete="off">
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="vehicleId"
              :items="vehicles"
              item-title="label"
              item-value="id"
              label="Pojazd"
              :rules="[v => !!v || 'Wybierz pojazd']"
              clearable
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="date"
              label="Data"
              type="date"
              :rules="[v => !!v || 'Data jest wymagana']"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="mileage"
              label="Przebieg (km)"
              type="number"
              min="0"
              :rules="[v => v >= 0 || 'Podaj przebieg']"
              required
            />
          </v-col>
        </v-row>

        <div class="parts-list mb-4">
          <h4>Części</h4>
          <v-row v-for="(p, i) in parts" :key="i" align="center">
            <v-col cols="5">
              <v-text-field
                v-model="p.name"
                label="Nazwa części"
                :rules="[v => !!v || 'Podaj nazwę części']"
                required
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="p.qty"
                label="Ilość"
                type="number"
                min="1"
                :rules="[v => v > 0 || 'Podaj ilość']"
                required
              />
            </v-col>
            <v-col cols="3" class="text-center">
              <v-btn icon small color="error" @click="removePart(i)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn text small @click="addPart">Dodaj część</v-btn>
        </div>

        <v-textarea
          v-model="notes"
          label="Notatki"
          rows="2"
        />
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn text @click="$emit('cancel')">Anuluj</v-btn>
      <v-btn color="primary" :loading="loading" @click="onSubmit">Zapisz</v-btn>
    </v-card-actions>

    <v-alert
      v-if="error"
      color="error"
      variant="outlined"
      class="m-4"
    >
      {{ error }}
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useRepairStore } from '@/stores/repairStore'

const props = defineProps({
  repair: { type: Object, required: true }
})
const emit = defineEmits(['updated','cancel'])

const vehicleStore = useVehicleStore()
const repairStore  = useRepairStore()
const { list: vehiclesRaw } = storeToRefs(vehicleStore)
const { loading, error }    = storeToRefs(repairStore)

const vehicleId = ref(props.repair.vehicle_id)
const date      = ref(props.repair.date)
const mileage   = ref(props.repair.mileage)
const notes     = ref(props.repair.notes || '')
const parts     = reactive(
  Array.isArray(props.repair.parts)
    ? JSON.parse(JSON.stringify(props.repair.parts))
    : []
)

const formRef   = ref(null)
const formValid = ref(false)

watch(
  () => props.repair,
  r => {
    vehicleId.value = r.vehicle_id
    date.value      = r.date
    mileage.value   = r.mileage
    notes.value     = r.notes || ''
    parts.splice(0)
    if (Array.isArray(r.parts)) {
      r.parts.forEach(p => parts.push({ name: p.name, qty: p.qty }))
    }
  },
  { immediate: true }
)

onMounted(() => vehicleStore.fetchActive())

const vehicles = computed(() =>
  vehiclesRaw.value.map(v => ({
    id:    v.id,
    label: `${v.brand} ${v.model} (${v.reg_number})`
  }))
)

function addPart() {
  parts.push({ name: '', qty: 1 })
}
function removePart(i) {
  parts.splice(i, 1)
}

async function onSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value     = true
  repairStore.error = null

  const payload = {
    vehicle_id: vehicleId.value,
    date:       date.value,
    mileage:    mileage.value,
    parts:      parts,
    notes:      notes.value
  }

  const updated = await repairStore.updateRepair(props.repair.id, payload)
  loading.value = false

  if (updated) {
    formRef.value.resetValidation()
    emit('updated', updated)
  }
}
</script>

<style scoped>
.parts-list { border: 1px solid #ccc; padding: 0.75rem; }
</style>
