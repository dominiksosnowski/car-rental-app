<template>
  <v-container>
    <!-- Pasek wyboru miesiąca -->
    <v-sheet
      class="pa-3 mb-4 d-flex align-center justify-center"
      color="blue-lighten-4"
      rounded
      elevation="1"
    >
      <v-btn @click="prevMonth" :disabled="store.loading">
        <v-icon size="32">mdi-chevron-left</v-icon>
      </v-btn>

      <span class="month-display mx-4 text-h6 font-weight-bold">
        {{ monthLabel }}
      </span>

      <v-btn @click="nextMonth" :disabled="store.loading">
        <v-icon size="32">mdi-chevron-right</v-icon>
      </v-btn>
    </v-sheet>

    <!-- Przyciski akcji -->
      <div class="mb-2">
        Liczba zadań: {{ filteredItems.length }}
      </div>
      <div class="mb-2">
        <v-btn color="primary" @click="openDialog()">
          <v-icon start>mdi-plus</v-icon> Dodaj zadanie
        </v-btn>
      </div>
      <div class="mb-4">
        <v-btn color="secondary" @click="copyPrevMonth">
          <v-icon start>mdi-content-copy</v-icon> Skopiuj z poprzedniego miesiąca
        </v-btn>
      </div>


    <!-- Lista zadań -->
    <v-card outlined>
      <v-card-title class="bg-green-lighten-5">
        <v-icon color="green" class="me-2">mdi-calendar-month</v-icon>
        Zadania miesięczne
      </v-card-title>
      <v-card-text>
        <TaskList
          :items="filteredItems"
          mode="monthly"
          @edit="openDialog"
          @delete="deleteItem"
          @toggle-done="toggleDone"
        />
      </v-card-text>
    </v-card>

    <!-- Dialog formularza -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editedItem.id ? 'Edytuj zadanie' : 'Dodaj zadanie' }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="save">
            <v-text-field
              v-model="editedItem.date"
              label="Data"
              type="date"
              required
            />
            <v-text-field
              v-model="editedItem.name"
              label="Nazwa"
              required
            />
            <v-textarea
              v-model="editedItem.note"
              label="Notatki"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Anuluj</v-btn>
          <v-btn color="primary" @click="save">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOrganizationalMonthlyTasksStore } from '@/stores/organizationalMonthlyTasksStore'
import TaskList from '@/components/organizational/TaskList.vue'

const store = useOrganizationalMonthlyTasksStore()

const dialog = ref(false)
const editedItem = ref({ date: '', name: '', note: '', recurring: true })
const formRef = ref(null)

const month = ref(new Date().toISOString().slice(0, 7))
const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})

const filteredItems = computed(() => {
  return [...store.items]
    .filter(item => {
      if (!item.date) return false
      const d = new Date(item.date)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return ym === month.value
    })
    .sort((a, b) => {
      const da = new Date(a.date)
      const db = new Date(b.date)
      return da - db // sortowanie tylko po dacie
    })
})



function openDialog(item = null) {
  editedItem.value = item
    ? { ...item }
    : { date: month.value + '-01', name: '', note: '', recurring: true }
  dialog.value = true
}

async function save() {
  if (!editedItem.value.date || !editedItem.value.name) return
  if (editedItem.value.id) {
    await store.update(editedItem.value.id, editedItem.value)
  } else {
    await store.add(editedItem.value)
  }
  dialog.value = false
}

async function deleteItem(id) {
  if (confirm('Na pewno usunąć to zadanie?')) {
    await store.remove(id)
  }
}

async function markAsDone(id) {
  await store.markDone(id)
}

async function copyPrevMonth() {
  const [y, m] = month.value.split('-').map(Number)
  await store.copyFromPreviousMonth(y, m)
}

function shiftMonth(delta) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth() { shiftMonth(-1) }
function nextMonth() { shiftMonth(1) }

watch(month, async () => {
  await store.fetchAll()
})

async function toggleDone(item) {
  await store.update(item.id, { done: item.done })
}

onMounted(async () => {
  await store.fetchAll()
})
</script>
