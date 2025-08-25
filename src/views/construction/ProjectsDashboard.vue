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
