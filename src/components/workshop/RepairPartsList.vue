<template>
<v-card flat class="pa-4">
    <div v-if="$vuetify.display.mdAndUp">
  <v-card-title class="d-flex justify-space-between align-center">
    <span class="text-h6">Lista części</span>
    <v-btn color="primary" size="small" @click="openAdd">
      <v-icon start>mdi-plus</v-icon> Dodaj część
    </v-btn>
  </v-card-title>

  <v-list class="parts-list" density="comfortable">
    <template v-if="parts.length">
      <v-list-item class="part-row header-row">
  <v-row class="align-center w-100">
    <v-col cols="6" class="font-weight-bold">
      Nazwa części
    </v-col>
    <v-col cols="3" class="text-right font-weight-bold">
      Cena
    </v-col>
    <v-col cols="3" class="text-right font-weight-bold">
      Akcje
    </v-col>
  </v-row>
</v-list-item>
      <v-list-item
        v-for="(p, idx) in parts.filter(Boolean)"
        :key="p.id"
        class="part-row"
      >
        <v-row class="align-center w-100">
          <v-col cols="6" class="font-weight-medium">
            {{ p.part_name }}
          </v-col>
          <v-col cols="3" class="text-right font-weight-bold">
            {{ formatCurrency(p.part_cost) }}
          </v-col>
          <v-col cols="3" class="text-right">
            <v-btn icon size="small" color="primary" @click="startEdit(p)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click="removePart(p.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-list-item>
    </template>
    <v-list-item v-else>
      <v-list-item-title class="text-center text-grey">
        — Brak części —
      </v-list-item-title>
    </v-list-item>
    <v-list-item class="part-row summary-row">
  <v-row class="align-center w-100">
    <v-col cols="6" class="font-weight-bold">
      Suma
    </v-col>
    <v-col cols="3"></v-col>
        <v-col cols="3" class="text-right font-weight-bold">
      {{ formatCurrency(totalPartsCost) }}
    </v-col>
  </v-row>
</v-list-item>
  </v-list>
</div>
<div v-else>
    <v-card-title class="text-h6 d-flex justify-space-between align-center">
      Lista części
    </v-card-title>
    <v-card-subtittle>
            <v-btn color="primary" @click="openAdd">
        <v-icon start>mdi-plus</v-icon> Dodaj część
      </v-btn>
    </v-card-subtittle>

    <v-list class="parts-list" density="comfortable">
      <template v-if="parts.length">
        <v-list-item
        v-for="(p, idx) in parts.filter(Boolean)"
        :key="p.id"
          :class="idx % 2 === 0 ? 'row-even' : 'row-odd'"
        >
          <v-list-item-title class="font-weight-medium">{{ p.part_name }}</v-list-item-title>
          <v-list-item-subtitle>{{ formatCurrency(p.part_cost) }}</v-list-item-subtitle>
          <template #append>
            <v-btn icon size="small" color="primary" @click="startEdit(p)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click="removePart(p.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </template>
      <v-list-item v-else>
        <v-list-item-title>— Brak części —</v-list-item-title>
      </v-list-item>
    </v-list>

  <!-- Suma -->
  <v-list-item class="summary-row-mobile">
    <div class="d-flex justify-space-between font-weight-bold w-100">
      <span>Suma</span>
      <span>{{ formatCurrency(totalPartsCost) }}</span>
    </div>
  </v-list-item>
</div>
  <!-- Dialogi dodawania i edycji -->
  <v-dialog v-model="addDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">Dodaj część</v-card-title>
      <v-card-text>
        <RepairPartForm
          :repairId="repairId"
          @added="onPartAdded"
          @cancelEdit="closeAdd"
        />
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="editDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">Edytuj część</v-card-title>
      <v-card-text>
        <RepairPartForm
          :repairId="repairId"
          :editMode="true"
          :editPart="editPart"
          @updated="onPartUpdated"
          @cancelEdit="closeEdit"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</v-card>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRepairPartsStore } from '@/stores/repairPartsStore'
import RepairPartForm from '@/components/workshop/RepairPartForm.vue'

const props = defineProps({
  repairId: { type: String, required: true }
})
const emit = defineEmits(['added'])

const store = useRepairPartsStore()
const { parts } = storeToRefs(store)

const addDialog = ref(false)
const editDialog = ref(false)
const editPart = ref(null)

onMounted(() => {
  store.fetchParts(props.repairId)
})

function openAdd() {
  addDialog.value = true
}
function closeAdd() {
  addDialog.value = false
}

function startEdit(part) {
  editPart.value = { ...part }
  editDialog.value = true
}
function closeEdit() {
  editDialog.value = false
  editPart.value = null
}

async function removePart(id) {
  if (!confirm('Usuń tę część?')) return
  await store.deletePart(id)
}

function onPartAdded() {
  store.fetchParts(props.repairId)
  emit('added')
  closeAdd()
}

function onPartUpdated() {
  store.fetchParts(props.repairId)
  closeEdit()
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN'
  }).format(val)
}
const totalPartsCost = computed(() =>
  parts.value.reduce((sum, p) => sum + (p?.part_cost || 0), 0)
)

</script>

<style scoped>
.parts-list {
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
}

.part-row:hover{
  background-color: rgba(128, 128, 128, 0.2);
}
.part-row{
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  transition: background-color 0.3s ease; 
}

.font-weight-bold { font-weight: 600; }
.font-weight-medium { font-weight: 500; }
.header-row {
  background-color: #f0f0f0;
  border-bottom: 2px solid #ddd;
}

.summary-row {
  background-color: #fafafa;
  border-top: 2px solid #ddd;
}

.part-row,
.part-row-mobile {
  transition: background-color 0.3s ease;
}

.part-row:hover,
.part-row-mobile:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.summary-row-mobile {
  background-color: #fafafa;
  border-top: 2px solid #ddd;
}

</style>
