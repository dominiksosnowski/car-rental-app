<!-- src/views/workshop/WorkshopSummary.vue -->
<template>
  <v-container class="pa-6">
    <v-row dense>

      <!-- Rząd 1: Przychody (50%) -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="green">mdi-cash</v-icon>
            Przychody
          </v-card-title>
          <v-card-text>
            <div>Tydzień: <strong>{{ formatCurrency(earningsWeek) }}</strong></div>
            <div>Miesiąc: <strong>{{ formatCurrency(earningsMonth) }}</strong></div>

            <!-- custom range dla przychodów -->
            <v-row class="mt-4" dense>
              <v-col cols="12">
                <strong>Okres niestandardowy</strong>
              </v-col>
              <v-col cols="12" md="6">
                <v-menu
                  v-model="menuStart"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      v-model="customStart"
                      label="Od"
                      readonly
                      prepend-inner-icon="mdi-calendar"
                    />
                  </template>
                  <v-date-picker
                    v-model="customStart"
                    locale="pl"
                    @update:model-value="menuStart = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="12" md="6">
                <v-menu
                  v-model="menuEnd"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      v-model="customEnd"
                      label="Do"
                      readonly
                      prepend-inner-icon="mdi-calendar"
                    />
                  </template>
                  <v-date-picker
                    v-model="customEnd"
                    locale="pl"
                    @update:model-value="menuEnd = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="12">
                <div>
                  Przychody w wybranym okresie:
                  <strong>{{ formatCurrency(earningsCustom) }}</strong>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Rząd 1: Wykres (50%) -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="purple">mdi-chart-pie</v-icon>
            Rozkład wg metody płatności
          </v-card-title>
          <v-card-text>
            <!-- wybór zakresu dla wykresu -->
                        <!-- własciwy wykres -->
            <div class="d-flex justify-center">
              <PaymentMethodPieChart :breakdown="paymentBreakdownByChart" />
            </div>
            <v-row class="mb-4" dense>
              <v-col cols="6" md="6">
                <v-menu
                  v-model="chartMenuStart"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      v-model="chartStart"
                      label="Od"
                      readonly
                      prepend-inner-icon="mdi-calendar"
                    />
                  </template>
                  <v-date-picker
                    v-model="chartStart"
                    locale="pl"
                    @update:model-value="chartMenuStart = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6" md="6">
                <v-menu
                  v-model="chartMenuEnd"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      v-model="chartEnd"
                      label="Do"
                      readonly
                      prepend-inner-icon="mdi-calendar"
                    />
                  </template>
                  <v-date-picker
                    v-model="chartEnd"
                    locale="pl"
                    @update:model-value="chartMenuEnd = false"
                  />
                </v-menu>
              </v-col>
            </v-row>

 
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Rząd 2: Pojazdy w trakcie naprawy (50%) -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="orange">mdi-wrench</v-icon>
            W trakcie naprawy: {{ inProgressVehicles.length }}
          </v-card-title>
          <v-card-text>
            <v-data-table
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
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Rząd 2: Umówione wizyty w tygodniu (50%) -->
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="blue">mdi-calendar-clock</v-icon>
            Umówione w tygodniu: {{ upcomingThisWeek.length }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="upcomingHeaders"
              :items="upcomingThisWeek"
              dense
              hide-default-footer
              :loading="loadingActive"
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
              <template #item.engine="{ item }">
                {{ item.engine }}
              </template>
              <template #item.notes="{ item }">
                {{ item.notes || '–' }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useActiveRepairsStore } from '@/stores/activeRepairsStore'
import PaymentMethodPieChart from '@/components/workshop/PaymentMethodPieChart.vue'

// store
const store = useActiveRepairsStore()
const { workshop_active_repairs, loadingActive } = storeToRefs(store)
onMounted(() => store.fetchActiveRepairs())

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

// zakresy dla przychodów
const customStart = ref(null)
const customEnd   = ref(null)
const menuStart   = ref(false)
const menuEnd     = ref(false)

// zakresy dla wykresu
const now           = new Date()
const chartStart    = ref(startOfWeek(now).toISOString().substr(0,10))
const chartEnd      = ref(now.toISOString().substr(0,10))
const chartMenuStart= ref(false)
const chartMenuEnd  = ref(false)

// przychody tydzień/miesiąc/niestandard
const weekStart  = startOfWeek(now)
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

const earningsWeek = computed(() =>
  workshop_active_repairs.value
    .filter(r => r.completed)
    .filter(r => {
      const d = new Date(r.completion_date)
      return d >= weekStart && d <= now
    })
    .reduce((s,r) => s + sumParts(r), 0)
)
const earningsMonth = computed(() =>
  workshop_active_repairs.value
    .filter(r => r.completed)
    .filter(r => {
      const d = new Date(r.completion_date)
      return d >= monthStart && d <= now
    })
    .reduce((s,r) => s + sumParts(r), 0)
)
const earningsCustom = computed(() => {
  if (!customStart.value || !customEnd.value) return 0
  const from = new Date(customStart.value); from.setHours(0,0,0,0)
  const to   = new Date(customEnd.value);   to.setHours(23,59,59,999)
  return workshop_active_repairs.value
    .filter(r => r.completed)
    .filter(r => {
      const d = new Date(r.completion_date)
      return d >= from && d <= to
    })
    .reduce((s,r) => s + sumParts(r), 0)
})

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
  workshop_active_repairs.value
    .filter(r => !r.completed && r.scheduled_at)
    .filter(r => {
      const d = new Date(r.scheduled_at)
      return d >= now && d <= in7
    })
    .map(r => ({
      id: r.id,
      scheduled_at: r.scheduled_at,
      customer_first: r.first_name,
      customer_last: r.last_name,
      vehicle_make: r.vehicle_make,
      vehicle_model: r.vehicle_model,
      engine: r.engine,
      notes: r.notes
    }))
)
</script>

<style scoped>
.pa-6 { padding: 24px; }
.mb-4 { margin-bottom: 1rem; }
</style>
