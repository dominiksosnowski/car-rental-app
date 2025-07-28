<template>
  <v-container fluid class="pa-4">

    <!-- A. Status pojazdów & B. Przychody obok siebie -->
    <v-row dense class="mb-6">
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="primary">mdi-car-multiple</v-icon>
            Status pojazdów
          </v-card-title>
          <v-card-text>
            <VehicleStatusChart :counts="vehicleStatusCounts" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="green">mdi-cash</v-icon>
            Przychody
          </v-card-title>
          <v-card-text>
            <div>Tydzień: <strong>{{ earningsWeek.toFixed(2) }} zł</strong></div>
            <div>Miesiąc: <strong>{{ earningsMonth.toFixed(2) }} zł</strong></div>

            <!-- custom range -->
            <v-row class="mt-4" dense>
              <v-col cols="12" md="12">
                <strong>Okres niestandardowy</strong>
              </v-col>
              <v-col cols="12" md="3">
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
                      class="ma-0 pa-0"
                    />
                  </template>
                  <v-date-picker
                    v-model="customStart"
                    locale="pl"
                    @update:model-value="menuStart = false"
                  />
                </v-menu>
              </v-col>

              <v-col cols="12" md="3">
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
                      class="ma-0 pa-0"
                    />
                  </template>
                  <v-date-picker
                    v-model="customEnd"
                    locale="pl"
                    @update:model-value="menuEnd = false"
                  />
                </v-menu>
              </v-col>

              <v-col cols="12" md="12" class="d-flex align-center">
                <div class="subtitle-2">
                  Przychody w wybranym okresie:
                  <strong>{{ formatCurrency(earningsCustom) }} zł</strong>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- C. Wypożyczenia kończące się lub zakończone -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="orange">mdi-timer-sand</v-icon>
            Wypożyczenia zakończone lub za ≤7 dni:
            {{ rentalsCloseOrEnded.length }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="rentHeaders"
              :items="rentalsCloseOrEnded"
              item-key="id"
              :items-per-page="5"
              class="elevation-1"
            >
              <template #item.vehicle="{ item }">
                {{ item.vehicle.brand }} {{ item.vehicle.model }}
                ({{ item.vehicle.reg_number }})
              </template>
              <template #item.client="{ item }">
                {{ item.client_first }} {{ item.client_last }}
              </template>
              <template #item.end_date="{ item }">
                <span :class="{ 'red--text': isExpired(item.end_date) }">
                  {{ formatDate(item.end_date) }}
                </span>
              </template>
              <template #item.paid="{ item }">
                {{ formatCurrency(item.paid) }}
              </template>
              <template #item.toPay="{ item }">
                <span :class="{ 'yellow--text': item.toPay > item.paid }">
                  {{ formatCurrency(item.toPay) }}
                </span>
              </template>
              <template #item.due="{ item }">
                <span :class="dueClass(item.due)">
                  {{ formatCurrency(item.due) }}
                </span>
              </template>
              <template #item.deposit="{ item }">
                {{ item.deposit ? 'tak' : 'nie' }}
              </template>
              <template #no-data>
                <v-alert type="info" variant="outlined">
                  — brak —
                </v-alert>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- D. Nadchodzące rezerwacje -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="blue">mdi-calendar-clock</v-icon>
            Rezerwacje za ≤7 dni oraz dzisiaj:
            {{ upcomingRes.length }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="resHeaders"
              :items="upcomingRes"
              item-key="id"
              :items-per-page="5"
              class="elevation-1"
            >
              <template #item.client="{ item }">
                {{ item.first_name }} {{ item.last_name }}
              </template>
              <template #item.start_date="{ item }">
                {{ formatDate(item.start_date) }}
              </template>
              <template #item.vehicle="{ item }">
                {{ item.vehicle.brand }} {{ item.vehicle.model }}
                ({{ item.vehicle.reg_number }})
              </template>
              <template #no-data>
                <v-alert type="info" variant="outlined">
                  — brak —
                </v-alert>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- E. Przeglądy (wygasłe lub za ≤7 dni) -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="purple">mdi-tools</v-icon>
            Przeglądy (wygasłe lub za ≤7 dni):
            {{ expiringInspections.length }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="expiringInspections"
              item-key="id"
              :items-per-page="10"
              class="elevation-1"
            >
              <template #item.inspection_date="{ item }">
                <span :class="dateClass(item.inspection_date)">
                  {{ formatDate(item.inspection_date) }}
                </span>
              </template>
              <template #no-data>
                <v-alert type="info" variant="outlined">
                  — brak wygaśnięć —
                </v-alert>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- F. Pojazdy dostępne i niedostępne obok siebie -->
    <v-row dense class="mb-6">
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="green">mdi-car</v-icon>
            Pojazdy dostępne: {{ availableVehicles.length }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="vehicleHeaders"
              :items="availableVehicles"
              item-key="id"
              :items-per-page="10"
              class="elevation-1"
            >
              <template #no-data>
                <v-alert type="info" variant="outlined">
                  — brak dostępnych pojazdów —
                </v-alert>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="red">mdi-car-off</v-icon>
            Pojazdy niedostępne: {{ unavailable.length }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="vehicleHeaders"
              :items="unavailable"
              item-key="id"
              :items-per-page="10"
              class="elevation-1"
            >
              <template #no-data>
                <v-alert type="info" variant="outlined">
                  — brak —
                </v-alert>
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
import { storeToRefs }         from 'pinia'
import { useVehicleStore }     from '@/stores/vehicleStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useRentalStore }      from '@/stores/rentalStore'
import { usePaymentStore }     from '@/stores/paymentStore'

import VehicleStatusChart      from '@/components/rental/VehicleStatusChart.vue'

// stores
const vehicleStore     = useVehicleStore()
const reservationStore = useReservationStore()
const rentalStore      = useRentalStore()
const paymentStore     = usePaymentStore()

const { list: vehicles }     = storeToRefs(vehicleStore)
const { list: reservations}  = storeToRefs(reservationStore)
const { list: rentals }      = storeToRefs(rentalStore)
const { list: payments }     = storeToRefs(paymentStore)

onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchActive(),
    reservationStore.fetchAll(),
    rentalStore.fetchAll(),
    paymentStore.fetchAll()
  ])

})

// helpery czasowe
const now = new Date()
const in7 = new Date(now)
in7.setDate(now.getDate() + 7)



function formatDate(d) {
  if (!d) return '–'
  return new Intl.DateTimeFormat('pl-PL', {
    day:   'numeric',   // „7”
    month: 'long',      // „maja”
    year:  'numeric'    // „2026”
  }).format(new Date(d))
}
function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN'
  }).format(val || 0)
}
function isExpiringSoon(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d >= now && d <= in7
}
function isExpired(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < now
}
function dateClass(dateStr) {
  if (isExpired(dateStr)) return 'bg-red darken-1 white--text pa-1 rounded'
  if (isExpiringSoon(dateStr)) return 'bg-yellow lighten-4 pa-1 rounded'
  return ''
}

// ------------ 1. pola dla custom range ------------
const customStart = ref(null)
const customEnd   = ref(null)
const menuStart   = ref(false)
const menuEnd     = ref(false)

// ------------ 2. computed liczące custom revenue ----------
const earningsCustom = computed(() => {
  if (!customStart.value || !customEnd.value) return 0

  // ustawiamy czas na początek i koniec dnia
  const from = new Date(customStart.value)
  from.setHours(0,0,0,0)
  const to = new Date(customEnd.value)
  to.setHours(23,59,59,999)

  return payments.value
    .filter(p => {
      const d = new Date(p.created_at || p.date)
      return d >= from && d <= to
    })
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

// 1) Przeglądy / ubezpieczenia
const expiringInspections  = computed(() =>
  vehicles.value.filter(v => {
    const insp = v.inspection_date && new Date(v.inspection_date)
    return (
      (insp && (insp < now || insp <= in7)) 
    )
  })
)

// 2) Niedostępne
const unavailable = computed(() =>
  vehicles.value.filter(v => v.status === 'unavailable')
)

// 3) Rezerwacje
const today = new Date(); today.setHours(0,0,0,0)
const upcomingRes = computed(() =>
  reservations.value
    .filter(r => {
      const sd = new Date(r.start_date)
      return sd >= today && sd <= in7
    })
    .map(r => ({
      ...r,
      vehicle: vehicles.value.find(v => v.id === r.vehicle_id) || {}
    }))
)

// 4) Wypożyczenia zakończone / za ≤7 dni
// pomocnik: dni w miesiącu + kalkulacja kosztu
function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()
}
function calcCost(r) {
  const s = new Date(r.start_date)
  const e = new Date(r.end_date)
  const msInDay = 1000*60*60*24
  const totalDays = Math.ceil((e - s)/msInDay)

  // monthly_rate ma pierwszeństwo
  if (r.monthly_rate > 0 && (!r.daily_rate || r.daily_rate === 0)) {
    const dim        = daysInMonth(s)
    const fullMonths = Math.floor(totalDays/dim)
    const remDays    = totalDays - fullMonths*dim
    return fullMonths*r.monthly_rate
         + remDays*(r.monthly_rate/dim)
  }
  // w innym wypadku daily_rate
  return totalDays * (r.daily_rate || 0)
}

 const rentalsCloseOrEnded = computed(() =>
   rentals.value
     // tylko te z wypełnioną end_date i zakończone lub kończące się ≤7 dni
     .filter(r => 
       r.end_date &&
       (() => {
         const ed = new Date(r.end_date)
         return ed < now || (ed >= now && ed <= in7)
       })()
     )
     .map(r => {
       const vehicle = vehicles.value.find(v => v.id === r.vehicle_id) || {}
       const paid = payments.value
         .filter(p => p.rental_id === r.id)
         .reduce((sum, p) => sum + Number(p.amount), 0)
       const toPay = calcCost(r)
       const due   = toPay - paid

       return {
         ...r,
         vehicle,
         paid,
         toPay,
         due,
         deposit: r.deposit
       }
     })
 )

// 5) Przychody
function startOfWeek(d) {
  const tmp = new Date(d)
  // getDay(): 0 (niedziela) do 6 (sobota); zamieniamy 0 na 7
  const day = tmp.getDay() || 7
  // ustawiamy poniedziałek
  tmp.setDate(tmp.getDate() - day + 1)
  // wyrównujemy czas do północy
  tmp.setHours(0, 0, 0, 0)
  return tmp
}

// a w setup:
const weekStart  = startOfWeek(now)

// monthStart już jest ok, bo new Date(YYYY, M, 1) = 00:00:
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

// teraz filtr tygodniowy odpali wszystkie wpłaty od północy poniedziałku
const earningsWeek = computed(() =>
  payments.value
    .filter(p => {
      const pd = new Date(p.created_at || p.date)
      return pd >= weekStart && pd <= now
    })
    .reduce((sum,p) => sum + Number(p.amount), 0)
)
const earningsMonth = computed(() =>
  payments.value
    .filter(p => {
      const pd = new Date(p.created_at||p.date)
      return pd>=monthStart && pd<=now
    })
    .reduce((sum,p)=>sum+Number(p.amount),0)
)

// 6) Wykres statusu
const vehicleStatusCounts = computed(() => {
  // 1) liczba najmów nie-archiwalnych
  const rentedCount = rentals.value.filter(r => !r.archived).length

  // 2) liczba niedostępnych pojazdów
  const unavailableCount = vehicles.value.filter(v => v.status === 'unavailable').length

  // 3) reszta to dostępne
  const availableCount = vehicles.value.length 
    - (unavailableCount+rentedCount)

  return {
    rented: rentedCount,
    unavailable: unavailableCount,
    available: availableCount
  }
})

const availableVehicles = computed(() =>
  vehicles.value.filter(v => {
    if (v.status === 'unavailable') return false

    // sprawdź, czy jest w aktywnym najmie
    const activeRental = rentals.value.some(r => {
      if (r.archived) return false
      if (r.vehicle_id !== v.id) return false
      const sd = new Date(r.start_date)
      const ed = r.end_date
        ? new Date(r.end_date)
        : new Date()      // brak end_date traktujemy jak „do dziś”
      return sd <= now && now <= ed
    })

    return !activeRental
  })
)

function dueClass(due) {
  // jeśli do dopłaty > 0, zwracamy klasę Vuetify; inaczej pusty string
  return due > 0
    ? 'bg-red lighten-4 white--text pa-2 rounded'
    : ''
}

// nagłówki tabel
const headers = [
  { title:'Marka', key:'brand', align:'start' },
  { title:'Model', key:'model' },
  { title:'Nr rej.', key:'reg_number' },
  { title:'Przegląd', key:'inspection_date', align:'center' },
]
const vehicleHeaders = [
  { title:'Marka',key:'brand',align:'start' },
  { title:'Model',key:'model' },
  { title:'Nr rej.',key:'reg_number' },
]
const resHeaders = [
  { title:'Klient',key:'client',sortable:false },
  { title:'Pojazd',key:'vehicle',sortable:false },
  { title:'Data startu',key:'start_date',align:'center' },
]
const rentHeaders = [
  { title:'Pojazd',key:'vehicle', align:'start' },
  { title:'Klient',key:'client' },
  { title:'Data końca',key:'end_date',align:'center' },
  { title:'Zapłacono',key:'paid',align:'end' },
  { title:'Do zapłacenia',key:'toPay',align:'end' },
  { title:'Do dopłaty',key:'due',align:'end' },
  { title:'Kaucja',key:'deposit',align:'center' }
]
</script>

<style scoped>
/* dodatkowe style jeśli potrzebne */
</style>
