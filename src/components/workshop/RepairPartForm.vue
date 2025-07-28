<!-- src/components/workshop/RepairPartForm.vue -->
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
      <v-col cols="12" md="2" class="d-flex align-center">
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!valid || loading"
          type="submit"
        >
          Dodaj
        </v-btn>
      </v-col>
    </v-row>
    <v-alert v-if="error" type="error" dense class="mt-2">
      {{ error }}
    </v-alert>
  </v-form>
</template>

<script setup>
import { ref }      from 'vue'
import { useRepairPartsStore } from '@/stores/repairPartsStore'
import { storeToRefs }                  from 'pinia'  

const props = defineProps({
  repairId: { type: String, required: true }
})
const emit = defineEmits(['added'])

const formRef  = ref(null)
const valid    = ref(false)
const partName = ref('')
const partCost = ref(null)
const store    = useRepairPartsStore()
const { loading, error } = storeToRefs(store)

async function submit() {
  const ok = await formRef.value.validate()
  if (!ok) return

  await store.createPart(props.repairId, {
    part_name: props.partName ?? partName.value,
    part_cost: partCost.value
  })
  formRef.value.resetValidation()
  partName.value = ''
  partCost.value = null
  emit('added')
}
</script>

<style scoped>
.mt-2 { margin-top: 0.5rem; }
</style>
