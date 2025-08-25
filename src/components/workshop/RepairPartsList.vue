<template>
  <v-card flat class="pa-4">
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

    <!-- Modal dodawania -->
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

    <!-- Modal edycji -->
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
import { ref, onMounted } from 'vue'
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
</script>

<style scoped>
.parts-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
}
.row-even { background-color: #fafafa; }
.row-odd { background-color: white; }
</style>
