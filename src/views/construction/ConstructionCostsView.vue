<!-- src/views/construction/ConstructionCostsView.vue -->
<template>
  <v-card outlined>
    <v-card-text>
      <!-- Pasek wyboru miesiąca -->
      <v-sheet
        class="pa-3 mb-4 d-flex align-center justify-center"
        color="blue-lighten-4"
        rounded
        elevation="1"
      >
        <v-btn icon @click="prevMonth" :disabled="store.loading">
          <v-icon size="32">mdi-chevron-left</v-icon>
        </v-btn>

        <span class="month-display mx-4 text-h6 font-weight-medium">
          {{ monthLabel }}
        </span>

        <v-btn icon @click="nextMonth" :disabled="store.loading">
          <v-icon size="32">mdi-chevron-right</v-icon>
        </v-btn>
      </v-sheet>

      <!-- Podsumowanie: suma kosztów miesiąca / tygodnia -->
      <v-sheet
        class="pa-3 mb-4 text-h5"
        color="blue-lighten-5"
        rounded
        elevation="1"
      >
        <v-row align="center">
          <v-col
            cols="12" md="12"
            class="d-flex align-center justify-space-between justify-md-center"
          >
            <v-icon class="me-2" color="purple">mdi-calendar-month</v-icon>
            <strong>Suma (miesiąc):</strong>
            <span class="text-success text-h6">
              {{ formatCurrency(monthlyTotal) }}
            </span>
          </v-col>

          <v-divider
            vertical
            class="d-none d-md-flex"
            color="black"
            thickness="2"
          />
        </v-row>
      </v-sheet>

      <!-- Przycisk Dodaj koszt -->
      <v-row class="mb-4">
        <v-col>
          <v-btn color="primary" @click="openDialog">
            <v-icon start>mdi-plus</v-icon>
            Dodaj koszt
          </v-btn>
        </v-col>
      </v-row>

      <!-- Siatka kart z kosztami -->
      <v-row>
        <v-col
          v-for="item in filteredCosts"
          :key="item.id"
          cols="12" sm="6" md="4"
        >
<v-card elevation="2" class="mb-4">
  <!-- Nagłówek: data -->
  <v-card-title
    class="d-flex justify-space-between align-center"
    style="background: #f5f5f5"
  >
    <div class="d-flex align-center">
      <v-icon class="me-2" color="purple">mdi-calendar</v-icon>
      {{ new Date(item.date).toLocaleDateString('pl-PL') }}
    </div>
  </v-card-title>

  <!-- Główna treść: opis i kwota obok siebie -->
  <v-card-text>
    <v-row no-gutters>
      <v-col cols="6" class="d-flex align-center">
        <v-icon class="me-2" color="grey">mdi-text-box-outline</v-icon>
        <span>{{ item.description }}</span>
      </v-col>
      <v-col cols="6" class="d-flex align-center justify-end">
        <span class="text-h6 text-success">{{ formatCurrency(item.amount) }}</span>
      </v-col>
    </v-row>
  </v-card-text>

  <!-- Akcje: Edytuj / Usuń -->
  <v-card-actions class="justify-end py-2">
    <v-btn color="blue" size="small" @click="edit(item)">
      <v-icon start>mdi-pencil</v-icon>
      Edytuj
    </v-btn>
    <v-btn color="red" size="small" @click="remove(item.id)">
      <v-icon start>mdi-delete</v-icon>
      Usuń
    </v-btn>
  </v-card-actions>
</v-card>

        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- Dialog Dodaj / Edytuj -->
  <v-dialog v-model="dialog" max-width="480px">
    <v-card>
      <v-card-title>
        <span class="text-h6">
          {{ newEntry.id ? 'Edytuj koszt' : 'Dodaj koszt' }}
        </span>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveCost">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="newEntry.date"
                label="Data"
                type="date"
                :min="monthFirst"
                :max="monthLast"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="newEntry.amount"
                label="Kwota"
                type="number"
                step="0.01"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="newEntry.description"
                label="Opis"
                required
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog">Anuluj</v-btn>
        <v-btn color="primary" @click="saveCost">
          {{ newEntry.id ? 'Zapisz' : 'Dodaj' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConstructionCostsStore } from '@/stores/organizationalConstructionCostsStore'

const store = useConstructionCostsStore()
onMounted(() => store.fetchAll())

const dialog = ref(false)
const newEntry = ref({ id: null, date: '', description: '', amount: '' })

const month = ref(new Date().toISOString().slice(0, 7))
const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})
function shiftMonth(delta) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const prevMonth = () => shiftMonth(-1)
const nextMonth = () => shiftMonth(1)

const monthFirst = computed(() => month.value + '-01')
const monthLast = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`
})

function parseDate(str) { return new Date(str + 'T00:00:00') }

const filteredCosts = computed(() =>
  store.items
    .filter(i => i.date?.slice(0, 7) === month.value)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))
)

const monthlyTotal = computed(() =>
  filteredCosts.value.reduce((sum, c) => sum + Number(c.amount || 0), 0)
)

const weeklyTotal = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return filteredCosts.value
    .filter(c => {
      const d = parseDate(c.date)
      return d >= start && d <= end
    })
    .reduce((sum, c) => sum + Number(c.amount || 0), 0)
})

function openDialog() {
  newEntry.value = { id: null, date: '', description: '', amount: '' }
  dialog.value = true
}
function closeDialog() {
  dialog.value = false
}

function saveCost() {
  const { id, date, description, amount } = newEntry.value
  if (!date || !description || !amount) return
  const payload = { date, description, amount }
  if (id) {
    store.updateCost(id, payload)
  } else {
    store.addCost(payload)
  }
  closeDialog()
}

function edit(item) {
  newEntry.value = { ...item }
  dialog.value = true
}

function remove(id) {
  if (confirm('Na pewno usunąć ten koszt?')) {
    store.removeCost(id)
  }
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN', minimumFractionDigits: 2
  }).format(val)
}
</script>
