<template>
  <v-container>
    <h1 class="text-h5 mb-4">Podsumowanie projektów</h1>

    <!-- Wykres -->
    <v-card class="mb-6">
      <v-card-title class="flex-column align-center justify-center">
        <!-- Pasek miesięcy -->
        <div class="d-flex align-center justify-center mb-3">
          <v-btn icon @click="prevMonth" :disabled="loading">
            <v-icon size="32">mdi-chevron-left</v-icon>
          </v-btn>

          <span class="month-display mx-4">
            {{ monthLabel }}
          </span>

          <v-btn icon @click="nextMonth" :disabled="loading">
            <v-icon size="32">mdi-chevron-right</v-icon>
          </v-btn>
        </div>

        <!-- Przełącznik trybu -->
        <v-btn-toggle v-model="chartSource" mandatory class="justify-center">
          <v-btn
            variant="outlined"
            size="large"
            color="primary"
            value="month"
            prepend-icon="mdi-calendar-month"
          >
            Miesięczny
          </v-btn>

          <v-btn
            variant="outlined"
            size="large"
            color="primary"
            value="all"
            prepend-icon="mdi-finance"
          >
            Łącznie
          </v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-card-text class="chart-wrapper">
        <BarChart
          v-if="chartReady"
          :chart-data="chartData"
          :chart-options="chartOptions"
        />
      </v-card-text>
    </v-card>

    <!-- Jedna tabela, dane wg wyboru -->
    <v-card>
      <v-card-title>
        {{ chartSource === 'all'
          ? 'Łącznie (wszystkie wpisy)'
          : `Dane – ${monthLabel}` }}
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="sourceRows"
        :loading="loading"
        density="compact"
      >
        <template #item.earned="{ item }">
          {{ formatCurrency(item.earned, item.currency) }}
        </template>
      </v-data-table>
    </v-card>
    <v-card class="mt-6">
  <v-card-title>
    Godziny danego dnia –
    {{ day ? new Intl.DateTimeFormat('pl-PL').format(new Date(day)) : 'wybierz datę' }}
  </v-card-title>


  <!-- Wybór dnia -->
  <v-date-picker
    v-model="day"
    :max="new Date().toISOString().slice(0,10)"
    color="primary"
    class="ma-4"
  />

  <!-- Tabela -->
<v-data-table
  :headers="headersDay"
  :items="rowsDayExpanded"
  :loading="loading"
   :items-per-page="50"
  density="compact"
>
 <template #item="{ item, columns }">
    <tr :class="{ 'bg-blue-darken-3 text-white': item.isTotal }">
      <td v-for="col in columns" :key="col.key">
        <span :class="{ 'font-weight-bold': item.isTotal }">
          {{ item[col.key] }} <span v-if="col.key === 'hours'">h</span>
        </span>
      </td>
    </tr>
  </template>
  <template #item.employee="{ item }">
    <span :class="{ 'font-weight-bold': item.isTotal }">
      {{ item.employee }}
    </span>
  </template>

  <template #item.project="{ item }">
    <span :class="{ 'font-weight-bold': item.isTotal }">
      {{ item.project }}
    </span>
  </template>

  <template #item.hours="{ item }">
    <span :class="{ 'font-weight-bold': item.isTotal }">
      {{ item.hours }} h
    </span>
  </template>
</v-data-table>

</v-card>

  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProjectsDashboardStore } from '@/stores/projectsDashboardStore'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar as BarChart } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useProjectsDashboardStore()

// Miesiąc i przełącznik
const month = ref(new Date().toISOString().slice(0, 7))
const chartSource = ref('month')
const loading = computed(() => store.loading)

const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(d)
})

function shiftMonth(delta) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, (m - 1) + delta, 1)
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function prevMonth() { shiftMonth(-1) }
function nextMonth() { shiftMonth(1) }

// Dane z store
const rowsAllTime = computed(() => Array.isArray(store.rowsAllTime) ? store.rowsAllTime : [])
const rowsMonth = computed(() => Array.isArray(store.rowsMonth) ? store.rowsMonth : [])

// Wspólne źródło danych do wykresu i tabeli
const sourceRows = computed(() =>
  chartSource.value === 'all' ? rowsAllTime.value : rowsMonth.value
)

// Wykres
const chartData = ref({
  labels: [],
  datasets: [{ label: 'Zarobione', data: [], backgroundColor: '#1976d2' }]
})
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: { display: true, text: 'Zarobki według projektu' }
  },
  scales: {
    x: { title: { display: true, text: 'Projekty' } },
    y: { title: { display: true, text: 'Zarobki' } }
  }
}
watch(sourceRows, (list) => {
  chartData.value = {
    labels: list.map(r => r.name),
    datasets: [
      {
        label: chartSource.value === 'all'
          ? 'Zarobione – Łącznie'
          : `Zarobione – ${monthLabel.value}`,
        data: list.map(r => Number(r.earned || 0)),
        backgroundColor: '#1976d2'
      }
    ]
  }
}, { immediate: true })

const chartReady = computed(() =>
  chartData.value.labels.length > 0 && chartData.value.datasets.length > 0
)

// Pobieranie danych
function localISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
async function reload() {
  const [y, m] = month.value.split('-').map(Number)
  const start = localISO(new Date(y, m - 1, 1))
  const end = localISO(new Date(y, m, 0))
  await store.fetchDashboard(start, end)
}
watch(month, () => { reload() }, { immediate: true })

// Nagłówki
const headers = [
  { title: 'Projekt', key: 'name' },
  { title: 'Godziny', key: 'hours', align: 'end' },
  { title: 'Zarobione', key: 'earned', align: 'end' }
]

function formatCurrency(v, currency = 'PLN') {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(Number(v || 0))
}

const day = ref(null)

// Dane z backendu (np. store.rowsDay)
const rowsDay = computed(() =>
  Array.isArray(store.rowsDay) ? store.rowsDay : []
)

// Rozszerzone dane z sumą godzin w miejscu pracy
const rowsDayExpanded = computed(() => {
  const grouped = {}

  // grupowanie po projekcie
  rowsDay.value.forEach(r => {
    if (!grouped[r.project]) grouped[r.project] = []
    grouped[r.project].push(r)
  })

  const result = []
  for (const [project, entries] of Object.entries(grouped)) {
    let total = 0
    // dodajemy wpisy pracowników
    entries.forEach(e => {
      result.push({
        employee: e.employee,
        project: project,
        hours: e.hours,
        isTotal: false
      })
      total += e.hours
    })
    // dodajemy sumę dla projektu
    result.push({
      employee: 'Łącznie',
      project: project,
      hours: total,
      isTotal: true
    })
  }
  return result
})


const headersDay = [
  { title: 'Pracownik', key: 'employee' },
  { title: 'Projekt', key: 'project' },
  { title: 'Godziny', key: 'hours', align: 'end' }
]

watch(day, async (d) => {
  if (d) {
    // jeśli v-date-picker zwraca obiekt Date
    const iso = typeof d === 'string'
      ? d
      : new Date(d).toISOString().slice(0, 10)

    await store.fetchDayHours(iso)
  }
})


</script>

<style scoped>
@media (min-width: 1024px) {
  .chart-wrapper {
    margin: 0 auto;
    width: 50%;
  }
}
.month-display {
  font-size: 1.4rem;
  font-weight: 600;
  text-transform: capitalize;
  min-width: 180px;
  text-align: center;
}
</style>
