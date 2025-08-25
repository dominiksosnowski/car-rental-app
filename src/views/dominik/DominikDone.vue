<!-- src/views/dominik/DominikDone.vue -->
<template>
  <v-card outlined>
    <v-card-title>Ukończone zadania</v-card-title>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="tasks"
        :loading="loading"
        item-key="id"
        density="compact"
      >
        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template #item.due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-undo"
            size="small"
            @click="restore(item)"
            :title="'Przywróć do aktywnych'"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="red"
            class="ml-2"
            @click="remove(item)"
          />
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDominikTasksStore } from '@/stores/dominikTasksStore'

const store = useDominikTasksStore()
const tasks = computed(() => store.list)
const loading = computed(() => store.loading)

const headers = [
  { title: 'Tytuł', key: 'title' },
  { title: 'Utworzone', key: 'created_at' },
  { title: 'Termin', key: 'due_date' },
  { title: 'Opis', key: 'description' },
  { title: 'Akcje', key: 'actions', sortable: false, align: 'end' }
]

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('pl-PL')
}

onMounted(() => store.fetchDone())

async function restore(item) {
  await store.setDone(item.id, false)
}

async function remove(item) {
  await store.remove(item.id)
}
</script>
