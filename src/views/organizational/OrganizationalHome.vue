<template>
  <v-container>
    <!-- Pasek statystyk -->
    <v-row class="mb-6" dense>
      <v-col cols="12" sm="3">
        <v-sheet class="pa-4 text-center" color="blue-lighten-4" rounded>
          <div class="text-h6">Do zrobienia (7 dni)</div>
          <div class="text-h4 font-weight-bold">{{ upcomingTodos.length }}</div>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="3">
        <v-sheet class="pa-4 text-center" color="green-lighten-4" rounded>
          <div class="text-h6">Świeżo zrobione (7 dni)</div>
          <div class="text-h4 font-weight-bold">{{ recentDone.length }}</div>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="3">
        <v-sheet class="pa-4 text-center" color="amber-lighten-4" rounded>
          <div class="text-h6">Miesięczne do zrobienia</div>
          <div class="text-h4 font-weight-bold">{{ monthlyPending.length }}</div>
        </v-sheet>
      </v-col>
      <v-col cols="12" sm="3">
        <v-sheet class="pa-4 text-center" color="purple-lighten-4" rounded>
          <div class="text-h6">Przekazy (miesiąc)</div>
          <div class="text-h4 font-weight-bold">{{ monthlyTransfersTotal }} zł</div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Najbliższe rzeczy do zrobienia -->
    <v-card outlined class="mb-4">
      <v-card-title class="bg-blue-lighten-4">
        <v-icon class="me-2" color="blue">mdi-calendar-clock</v-icon>
        Najbliższe rzeczy do zrobienia (7 dni)
      </v-card-title>
      <v-card-text>
        <TaskList :items="upcomingTodos" :show-actions="false" />
      </v-card-text>
    </v-card>

    <!-- Świeżo zrobione -->
    <v-card outlined class="mb-4">
      <v-card-title class="bg-green-lighten-4">
        <v-icon class="me-2" color="green">mdi-check-circle</v-icon>
        Świeżo zrobione (7 dni)
      </v-card-title>
      <v-card-text>
        <TaskList :items="recentDone" :show-actions="false" />
      </v-card-text>
    </v-card>

    <!-- Zadania miesięczne -->
    <v-card outlined class="mb-4">
      <v-card-title class="bg-amber-lighten-4">
        <v-icon class="me-2" color="orange">mdi-calendar-month</v-icon>
        Zadania miesięczne do zrobienia
      </v-card-title>
      <v-card-text>
        <TaskList :items="monthlyPending" mode="monthly" :show-actions="false" />
      </v-card-text>
    </v-card>

    <!-- Przekazy pieniężne -->
    <v-card outlined>
      <v-card-title class="bg-purple-lighten-4">
        <v-icon class="me-2" color="purple">mdi-cash</v-icon>
        Przekazy pieniężne
      </v-card-title>
      <v-card-text>
        <div class="mb-2">
          <strong>Łącznie w tym tygodniu:</strong> {{ weeklyTransfersTotal }} zł
        </div>
        <div class="mb-4">
          <strong>Łącznie w tym miesiącu:</strong> {{ monthlyTransfersTotal }} zł
        </div>
        <v-divider class="mb-2" />
        <v-list density="compact">
          <v-list-item v-for="t in transfersThisMonth" :key="t.id">
            <v-list-item-content>
              <div class="d-flex justify-space-between">
                <span>{{ new Date(t.date).toLocaleDateString('pl-PL') }} - {{ t.name }}</span>
                <strong>{{ t.amount }} zł</strong>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import TaskList from '@/components/organizational/TaskList.vue'
import { useOrganizationalTodoStore } from '@/stores/organizationalTodoStore'
import { useOrganizationalMonthlyTasksStore } from '@/stores/organizationalMonthlyTasksStore'
import { useOrganizationalMoneyGivenStore } from '@/stores/organizationalMoneyGivenStore'

const todoStore = useOrganizationalTodoStore()
const monthlyStore = useOrganizationalMonthlyTasksStore()
const moneyGivenStore = useOrganizationalMoneyGivenStore()

onMounted(() => {
  todoStore.fetchAll()
  monthlyStore.fetchAll()
  moneyGivenStore.fetchAll()
})

const today = new Date()
today.setHours(0, 0, 0, 0)

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isCurrentMonth(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

// --- Zadania z todo w ciągu 7 dni ---
const upcomingTodos = computed(() =>
  todoStore.items.filter(i => {
    const d = new Date(i.date)
    return !i.done && d >= today && d <= addDays(today, 7)
  }).sort((a, b) => new Date(a.date) - new Date(b.date))
)

// --- Zadania z todo i monthly zrobione w ciągu 7 dni ---
const recentDone = computed(() => {
  const all = [...todoStore.items, ...monthlyStore.items]
  return all.filter(i => {
    if (!i.done) return false
    const updated = new Date(i.updated_at || i.date)
    return updated >= addDays(today, -7)
  }).sort((a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date))
})

// --- Zadania miesięczne bieżącego miesiąca niezrobione ---
const monthlyPending = computed(() =>
  monthlyStore.items.filter(i => !i.done && isCurrentMonth(i.date))
)

// --- Przekazy pieniężne ---
const transfersThisMonth = computed(() =>
  moneyGivenStore.items.filter(t => isCurrentMonth(t.date))
)

const monthlyTransfersTotal = computed(() =>
  transfersThisMonth.value.reduce((sum, t) => sum + Number(t.amount || 0), 0)
)

const weeklyTransfersTotal = computed(() => {
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return moneyGivenStore.items
    .filter(t => {
      const d = new Date(t.date)
      return d >= startOfWeek && d <= endOfWeek
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)
})
</script>

