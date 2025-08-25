<!-- src/views/dominik/DominikTasks.vue -->
<template>
  <v-row>
    <v-col cols="12" md="5">
      <v-card outlined>
        <v-card-title>Dodaj zadanie</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submit">
            <v-text-field v-model="form.title" label="Tytuł" required />
            <v-textarea v-model="form.description" label="Opis" rows="3" auto-grow />
            <v-text-field
              v-model="form.due_date"
              label="Termin (YYYY-MM-DD)"
              type="date"
              prepend-inner-icon="mdi-calendar"
            />
            <div class="d-flex gap-2 mt-2">
              <v-btn color="primary" type="submit" :loading="saving">Dodaj</v-btn>
              <v-btn variant="text" @click="reset">Wyczyść</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

       <v-col cols="12" md="7">

      <!-- MOBILE: karty -->
      <template v-if="$vuetify.display.smAndDown">
        <v-row dense>
          <v-col v-for="task in tasks" :key="task.id" cols="12">
            <v-card outlined>
              <v-card-title class="justify-space-between">
                <div class="d-flex align-center">
                  <v-icon start color="blue">mdi-clipboard-text</v-icon>
                  <strong>{{ task.title }}</strong>
                </div>
             
              </v-card-title>

              <v-divider />

              <v-card-text>
                <div>
                  <v-icon start color="grey">mdi-calendar</v-icon>
                  <strong>Utworzone:</strong> {{ formatDate(task.created_at) }}
                </div>
                <div>
                  <v-icon start :color="dueDateClass(task) === 'cell-overdue' ? 'red' : dueDateClass(task) === 'cell-due-today' ? 'orange' : 'green'">
                    mdi-calendar-clock
                  </v-icon>
                  <strong>Termin:</strong> {{ formatDate(task.due_date) }}
                </div>
                <div v-if="task.description">
                  <v-icon start color="teal">mdi-text-long</v-icon>
                  {{ task.description }}
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn variant="outlined" size="small" color="green" prepend-icon="mdi-check" @click="markDone(task)">
                  Zakończ
                </v-btn>
                <v-btn prepend-icon="mdi-pencil" variant="outlined" size="small" @click="edit(task)">
                  Edytuj
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- DESKTOP: tabela -->
      <template v-else>
        <v-card outlined>
          <v-card-title>Twoje zadania</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="tasks"
              :loading="loading"
              item-key="id"
              :items-per-page="10"
              density="compact"
            >
              <template #item.created_at="{ item }">{{ formatDate(item.created_at) }}</template>
              <template #item.due_date="{ item }">
                <div :class="dueDateClass(item)" class="d-flex align-center gap-2">
                  <span>{{ formatDate(item.due_date) }}</span>
                  <span v-if="dueDateClass(item) === 'cell-overdue'">🔴</span>
                  <span v-else-if="dueDateClass(item) === 'cell-due-today'">🟡</span>
                </div>
              </template>
              <template #item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" @click="edit(item)" />
                <v-btn icon="mdi-check" color="green" size="small" class="ml-2" @click="markDone(item)" />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </template>

    </v-col>
  </v-row>

  <v-dialog v-model="editOpen" max-width="520">
    <v-card>
      <v-card-title>Edytuj zadanie</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveEdit">
          <v-text-field v-model="editForm.title" label="Tytuł" required />
          <v-textarea v-model="editForm.description" label="Opis" rows="3" auto-grow />
          <v-text-field
            v-model="editForm.due_date"
            label="Termin"
            type="date"
            prepend-inner-icon="mdi-calendar"
          />
          <div class="d-flex gap-2 mt-2">
            <v-btn color="primary" type="submit" :loading="savingEdit">Zapisz</v-btn>
            <v-btn variant="text" @click="editOpen = false">Anuluj</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
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

const form = ref({ title: '', description: '', due_date: '' })
const saving = ref(false)

async function submit() {
  if (!form.value.title.trim()) return
  try {
    saving.value = true
    await store.add(form.value)
    reset()
  } finally {
    saving.value = false
  }
}
function reset() {
  form.value = { title: '', description: '', due_date: '' }
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('pl-PL')
}

onMounted(() => store.fetchActive())

// edycja
const editOpen = ref(false)
const editForm = ref({ id: null, title: '', description: '', due_date: '' })
const savingEdit = ref(false)

function edit(item) {
  editForm.value = {
    id: item.id,
    title: item.title,
    description: item.description,
    due_date: item.due_date ? item.due_date.slice(0, 10) : ''
  }
  editOpen.value = true
}

async function saveEdit() {
  try {
    savingEdit.value = true
    await store.update(editForm.value.id, {
      title: editForm.value.title,
      description: editForm.value.description,
      due_date: editForm.value.due_date || null
    })
    editOpen.value = false
  } finally {
    savingEdit.value = false
  }
}

async function markDone(item) {
  store.list = store.list.filter(t => t.id !== item.id)
  await store.setDone(item.id, true)
  await store.fetchActive()
}

function dueDateClass(item) {
  if (!item?.due_date) return ''

  const due = new Date(item.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  if (due < today) return 'cell-overdue'
  if (due.getTime() === today.getTime()) return 'cell-due-today'
  return ''
}

</script>
<style scoped>
.cell-overdue {
  background-color: #ffe4e4;
}

.cell-due-today {
  background-color: #fffacc;
}

</style>