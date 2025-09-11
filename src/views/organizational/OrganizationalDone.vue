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

    <!-- Karta: W tym tygodniu -->
    <v-card outlined class="mb-4">
      <v-card-title class="bg-amber-lighten-4">
        <v-icon color="orange" class="me-2">mdi-calendar-week</v-icon>
        W tym tygodniu
      </v-card-title>
      <v-card-text>
        <TaskList :show-actions="false" :items="thisWeek" />
      </v-card-text>
    </v-card>

    <!-- Karta: W tym miesiącu -->
    <v-card outlined>
      <v-card-title class="bg-green-lighten-4">
        <v-icon color="green" class="me-2">mdi-calendar-month</v-icon>
        W tym miesiącu
      </v-card-title>
      <v-card-text>
        <TaskList :show-actions="false" :items="thisMonthOnly" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrganizationalTodoStore } from '@/stores/organizationalTodoStore'
import TaskList from '@/components/organizational/TaskList.vue'

const store = useOrganizationalTodoStore()

const month = ref(new Date().toISOString().slice(0, 7))
const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})

// Daty referencyjne
const today = new Date()
today.setHours(0, 0, 0, 0)

const startOfWeek = new Date(today)
startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
startOfWeek.setHours(0, 0, 0, 0)

const endOfWeek = new Date(startOfWeek)
endOfWeek.setDate(startOfWeek.getDate() + 6)
endOfWeek.setHours(23, 59, 59, 999)

// Wszystkie zadania oznaczone jako zrobione
const filteredItems = computed(() => {
  return store.items.filter(item => {
    if (!item.date) return false
    return item.done === true
  })
})

// W tym tygodniu
const thisWeek = computed(() =>
  filteredItems.value.filter(i => {
    const d = new Date(i.date)
    return d >= startOfWeek && d <= endOfWeek
  })
)

// W tym miesiącu (poza tym tygodniem)
const thisMonthOnly = computed(() =>
  filteredItems.value.filter(i => {
    const d = new Date(i.date)
    return (
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear() &&
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

onMounted(() => {
  store.fetchDone()
})
</script>
