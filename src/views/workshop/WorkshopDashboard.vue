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
  <v-sheet color="grey-lighten-4" rounded class="pa-4">
    <!-- Przychody -->
    <div class="payment-row green-row mb-3">
      <v-icon color="green" class="me-2">mdi-cash</v-icon>
      <strong class="label">Przychody:</strong>&nbsp;
      <span class="value">{{ formatCurrency(earnings) }}</span>
    </div>

    <!-- Metody płatności (jeden kontener) -->
    <div class="payment-group mb-3">
      <div class="payment-item" style="--bar-color: #ef6c00;">
        <v-icon size="18" color="deep-orange" class="me-2">mdi-cash</v-icon>
        <strong class="label">Gotówka:</strong>&nbsp;
        <span class="value">{{ formatCurrency(paymentBreakdown.cash) }}</span>
      </div>
      <div class="payment-item" style="--bar-color: #3f51b5;">
        <v-icon size="18" color="indigo" class="me-2">mdi-credit-card-outline</v-icon>
        <strong class="label">Karta:</strong>&nbsp;
        <span class="value">{{ formatCurrency(paymentBreakdown.card) }}</span>
      </div>
      <div class="payment-item" style="--bar-color: #00897b;">
        <v-icon size="18" color="teal" class="me-2">mdi-bank-transfer</v-icon>
        <strong class="label">Przelew:</strong>&nbsp;
        <span class="value">{{ formatCurrency(paymentBreakdown.transfer) }}</span>
      </div>
      <div class="payment-item" style="--bar-color: #757575;">
        <v-icon size="18" color="grey" class="me-2">mdi-dots-horizontal</v-icon>
        <strong class="label">Inne:</strong>&nbsp;
        <span class="value">{{ formatCurrency(paymentBreakdown.other) }}</span>
      </div>
    </div>

    <!-- Koszty -->
    <div class="payment-row red-row mb-3">
      <v-icon color="red" class="me-2">mdi-file-document</v-icon>
      <strong class="label">Koszty:</strong>&nbsp;
      <span class="value">{{ formatCurrency(costs) }}</span>
    </div>

    <!-- Bilans -->
    <div class="payment-row lightblue-row">
      <v-icon color="blue" class="me-2">mdi-scale-balance</v-icon>
      <strong class="label">Bilans:</strong>&nbsp;
      <span class="value">{{ formatCurrency(earnings - costs) }}</span>
    </div>
  </v-sheet>
</v-card-text>


  </v-card>
</v-col>
<v-row dense class="d-flex align-center justify-center">
      <v-card-title class="d-flex align-center justify-center">
      <v-btn icon @click="prevDay">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <span class="mx-2 font-weight-bold">
        {{ formatDate(day) }}
      </span>

      <v-btn icon @click="nextDay">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-title>
</v-row>
<v-row class="mb-6" dense>
  <!-- Przyjęte naprawy -->
  
  <v-col cols="12" md="6">
    <v-card outlined>
      <v-card-title class="bg-blue-lighten-5">
        <v-icon color="blue" class="mr-2">mdi-car-arrow-right</v-icon>
        Przyjęte naprawy
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item
            v-for="(r, index) in acceptedToday"
            :key="r.id"
          >
            <v-list-item-content>
              <div class="d-flex align-center mb-1">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                <strong>{{ r.first_name }} {{ r.last_name }}</strong>
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="teal" class="mr-2">mdi-car</v-icon>
                {{ r.vehicle_make }} {{ r.vehicle_model }} 
              </div>
              <div class="d-flex align-center">
                <v-icon color="orange" class="mr-2">mdi-clipboard-text</v-icon>
                Zlecenie: {{ r.customer_order }}
              </div>
            </v-list-item-content>
            <v-divider
              v-if="index !== acceptedToday.length - 1"
              class="my-3"
            />
          </v-list-item>
          <v-list-item v-if="!acceptedToday.length" title="Brak" />
        </v-list>
      </v-card-text>
    </v-card>
  </v-col>

  <!-- Zakończone naprawy -->
  <v-col cols="12" md="6">
    <v-card outlined>
      <v-card-title class="bg-green-lighten-5">
        <v-icon color="green" class="mr-2">mdi-wrench-check</v-icon>
        Zakończone naprawy
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item
            v-for="(r, index) in completedToday"
            :key="r.id"
          >
            <v-list-item-content>
              <div class="d-flex align-center mb-1">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                <strong>{{ r.first_name }} {{ r.last_name }}</strong>
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="teal" class="mr-2">mdi-car</v-icon>
                {{ r.vehicle_make }} {{ r.vehicle_model }} 
              </div>
              <div class="d-flex align-center">
                <v-icon color="green" class="mr-2">mdi-cash-multiple</v-icon>
                Zapłacono: <strong class="ml-1">{{ formatCurrency(r.due_amount) }}</strong>
              </div>
              <div class="d-flex align-center">
                <v-icon color="purple" class="mr-2">mdi-credit-card-outline</v-icon>
                Forma płatności: <strong class="ml-1">{{ r.payment_method }}</strong>
              </div>
            </v-list-item-content>
            <v-divider
              v-if="index !== completedToday.length - 1"
              class="my-3"
            />
          </v-list-item>
          <v-list-item v-if="!completedToday.length" title="Brak" />
        </v-list>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>



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


function normalizePaymentMethod(pm) {
  const k = (pm || '').toString().toLowerCase()
  if (k.includes('gotów') || k.includes('gotow') || k === 'cash') return 'cash'
  if (k.includes('kart') || k === 'card') return 'card'
  if (k.includes('przele') || k === 'transfer') return 'transfer'
  return 'other'
}

const paymentBreakdown = ref({ cash: 0, card: 0, transfer: 0, other: 0 })

async function fetchPaymentBreakdown(year, m) {
  const monthStr = String(m).padStart(2, '0')
  const lastDay = getLastDayOfMonth(year, m)

  const { data, error } = await supabase
    .from('workshop_active_repairs')
    .select('due_amount, completed, completion_date, payment_method')
    .eq('completed', true)
    .gte('completion_date', `${year}-${monthStr}-01`)
    .lte('completion_date', `${year}-${monthStr}-${lastDay}`)

  if (error) {
    console.error('Błąd pobierania podziału płatności:', error)
    paymentBreakdown.value = { cash: 0, card: 0, transfer: 0, other: 0 }
    return
  }

  const acc = { cash: 0, card: 0, transfer: 0, other: 0 }
  for (const row of data || []) {
    const key = normalizePaymentMethod(row.payment_method)
    acc[key] += Number(row.due_amount || 0)
  }
  paymentBreakdown.value = acc
}


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
  const lastDay = getLastDayOfMonth(year, m)

  const { data, error } = await supabase
    .from('workshop_active_repairs')
    .select('due_amount, completed, completion_date')
    .eq('completed', true)
    .gte('completion_date', `${year}-${monthStr}-01`)
    .lte('completion_date', `${year}-${monthStr}-${lastDay}`)

  if (error) {
    console.error('Błąd pobierania przychodów:', error)
    return 0
  }

  return data.reduce((sum, row) => sum + Number(row.due_amount || 0), 0)
}

async function fetchCosts(year, m) {
  const monthStr = String(m).padStart(2, '0')
  const lastDay = getLastDayOfMonth(year, m)

  const { data, error } = await supabase
    .from('workshop_invoices')
    .select('amount, invoice_date')
    .gte('invoice_date', `${year}-${monthStr}-01`)
    .lte('invoice_date', `${year}-${monthStr}-${lastDay}`)

  if (error) {
    console.error(error)
    return 0
  }

  return data.reduce((sum, row) => sum + Number(row.amount || 0), 0)
}


function getLastDayOfMonth(year, month) {
  // month: 1–12
  return new Date(year, month, 0).getDate() // 0 = ostatni dzień poprzedniego miesiąca
}


async function fetchMonthData() {
  loading.value = true
  const [y, m] = month.value.split('-').map(Number)

  const [earningsTotal, costsTotal] = await Promise.all([
    fetchEarnings(y, m),
    fetchCosts(y, m),
    fetchPaymentBreakdown(y, m) // uzupełni paymentBreakdown.value
  ])

  earnings.value = earningsTotal
  costs.value = costsTotal
  loading.value = false
}


// 🚀 Start
onMounted(() => {
  fetchMonthData()
})

const day = ref(new Date().toISOString().slice(0, 10)) // YYYY-MM-DD

// Formatowanie daty do wyświetlenia
const dayLabel = computed(() => {
  const [y, m, d] = day.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, d))
})

// Zmiana dnia
function shiftDay(delta) {
  const d = new Date(day.value)
  d.setDate(d.getDate() + delta)
  day.value = d.toISOString().slice(0, 10)
}
function prevDay() { shiftDay(-1) }
function nextDay() { shiftDay(1) }

// Zakładam, że masz reactive array z danymi z Supabase
// np. repairs = ref([]) wypełniane w onMounted()

const acceptedToday = computed(() => {
  return workshop_active_repairs.value.filter(r => {
    if (!r.arrival_date) return false
    return new Date(r.arrival_date).toISOString().slice(0, 10) === day.value
  })
})



const completedToday = computed(() => {
  return workshop_active_repairs.value.filter(r => {
    if (!r.completion_date || !r.completed) return false
    return new Date(r.completion_date).toISOString().slice(0, 10) === day.value
  })
})






</script>

<style scoped>
.pa-6 { padding: 24px; }
.mb-4 { margin-bottom: 1rem; }
.payment-row {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 1.1rem;
}
.payment-row .label { font-weight: bold; }
.payment-row .value { font-weight: normal; }

/* Grupa metod płatności: jedno obramowanie dla całego kontenera */
.payment-group {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  padding: 0.4rem;
  display: grid;
  gap: 0.35rem;
}

/* Pojedyncza metoda: mniejsza czcionka, pasek po lewej i subtelne tło w kolorze paska */
.payment-item {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-left: 6px solid var(--bar-color, #ccc);
  border-radius: 4px;
  font-size: 0.95rem;
  background-color: color-mix(in srgb, var(--bar-color) 10%, transparent);
}

.payment-item .label { font-weight: bold; }
.payment-item .value { font-weight: normal; }

/* Kolory głównych wierszy */
.green-row     { background-color: rgba(76,175,80,0.12);   border: 1px solid rgba(56,142,60,0.4); }
.red-row       { background-color: rgba(244,67,54,0.12);   border: 1px solid rgba(211,47,47,0.4); }
.lightblue-row { background-color: rgba(33,150,243,0.12);  border: 1px solid rgba(25,118,210,0.4); }

</style>
