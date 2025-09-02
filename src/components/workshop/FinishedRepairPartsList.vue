<!-- src/components/workshop/FinishedRepairPartsList.vue -->
<template>
<v-card flat class="pa-4">
  <!-- Desktop -->
  <div v-if="$vuetify.display.mdAndUp">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">Lista części</span>
    </v-card-title>

    <v-list class="parts-list" density="comfortable">
      <template v-if="parts.length">
        <!-- Nagłówek -->
        <v-list-item class="part-row header-row">
          <v-row class="align-center w-100">
            <v-col cols="9" class="font-weight-bold">
              Nazwa części
            </v-col>
            <v-col cols="3" class="text-right font-weight-bold">
              Cena
            </v-col>
          </v-row>
        </v-list-item>

        <!-- Wiersze -->
        <v-list-item
          v-for="(p, idx) in parts.filter(Boolean)"
          :key="p.id"
          class="part-row"
        >
          <v-row class="align-center w-100">
            <v-col cols="9" class="font-weight-medium">
              {{ p.part_name }}
            </v-col>
            <v-col cols="3" class="text-right font-weight-bold">
              {{ formatCurrency(p.part_cost) }}
            </v-col>
          </v-row>
        </v-list-item>


      </template>

      <v-list-item v-else>
        <v-list-item-title class="text-center text-grey">
          — Brak części —
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>

  <!-- Mobile -->
  <div v-else>
    <v-card-title class="text-h6">Lista części</v-card-title>

    <v-list class="parts-list" density="comfortable">
      <template v-if="parts.length">
        <v-list-item
          v-for="(p, idx) in parts.filter(Boolean)"
          :key="p.id"
          :class="idx % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <v-list-item-title class="font-weight-medium">
            {{ p.part_name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ formatCurrency(p.part_cost) }}
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <v-list-item v-else>
        <v-list-item-title>— Brak części —</v-list-item-title>
      </v-list-item>
    </v-list>

  </div>
</v-card>

</template>

<script setup>
import { onMounted }     from 'vue'
import { storeToRefs }   from 'pinia'
import { useRepairPartsStore } from '@/stores/repairPartsStore'


const props = defineProps({
  repairId: { type: String, required: true }
})
const emit = defineEmits(['added'])

const store = useRepairPartsStore()
const { parts, loading, error } = storeToRefs(store)

onMounted(() => {
  store.fetchParts(props.repairId)
})

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN'
  }).format(val)
}
</script>

<style scoped>
.parts-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
}

.header-row {
  background-color: #f0f0f0;
  border-bottom: 2px solid #ddd;
}

.summary-row {
  background-color: #fafafa;
  border-top: 2px solid #ddd;
}

.row-even { background-color: #fafafa; }
.row-odd { background-color: white; }

.summary-row-mobile {
  background-color: #fafafa;
  border-top: 2px solid #ddd;
}

</style>
