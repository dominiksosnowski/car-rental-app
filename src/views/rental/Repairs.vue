<!-- src/views/rental/Repairs.vue -->
<template>
  <v-container fluid class="pa-4">
    <!-- Nagłówek i przycisk dodawania -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="auto">
        <h2 class="text-h5">Naprawy pojazdów</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="showAddForm = true">
          Nowa naprawa
        </v-btn>
      </v-col>
    </v-row>

    <!-- Dialog: dodawanie naprawy -->
    <v-dialog v-model="showAddForm" max-width="1000" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">Nowa naprawa</span>
        </v-card-title>
        <v-divider/>
        <v-card-text>
          <RepairForm
            @saved="onSaved"
            @cancel="showAddForm = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Tabela napraw -->
    <v-data-table
      :headers="headers"
      :items="repairs"
      item-key="id"
      :items-per-page="5"
      class="elevation-1"
    >
      <!-- Marka -->
      <template #item.brand="{ item }">
        {{ item.vehicle?.brand || '–' }}
      </template>
      <!-- Model -->
      <template #item.model="{ item }">
        {{ item.vehicle?.model || '–' }}
      </template>
      <!-- Nr rej. -->
      <template #item.reg_number="{ item }">
        {{ item.vehicle?.reg_number || '–' }}
      </template>
      <!-- Data -->
      <template #item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>
      <!-- Przebieg -->
      <template #item.mileage="{ item }">
        {{ item.mileage || '–' }} km
      </template>
      <!-- Części -->
      <template #item.parts="{ item }">
        <span v-if="item.parts.length">
          {{ item.parts.map(p => `${p.name} × ${p.qty}`).join(', ') }}
        </span>
        <span v-else>— brak danych —</span>
      </template>
      <!-- Uwagi -->
      <template #item.notes="{ item }">
        {{ item.notes || '–' }}
      </template>
      <!-- Edytuj -->
      <template #item.edit="{ item }">
        <v-btn icon small @click="startEdit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <!-- Usuń -->
      <template #item.delete="{ item }">
        <v-btn icon small color="error" @click="remove(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
      <!-- Brak danych -->
      <template #no-data>
        <v-alert color="info" variant="outlined">
          — Brak napraw —
        </v-alert>
      </template>
    </v-data-table>

    <!-- Dialog: edycja naprawy -->
    <v-dialog v-model="showEditForm" max-width="1000" persistent>
      <v-card v-if="editing">
        <v-card-title>
          <span class="text-h6">Edytuj naprawę</span>
        </v-card-title>
        <v-divider/>
        <v-card-text>
          <EditRepairForm
            :repair="editing"
            @updated="onUpdated"
            @cancel="showEditForm = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Loading -->
    <div v-if="loading" class="text-center my-4">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Błąd -->
    <v-alert v-if="error" color="error" variant="outlined" class="mt-4">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted }  from 'vue'
import { storeToRefs }     from 'pinia'
import { useRepairStore }  from '@/stores/repairStore'
import RepairForm          from '@/components/rental/RepairForm.vue'
import EditRepairForm      from '@/components/rental/EditRepairForm.vue'

const store     = useRepairStore()
const { list: repairs, loading, error } = storeToRefs(store)

const showAddForm  = ref(false)
const showEditForm = ref(false)
const editing      = ref(null)

onMounted(() => store.fetchAll())

async function onSaved() {
  showAddForm.value = false
  await store.fetchAll()
}

function startEdit(r) {
  editing.value = { ...r }
  showEditForm.value = true
}

async function onUpdated() {
  showEditForm.value = false
  editing.value      = null
  await store.fetchAll()
}

async function remove(id) {
  if (!confirm('Usuń tę naprawę?')) return
  await store.deleteRepair(id)
  await store.fetchAll()
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '–'
}

const headers = [
  { title: 'Marka',     key: 'brand',     align: 'start' },
  { title: 'Model',     key: 'model' },
  { title: 'Nr rej.',   key: 'reg_number' },
  { title: 'Data',      key: 'date',      align: 'center' },
  { title: 'Przebieg',  key: 'mileage',   align: 'center' },
  { title: 'Części',    key: 'parts',     sortable: false },
  { title: 'Uwagi',     key: 'notes',     sortable: false },
  { title: 'Edytuj',    key: 'edit',      sortable: false, align: 'center' },
  { title: 'Usuń',      key: 'delete',    sortable: false, align: 'center' },
]
</script>
