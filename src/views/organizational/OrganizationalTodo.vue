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

      <div class="d-flex justify-start mb-4">
        <v-btn color="primary" @click="openDialog()">
          <v-icon start>mdi-plus</v-icon> Dodaj zadanie
        </v-btn>
      </div>

    <!-- Karta: Zaległe -->
    <v-card outlined class="mb-4">
      <v-card-title class="bg-red-lighten-4">
        <v-icon color="red" class="me-2">mdi-alert</v-icon>
        Zaległe
      </v-card-title>
      <v-card-text>
        <TaskList mode="todo" :items="overdue" @edit="openDialog"  @toggle-done="toggleDone" @delete="deleteItem"/>
      </v-card-text>
    </v-card>

    <!-- Karta: W tym tygodniu -->
    <v-card outlined class="mb-4">
      <v-card-title class="bg-amber-lighten-4">
        <v-icon color="orange" class="me-2">mdi-calendar-week</v-icon>
        W tym tygodniu
      </v-card-title>
      <v-card-text>
        <TaskList mode="todo" :items="thisWeek" @edit="openDialog"@toggle-done="toggleDone" @delete="deleteItem"/>
      </v-card-text>
    </v-card>

    <!-- Karta: W tym miesiącu -->
    <v-card outlined>
      <v-card-title class="bg-green-lighten-4">
        <v-icon color="green" class="me-2">mdi-calendar-month</v-icon>
        W tym miesiącu
      </v-card-title>
      <v-card-text>
        <TaskList mode="todo" :items="thisMonthOnly" @edit="openDialog" @toggle-done="toggleDone" @delete="deleteItem"/>
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
import { ref, computed, onMounted } from 'vue'
import { useOrganizationalTodoStore } from '@/stores/organizationalTodoStore'
import TaskList from '@/components/organizational/TaskList.vue'

const store = useOrganizationalTodoStore()

const dialog = ref(false)
const editedItem = ref({ id: null, date: '', name: '', note: '' })
const formRef = ref(null)

function openDialog(item = null) {
  editedItem.value = item ? { ...item } : { id: null, date: '', name: '', note: '' }
  dialog.value = true
}

async function save() {
  if (!editedItem.value.date || !editedItem.value.name) return
  if (editedItem.value.id) {
    await store.update(editedItem.value.id, {
      date: editedItem.value.date,
      name: editedItem.value.name,
      note: editedItem.value.note
    })
  } else {
    await store.add({
      date: editedItem.value.date,
      name: editedItem.value.name,
      note: editedItem.value.note
    })
  }
  dialog.value = false
}

async function markAsDone(id) {
  await store.markDone(id)
}

const month = ref(new Date().toISOString().slice(0, 7))
const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})

// Ustawienie dat referencyjnych z wyzerowanymi godzinami
const today = new Date()
today.setHours(0, 0, 0, 0)

const startOfWeek = new Date(today)
startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
startOfWeek.setHours(0, 0, 0, 0)

const endOfWeek = new Date(startOfWeek)
endOfWeek.setDate(startOfWeek.getDate() + 6)
endOfWeek.setHours(23, 59, 59, 999)

// Filtrujemy tylko zadania z wybranego miesiąca i nieoznaczone jako zrobione
const filteredItems = computed(() => {
  return store.items.filter(item => {
    if (!item.date) return false
    const d = new Date(item.date)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return ym === month.value && item.done === false
  })
})

// Zaległe
const overdue = computed(() =>
  filteredItems.value.filter(i => new Date(i.date) < today)
)

// W tym tygodniu (bez zaległych)
const thisWeek = computed(() =>
  filteredItems.value.filter(i => {
    const d = new Date(i.date)
    return d >= startOfWeek && d <= endOfWeek && !overdue.value.includes(i)
  })
)

// W tym miesiącu (bez zaległych i bez tego tygodnia)
const thisMonthOnly = computed(() =>
  filteredItems.value.filter(i => {
    const d = new Date(i.date)
    return (
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear() &&
      !overdue.value.includes(i) &&
      !thisWeek.value.includes(i)
    )
  })
)

function shiftMonth(delta) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth() { shiftMonth(-1) }
function nextMonth() { shiftMonth(1) }

async function deleteItem(id) {
  if (confirm('Na pewno usunąć to zadanie?')) {
    await store.remove(id)
  }
}
async function toggleDone(payload) {
  // payload = { id, done }
  await store.update(payload.id, { done: payload.done })
}

onMounted(() => {
  store.fetchAll()
})
</script>

