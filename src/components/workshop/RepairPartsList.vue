<!-- src/components/workshop/RepairPartsList.vue -->
<template>
  <v-card flat class="pa-4">
    <v-card-title class="text-h6">Lista części</v-card-title>

    <v-list dense>
      <v-list-item v-if="!parts.length">
        <v-list-item-content>
          <v-list-item-title>— Brak części —</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
        v-for="p in parts"
        :key="p.id"
        class="d-flex justify-space-between align-center"
      >
        <span>
          {{ p.part_name }} – {{ formatCurrency(p.part_cost) }}
        </span>
        <v-btn icon small color="error" @click="removePart(p.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-list>

    <v-divider class="my-4" />

    <v-card-subtitle class="text-h6">Dodaj część</v-card-subtitle>
    <RepairPartForm
      :repairId="repairId"
      @added="onPartAdded"
      class="mt-2"
    />
  </v-card>
</template>

<script setup>
import { onMounted }     from 'vue'
import { storeToRefs }   from 'pinia'
import { useRepairPartsStore } from '@/stores/repairPartsStore'
import RepairPartForm    from '@/components/workshop/RepairPartForm.vue'

const props = defineProps({
  repairId: { type: String, required: true }
})
const emit = defineEmits(['added'])

const store = useRepairPartsStore()
const { parts, loading, error } = storeToRefs(store)

onMounted(() => {
  store.fetchParts(props.repairId)
})

async function removePart(id) {
  if (!confirm('Usuń tę część?')) return
  await store.deletePart(id)
  // opcjonalnie ponownie fetch, ale store już usunął
}

function onPartAdded() {
  store.fetchParts(props.repairId)
  emit('added')
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN'
  }).format(val)
}
</script>

<style scoped>
.pa-4 { padding: 1rem; }
</style>
