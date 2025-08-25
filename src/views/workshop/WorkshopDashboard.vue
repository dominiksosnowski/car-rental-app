<!-- src/views/workshop/WorkshopSummary.vue -->
<!-- src/views/workshop/WorkshopSummary.vue -->
<template>
  <v-container class="pa-6">
    <v-col cols="12" md="12">
  <v-card outlined>
    <v-card-title align="center">
      <strong>Bilans miesięczny</strong>
    </v-card-title>
    <!-- Tytuł z wyśrodkowanymi przyciskami -->
    <v-card-title class="d-flex align-center justify-center">
      <v-btn icon @click="prevMonth">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <span class="mx-2 font-weight-bold">
        {{ monthLabel }}
      </span>

      <v-btn icon @click="nextMonth">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- PRZYCHODY -->
      <div class="d-flex align-center mb-2 px-2 py-1 rounded"
           style="background-color: #e8f5e9; border: 1px solid #c8e6c9;">
        <v-icon color="green" class="me-2">mdi-cash</v-icon>
        Przychody:&nbsp;<span class="font-weight-bold">{{ formatCurrency(earnings) }}</span>
      </div>

      <!-- KOSZTY -->
      <div class="d-flex align-center mb-2 px-2 py-1 rounded"
           style="background-color: #ffebee; border: 1px solid #ffcdd2;">
        <v-icon color="red" class="me-2">mdi-file-document</v-icon>
        Koszty:&nbsp;<span class="font-weight-bold">{{ formatCurrency(costs) }}</span>
      </div>

      <v-divider class="my-3" />

      <!-- BILANS -->
      <div class="d-flex align-center px-2 py-1 rounded"
           style="background-color: #e3f2fd; border: 1px solid #bbdefb;">
        <v-icon color="blue" class="me-2">mdi-scale-balance</v-icon>
        Bilans:&nbsp;<span class="font-weight-bold">{{ formatCurrency(earnings - costs) }}</span>
      </div>
    </v-card-text>
  </v-card>
</v-col>
    <v-row dense>
      <!-- Pojazdy w trakcie naprawy -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="bg-grey-lighten-4">
            <v-icon left color="orange">mdi-wrench</v-icon>
            W trakcie naprawy: {{ inProgressVehicles.length }}
          </v-card-title>
          <v-card-text>
            <!-- Desktop -->
            <v-data-table
              v-if="!$vuetify.display.smAndDown"
              :headers="inProgressHeaders"
              :items="inProgressVehicles"
              dense
              hide-default-footer
              class="elevation-0"
            >
              <template #item.total="{ item }">
                {{ formatCurrency(item.total) }}
              </template>
            </v-data-table>

            <!-- Mobile -->
            <v-row v-else dense>
              <v-col v-for="v in inProgressVehicles" :key="v.id" cols="12">
                <v-card>
                  <v-card-title class="justify-space-between">
                    <v-icon color="blue">mdi-account</v-icon> <span>{{ v.client }}</span>
                    
                  </v-card-title>
                  <v-card-subtitle>
                    <v-icon color="green">mdi-cash</v-icon> 
                    Do zapłaty: <strong>{{ formatCurrency(v.total) }}</strong>
                  </v-card-subtitle>
                  <v-card-subtitle><v-icon color="orange">mdi-car</v-icon> {{ v.vehicle }}</v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Umówione wizyty w tygodniu -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="bg-grey-lighten-4">
            <v-icon left color="blue">mdi-calendar-clock</v-icon>
            Umówione w tygodniu: {{ upcomingThisWeek.length }}
          </v-card-title>
          <v-card-text>
            <!-- Desktop -->
            <v-data-table
              v-if="!$vuetify.display.smAndDown"
              :headers="upcomingHeaders"
              :items="upcomingThisWeek"
              dense
              hide-default-footer
              :loading="loadingScheduled"
            >
              <template #item.scheduled_at="{ item }">
                {{ formatDate(item.scheduled_at) }}
              </template>
              <template #item.client="{ item }">
                {{ item.customer_first }} {{ item.customer_last }}
              </template>
              <template #item.vehicle="{ item }">
                {{ item.vehicle_make }} {{ item.vehicle_model }}
              </template>
              <template #item.engine="{ item }">{{ item.engine }}</template>
              <template #item.notes="{ item }">{{ item.repair_description || 'Brak notatek' }}</template>
            </v-data-table>

            <!-- Mobile -->
            <v-row v-else dense>
              <v-col v-for="visit in upcomingThisWeek" :key="visit.id" cols="12">
                <v-card>
                  <v-card-title class="justify-space-between">
                    <span>{{ visit.customer_first }} {{ visit.customer_last }}</span>
                    <span>{{ formatDate(visit.scheduled_at) }}</span>
                  </v-card-title>
                  <v-card-subtitle>
                    {{ visit.vehicle_make }} {{ visit.vehicle_model }} – {{ visit.engine || '–' }}
                  </v-card-subtitle>
                  <v-card-text>
                    <em>{{ visit.repair_description || 'Brak opisu' }}</em>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <!-- Przychody -->


    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useActiveRepairsStore } from '@/stores/activeRepairsStore'
import { useScheduledRepairsStore } from '@/stores/scheduledRepairsStore'
import { supabase } from '@/lib/supabase'

// store
const store = useActiveRepairsStore()
const { workshop_active_repairs, loadingActive } = storeToRefs(store)
onMounted(() => store.fetchActiveRepairs())

const scheduledStore = useScheduledRepairsStore()
const { scheduledRepairs, loadingScheduled } = storeToRefs(scheduledStore)
onMounted(() => scheduledStore.fetchScheduledRepairs())


// wspólne helpery
function sumParts(r) {
  return (r.parts || []).reduce((acc, p) => acc + (p.cost || 0), 0)
}
function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(val || 0)
}
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return isNaN(d) ? '–' : d.toLocaleDateString('pl-PL')
}
function startOfWeek(d) {
  const day = d.getDay() || 7
  const m = new Date(d)
  m.setDate(d.getDate() - day + 1)
  m.setHours(0,0,0,0)
  return m
}

function endOfWeek(d) {
  const m = startOfWeek(d)
  m.setDate(m.getDate() + 6) // niedziela
  m.setHours(23, 59, 59, 999)
  return m
}

// zakresy dla przychodów
const customStart = ref(null)
const customEnd   = ref(null)
const menuStart   = ref(false)
const menuEnd     = ref(false)

// zakresy dla wykresu
const now = new Date()
now.setHours(0, 0, 0, 0) // początek dzisiejszego dnia
const weekEnd = endOfWeek(now)
const chartStart    = ref(startOfWeek(now).toISOString().substr(0,10))
const chartEnd      = ref(now.toISOString().substr(0,10))
const chartMenuStart= ref(false)
const chartMenuEnd  = ref(false)

// przychody tydzień/miesiąc/niestandard
const weekStart  = startOfWeek(now)
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)


// breakdown dla wykresu wg zakresu chartStart–chartEnd
const paymentBreakdownByChart = computed(() => {
  if (!chartStart.value || !chartEnd.value) {
    return { cash:0, card:0, transfer:0, other:0 }
  }
  const from = new Date(chartStart.value); from.setHours(0,0,0,0)
  const to   = new Date(chartEnd.value);   to.setHours(23,59,59,999)

  return workshop_active_repairs.value
    .filter(r => r.completed)
    .filter(r => {
      const d = new Date(r.completion_date)
      return d >= from && d <= to
    })
    .reduce((acc,r) => {
      let key = (r.payment_method||'').toLowerCase()
      if (key.includes('gotów'))    key = 'cash'
      else if (key.includes('kart')) key = 'card'
      else if (key.includes('przele')) key = 'transfer'
      else key = 'other'
      acc[key] = (acc[key]||0) + sumParts(r)
      return acc
    }, { cash:0, card:0, transfer:0, other:0 })
})

// tabele
const inProgressHeaders = [
  { title: 'Imie i nazwisko', key:'client' },
  { title: 'Pojazd', key:'vehicle' },
  { title: 'Kwota do zapłaty', key:'total', sortable:false }
]
const upcomingHeaders = [
  { title:'Data', key:'scheduled_at' },
  { title:'Klient', key:'client' },
  { title:'Pojazd', key:'vehicle' },
  { title:'Silnik', key:'engine' },
  { title:'Opis', key:'notes' }
]

const inProgressVehicles = computed(() =>
  workshop_active_repairs.value
    .filter(r => !r.completed)
    .map(r => ({
      id: r.id,
      client: r.first_name + ' ' + r.last_name,
      vehicle: r.vehicle_make + ' ' + r.vehicle_model,
      total: sumParts(r)
    }))
)

const in7 = new Date(now); in7.setDate(now.getDate()+7)
const upcomingThisWeek = computed(() =>
  scheduledRepairs.value
    .filter(r => {
      const d = new Date(r.arrival_date)
      return d >= now && d <= weekEnd
    })
    .map(r => ({
      id: r.id,
      scheduled_at: r.arrival_date,
      customer_first: r.first_name,
      customer_last: r.last_name,
      vehicle_make: r.vehicle_make,
      vehicle_model: r.vehicle_model,
      engine: r.engine,
      repair_description: r.repair_description
    }))
)

const month = ref(new Date().toISOString().slice(0, 7))
const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})

const earnings = ref(0)
const costs = ref(0)
const loading = ref(false)

// 🔄 Przesuwanie miesiąca
function shiftMonth(delta) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, (m - 1) + delta, 1)
  const y2 = d.getFullYear()
  const m2 = String(d.getMonth() + 1).padStart(2, '0')
  month.value = `${y2}-${m2}`
  fetchMonthData()
}

function prevMonth() { shiftMonth(-1) }
function nextMonth() { shiftMonth(1) }

// 📥 Pobieranie PRZYCHODÓW z Supabase
async function fetchEarnings(year, m) {
  const monthStr = String(m).padStart(2, '0')

  const { data, error } = await supabase
    .from('workshop_active_repairs')
    .select('due_amount, completed, completion_date')
    .eq('completed', true)
    .gte('completion_date', `${year}-${monthStr}-01`)
    .lte('completion_date', `${year}-${monthStr}-31`)

  if (error) {
    console.error('Błąd pobierania przychodów:', error)
    return 0
  }

  return data.reduce((sum, row) => sum + Number(row.due_amount || 0), 0)
}



// 📥 Pobieranie KOSZTÓW (faktury) z Supabase
async function fetchCosts(year, m) {
  const { data, error } = await supabase
    .from('workshop_invoices')     // ← ta tabela już u Ciebie działa
    .select('amount, invoice_date')
    .gte('invoice_date', `${year}-${String(m).padStart(2, '0')}-01`)
    .lte('invoice_date', `${year}-${String(m).padStart(2, '0')}-31`)

  if (error) {
    console.error(error)
    return 0
  }
  return data.reduce((sum, row) => sum + Number(row.amount || 0), 0)
}

// 🔄 Łączne pobranie danych miesiąca
async function fetchMonthData() {
  loading.value = true
  const [y, m] = month.value.split('-').map(Number)

  const [earningsTotal, costsTotal] = await Promise.all([
    fetchEarnings(y, m),
    fetchCosts(y, m)
  ])

  earnings.value = earningsTotal
  costs.value = costsTotal
  loading.value = false
}

// 🚀 Start
onMounted(() => {
  fetchMonthData()
})
</script>

<style scoped>
.pa-6 { padding: 24px; }
.mb-4 { margin-bottom: 1rem; }
</style>
