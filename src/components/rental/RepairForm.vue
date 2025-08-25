<template>
  <v-form @submit.prevent="onSubmit" ref="formRef" v-model="formValid">
    <v-row>
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="vehicleId"
          :items="vehicles"
          item-title="label"
          item-value="id"
          label="Pojazd"
          :disabled="!vehicles.length"
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

    <div class="parts-list">
      <h4>Części</h4>
      <v-row
        v-for="(p, i) in parts"
        :key="i"
        align="center"
        class="mb-2"
      >
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

      <v-btn text small @click="addPart">
        Dodaj część
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12">
        <v-textarea
          v-model="notes"
          label="Notatki"
          rows="2"
        />
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" class="text-right">
        <v-btn text class="mr-2" @click="cancel">
          Anuluj
        </v-btn>
        <v-btn
          :loading="loading"
          color="primary"
          type="submit"
        >
          {{ loading ? 'Zapis…' : 'Zapisz naprawę' }}
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
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useRepairStore } from '@/stores/repairStore'

const emit         = defineEmits(['saved','cancel'])
const store        = useRepairStore()
const vehicleStore = useVehicleStore()
const { list: vehiclesRaw } = storeToRefs(vehicleStore)
const { loading, error }    = storeToRefs(store)

const vehicleId  = ref('')
const date       = ref('')
const mileage    = ref(0)
const notes      = ref('')
const parts      = reactive([])

const formRef    = ref(null)
const formValid  = ref(false)

onMounted(async () => {
  await vehicleStore.fetchActive()
})

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

function cancel() {
  emit('cancel')
}

async function onSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  store.error   = null

  const payload = {
    vehicle_id: vehicleId.value,
    date:       date.value,
    mileage:    mileage.value,
    parts:      parts,
    notes:      notes.value,
  }

  const result = await store.addRepair(payload)
  loading.value = false

  if (result) {
    formRef.value.resetValidation()
    vehicleId.value = ''
    date.value      = ''
    mileage.value   = 0
    notes.value     = ''
    parts.splice(0)
    emit('saved')
  }
}
</script>

<style scoped>
.parts-list {
  border: 1px solid #ccc;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
</style>
