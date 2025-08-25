<template>
  <v-form ref="formRef" v-model="valid" lazy-validation @submit.prevent="submit">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="partName"
          label="Nazwa części"
          :rules="[v => !!v || 'Nazwa jest wymagana']"
          required
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="partCost"
          label="Cena"
          type="number"
          :rules="[v => v > 0 || 'Cena > 0']"
          required
        />
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!valid || loading"
          type="submit"
        >
          {{ editMode ? 'Zapisz' : 'Dodaj' }}
        </v-btn>
        <v-btn
          class="ml-2"
          color="grey"
          @click="$emit('cancelEdit')"
        >
          Anuluj
        </v-btn>
      </v-col>
    </v-row>
    <v-alert v-if="error" type="error" dense class="mt-2">
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRepairPartsStore } from '@/stores/repairPartsStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  repairId: { type: String, required: true },
  editMode: { type: Boolean, default: false },
  editPart: { type: Object, default: null }
})
const emit = defineEmits(['added', 'updated', 'cancelEdit'])

const formRef  = ref(null)
const valid    = ref(false)
const partName = ref('')
const partCost = ref(null)
const store    = useRepairPartsStore()
const { loading, error } = storeToRefs(store)

watch(() => props.editPart, (val) => {
  if (val) {
    partName.value = val.part_name
    partCost.value = val.part_cost
  } else {
    partName.value = ''
    partCost.value = null
  }
}, { immediate: true })

async function submit() {
  const ok = await formRef.value.validate()
  if (!ok) return

  if (props.editMode && props.editPart) {
    await store.updatePart(props.editPart.id, {
      part_name: partName.value,
      part_cost: partCost.value
    })
    emit('updated')
  } else {
    await store.createPart(props.repairId, {
      part_name: partName.value,
      part_cost: partCost.value
    })
    emit('added')
  }

  formRef.value.resetValidation()
  partName.value = ''
  partCost.value = null
}
</script>
