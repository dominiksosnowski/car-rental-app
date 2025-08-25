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

    <!-- MOBILE: karty -->
    <v-row v-if="$vuetify.display.smAndDown">
      <v-col v-for="item in repairs" :key="item.id" cols="12">
        <v-card outlined>
          <v-card-title class="justify-space-between">
            <span class="text-subtitle-1">
              <v-icon start color="indigo">mdi-car</v-icon>
              {{ item.vehicle?.brand || '–' }} {{ item.vehicle?.model || '–' }}
              ({{ item.vehicle?.reg_number || '–' }})
            </span>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div>
              <v-icon start color="blue">mdi-calendar</v-icon>
              <strong>Data:</strong> {{ formatDate(item.date) }}
            </div>
            <div>
              <v-icon start color="orange">mdi-counter</v-icon>
              <strong>Przebieg:</strong> {{ item.mileage || '–' }} km
            </div>
            <div>
              <v-icon start color="green">mdi-tools</v-icon>
              <strong>Części:</strong>
              <span v-if="item.parts.length">
                {{ item.parts.map(p => `${p.name} × ${p.qty}`).join(', ') }}
              </span>
              <span v-else>— brak danych —</span>
            </div>
            <div>
              <v-icon start color="grey">mdi-note-text</v-icon>
              <strong>Uwagi:</strong> {{ item.notes || '–' }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn size="small" prepend-icon="mdi-pencil" @click="startEdit(item)">Edytuj</v-btn>
            <v-btn size="small" color="error" prepend-icon="mdi-delete" @click="remove(item.id)">Usuń</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- DESKTOP: tabela -->
    <v-data-table
      v-else
      :headers="headers"
      :items="repairs"
      item-key="id"
      :items-per-page="5"
      class="elevation-1"
    >
      <template #item.brand="{ item }">{{ item.vehicle?.brand || '–' }}</template>
      <template #item.model="{ item }">{{ item.vehicle?.model || '–' }}</template>
      <template #item.reg_number="{ item }">{{ item.vehicle?.reg_number || '–' }}</template>
      <template #item.date="{ item }">{{ formatDate(item.date) }}</template>
      <template #item.mileage="{ item }">{{ item.mileage || '–' }} km</template>
      <template #item.parts="{ item }">
        <span v-if="item.parts.length">
          {{ item.parts.map(p => `${p.name} × ${p.qty}`).join(', ') }}
        </span>
        <span v-else>— brak danych —</span>
      </template>
      <template #item.notes="{ item }">{{ item.notes || '–' }}</template>
      <template #item.edit="{ item }">
        <v-btn icon small @click="startEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
      </template>
      <template #item.delete="{ item }">
        <v-btn icon small color="error" @click="remove(item.id)"><v-icon>mdi-delete</v-icon></v-btn>
      </template>
      <template #no-data>
        <v-alert color="info" variant="outlined">— Brak napraw —</v-alert>
      </template>
    </v-data-table>

    <!-- Dialog: dodawanie naprawy -->
    <v-dialog v-model="showAddForm" max-width="1000" persistent>
      <v-card>
        <v-card-title><span class="text-h6">Nowa naprawa</span></v-card-title>
        <v-divider/>
        <v-card-text>
          <RepairForm @saved="onSaved" @cancel="showAddForm = false" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog: edycja naprawy -->
    <v-dialog v-model="showEditForm" max-width="1000" persistent>
      <v-card v-if="editing">
        <v-card-title><span class="text-h6">Edytuj naprawę</span></v-card-title>
        <v-divider/>
        <v-card-text>
          <EditRepairForm :repair="editing" @updated="onUpdated" @cancel="showEditForm = false" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Loading -->
    <div v-if="loading" class="text-center my-4">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Błąd -->
    <v-alert v-if="error" color="error" variant="outlined" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRepairStore } from '@/stores/repairStore'
import RepairForm from '@/components/rental/RepairForm.vue'
import EditRepairForm from '@/components/rental/EditRepairForm.vue'

const store = useRepairStore()
const { list: repairs, loading, error } = storeToRefs(store)

const showAddForm = ref(false)
const showEditForm = ref(false)
const editing = ref(null)

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
  editing.value = null
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
