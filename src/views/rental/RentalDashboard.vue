<template>
  <v-container fluid class="pa-4">
        <v-row class="mb-12">
      <v-col cols="12" md="12">
        <v-card outlined>
            <v-card-title class="d-flex align-center justify-center">
            <div>
              <v-icon left color="green">mdi-cash</v-icon>
              Przychody
            </div>
</v-card-title>
          <v-card-title class="d-flex align-center justify-center">
            <div class="d-flex align-center">
              <v-btn icon @click="prevMonth"><v-icon>mdi-chevron-left</v-icon></v-btn>
              <span class="mx-2">{{ monthLabel }}</span>
              <v-btn icon @click="nextMonth"><v-icon>mdi-chevron-right</v-icon></v-btn>
            </div>
          </v-card-title>
<v-card-text>
  <v-sheet
    color="grey-lighten-4"
    rounded
    class="pa-4"
  >
    <!-- Przychody -->
    <div class="payment-row green-row mb-3">
      <v-icon color="green" class="me-2">mdi-cash</v-icon>
      <strong class="label">Przychody:</strong>&nbsp;
      <span class="value">{{ formatCurrency(earningsSelectedMonth) }}</span>
    </div>

    <!-- Gotówka -->
    <div class="payment-row orange-row mb-2">
      <v-icon color="deep-orange" class="me-2">mdi-cash</v-icon>
      <strong class="label">Gotówka:</strong>&nbsp;
      <span class="value">{{ formatCurrency(paymentsByMethod.cash) }}</span>
    </div>

    <!-- Karta -->
    <div class="payment-row blue-row mb-2">
      <v-icon color="indigo" class="me-2">mdi-credit-card-outline</v-icon>
      <strong class="label">Karta:</strong>&nbsp;
      <span class="value">{{ formatCurrency(paymentsByMethod.card) }}</span>
    </div>

    <!-- Przelew -->
    <div class="payment-row purple-row">
      <v-icon color="purple" class="me-2">mdi-bank-transfer</v-icon>
      <strong class="label">Przelew:</strong>&nbsp;
      <span class="value">{{ formatCurrency(paymentsByMethod.transfer) }}</span>
    </div>
  </v-sheet>
</v-card-text>





        </v-card>
      </v-col>
    </v-row>
          <v-card-title class="d-flex justify-center align-center">
            <v-btn icon @click="prevDay"><v-icon>mdi-chevron-left</v-icon></v-btn>
            <span>{{ dayLabel }}</span>
            <v-btn icon @click="nextDay"><v-icon>mdi-chevron-right</v-icon></v-btn>
          </v-card-title>
    <!-- Karta: Rezerwacje / Wypożyczenia / Zwroty -->
<v-row class="mb-6" dense>
  <!-- Rezerwacje -->

  <v-col cols="12" md="4">
    <v-card outlined>
      <v-card-title class="bg-blue-lighten-5">
        <v-icon color="blue" class="mr-2">mdi-calendar-clock</v-icon>
        Rezerwacje
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item
            v-for="r in reservationsForDay"
            :key="r.id"
          >
            <v-list-item-content>
              <div class="d-flex align-center mb-1">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                <strong>{{ r.first_name }} {{ r.last_name }}</strong>
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="teal" class="mr-2">mdi-car</v-icon>
                {{ r.vehicle.brand }} {{ r.vehicle.model }} ({{ r.vehicle.reg_number }})
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="orange" class="mr-2">mdi-calendar-start</v-icon>
                Od: {{ formatDate(r.start_date) }}
              </div>
              <div class="d-flex align-center">
                <v-icon color="deep-orange" class="mr-2">mdi-calendar-end</v-icon>
                Do: {{ formatDate(r.end_date) }}
              </div>
            </v-list-item-content>
              <v-divider
    v-if="index !== rentalsForDay.length - 1"
    class="my-3"
  />
          </v-list-item>
          <v-list-item v-if="!reservationsForDay.length" title="Brak" />
        </v-list>
      </v-card-text>
    </v-card>
  </v-col>

  <!-- Wypożyczenia -->
  <v-col cols="12" md="4">
    <v-card outlined>
      <v-card-title class="bg-green-lighten-5">
        <v-icon color="green" class="mr-2">mdi-car-key</v-icon>
        Wypożyczenia
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item
            v-for="r in rentalsForDay"
            :key="r.id"
          >
            <v-list-item-content>
              <div class="d-flex align-center mb-1">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                <strong>{{ r.client_first }} {{ r.client_last }}</strong>
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="teal" class="mr-2">mdi-car</v-icon>
                {{ r.vehicle.brand }} {{ r.vehicle.model }} ({{ r.vehicle.reg_number }})
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="orange" class="mr-2">mdi-calendar-start</v-icon>
                Od: {{ formatDate(r.start_date) }}
              </div>
              <div class="d-flex align-center">
                <v-icon color="deep-orange" class="mr-2">mdi-calendar-end</v-icon>
                Do: {{ formatDate(r.end_date) }}
              </div>
            </v-list-item-content>
              <v-divider
    v-if="index !== rentalsForDay.length - 1"
    class="my-3"
  />
          </v-list-item>
          <v-list-item v-if="!rentalsForDay.length" title="Brak" />
        </v-list>
      </v-card-text>
    </v-card>
  </v-col>

  <!-- Zwroty -->
  <v-col cols="12" md="4">
    <v-card outlined>
      <v-card-title class="bg-red-lighten-5">
        <v-icon color="red" class="mr-2">mdi-car-off</v-icon>
        Zwroty
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item
            v-for="r in returnsForDay"
            :key="r.id"
          >
            <v-list-item-content>
              <div class="d-flex align-center mb-1">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                <strong>{{ r.client_first }} {{ r.client_last }}</strong>
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="teal" class="mr-2">mdi-car</v-icon>
                {{ r.vehicle.brand }} {{ r.vehicle.model }} ({{ r.vehicle.reg_number }})
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="orange" class="mr-2">mdi-calendar-start</v-icon>
                Od: {{ formatDate(r.start_date) }}
              </div>
              <div class="d-flex align-center mb-1">
                <v-icon color="deep-orange" class="mr-2">mdi-calendar-end</v-icon>
                Do: {{ formatDate(r.end_date) }}
              </div>
              <div class="d-flex align-center">
                <v-icon color="green" class="mr-2">mdi-cash</v-icon>
                Zapłacono: <strong class="ml-1">{{ formatCurrency(r.paidAmount) }}</strong>
              </div>
              <v-chip
                  :color="r.archived ? 'grey' : 'orange'"
                  text-color="white"
                  size="small"
                  variant="flat"
                >
                  {{ r.archived ? 'Zwrócono' : 'W drodze' }}
                </v-chip>
            </v-list-item-content>
              <v-divider
    v-if="index !== rentalsForDay.length - 1"
    class="my-3"
  />
          </v-list-item>
          <v-list-item v-if="!returnsForDay.length" title="Brak" />
        </v-list>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>


    <!-- Karta: Przychody -->


    <!-- Tabela: Przeglądy -->
<v-row>
  <v-col cols="12">
    <v-card outlined>
      <v-card-title>
        <v-icon left color="purple">mdi-tools</v-icon>
        Przeglądy (wygasłe lub za ≤7 dni): {{ expiringInspections.length }}
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            v-for="v in expiringInspections"
            :key="v.id"
            cols="12"
            md="4"
          >
            <v-card outlined class="h-100">
              <v-card-title class="d-flex align-center">
                <v-icon color="teal" class="mr-2">mdi-car</v-icon>
                <strong>{{ v.brand }} {{ v.model }}</strong>
              </v-card-title>
              <v-card-subtitle class="mb-2">
                <v-icon size="18" class="mr-1" color="grey">mdi-numeric</v-icon>
                {{ v.reg_number }}
              </v-card-subtitle>
              <v-divider></v-divider>
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon color="orange" class="mr-2">mdi-calendar</v-icon>
                  <span :class="dateClass(v.inspection_date)">
                    {{ formatDate(v.inspection_date) }}
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col v-if="!expiringInspections.length" cols="12">
            <v-alert type="info" variant="outlined">
              — brak wygaśnięć —
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>


  </v-container>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useRentalStore } from '@/stores/rentalStore'
import { usePaymentStore } from '@/stores/paymentStore'
import { supabase } from '@/lib/supabase'

// --- Stores ---
const vehicleStore = useVehicleStore()
const reservationStore = useReservationStore()
const rentalStore = useRentalStore()
const paymentStore = usePaymentStore()

const { list: vehicles } = storeToRefs(vehicleStore)
const { list: reservations } = storeToRefs(reservationStore)
const { list: payments } = storeToRefs(paymentStore)

const allRentals = ref([])

// --- Ładowanie danych ---
onMounted(async () => {
  await Promise.all([
    vehicleStore.fetchActive(),
    reservationStore.fetchAll(),
    rentalStore.fetchAll(),
    paymentStore.fetchAll()
  ])
  allRentals.value = await loadAllRentals()
})

async function loadAllRentals() {
  const { data, error } = await supabase
    .from('rentals')
    .select(`*, vehicle:vehicle_id(brand, model, reg_number)`)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Błąd ładowania wypożyczeń:', error.message)
    return []
  }
  return data
}

// --- Daty: dzień ---
const currentDay = ref(new Date())
const dayLabel = computed(() =>
  currentDay.value.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
)
function prevDay() {
  currentDay.value = new Date(currentDay.value.setDate(currentDay.value.getDate() - 1))
}
function nextDay() {
  currentDay.value = new Date(currentDay.value.setDate(currentDay.value.getDate() + 1))
}
function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth() === db.getMonth() &&
         da.getDate() === db.getDate()
}

// --- Daty: miesiąc ---
const currentMonth = ref(new Date())
const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
)
function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}
function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

// --- Przychody ---
const earningsSelectedMonth = computed(() => {
  const start = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1)
  const end = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0, 23, 59, 59)
  return payments.value
    .filter(p => {
      const d = new Date(p.created_at || p.date)
      return d >= start && d <= end
    })
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

// --- Rezerwacje / Wypożyczenia / Zwroty ---
const reservationsForDay = computed(() =>
  reservations.value
    .filter(r => isSameDay(r.start_date, currentDay.value))
    .map(r => ({
      ...r,
      vehicle: vehicles.value.find(v => v.id === r.vehicle_id) || {}
    }))
)

const rentalsForDay = computed(() =>
  allRentals.value
    .filter(r => isSameDay(r.start_date, currentDay.value))
    .map(r => ({
      ...r,
      vehicle: r.vehicle || vehicles.value.find(v => v.id === r.vehicle_id) || {}
    }))
)

const returnsForDay = computed(() =>
  allRentals.value
    .filter(r => r.end_date && isSameDay(r.end_date, currentDay.value))
    .map(r => {
      const paid = payments.value
        .filter(p => p.rental_id === r.id)
        .reduce((sum, p) => sum + Number(p.amount), 0)

      return {
        ...r,
        vehicle: r.vehicle || vehicles.value.find(v => v.id === r.vehicle_id) || {},
        paidAmount: paid,
        start_date: r.start_date,
        end_date: r.end_date
      }
    })
)


// --- Przeglądy ---
const now = new Date()
const in7 = new Date(now); in7.setDate(now.getDate() + 7)

const expiringInspections = computed(() =>
  vehicles.value.filter(v => {
    const insp = v.inspection_date && new Date(v.inspection_date)
    return insp && (insp < now || insp <= in7)
  })
)

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

// --- Formatery ---
function formatDate(d) {
  if (!d) return '–'
  return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))
}
function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(val || 0)
}

// --- Nagłówki tabeli przeglądów ---
const headers = [
  { title: 'Marka', key: 'brand', align: 'start' },
  { title: 'Model', key: 'model' },
  { title: 'Nr rej.', key: 'reg_number' },
  { title: 'Przegląd', key: 'inspection_date', align: 'center' }
]

const paymentsByMethod = computed(() => {
  const start = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1)
  const end = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0, 23, 59, 59)

  const filtered = payments.value.filter(p => {
    const d = new Date(p.created_at || p.date)
    return d >= start && d <= end
  })

  return {
    cash: filtered
      .filter(p => p.payment_method?.toLowerCase() === 'gotówka')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    card: filtered
      .filter(p => p.payment_method?.toLowerCase() === 'karta')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    transfer: filtered
      .filter(p => p.payment_method?.toLowerCase() === 'przelew')
      .reduce((sum, p) => sum + Number(p.amount), 0)
  }
})

</script>
<style scoped>
.payment-row {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 1.1rem;
}

.payment-row .label {
  font-weight: bold;
}

.payment-row .value {
  font-weight: normal;
}

/* Warianty kolorów z wyraźnym odróżnieniem */
.green-row {
  background-color: rgba(76, 175, 80, 0.12);   /* zielony */
  border: 1px solid rgba(56, 142, 60, 0.4);
}

.orange-row {
  background-color: rgba(255, 152, 0, 0.12);   /* pomarańczowy */
  border: 1px solid rgba(245, 124, 0, 0.4);
}

.blue-row {
  background-color: rgba(63, 81, 181, 0.12);   /* niebieski/indigo */
  border: 1px solid rgba(48, 63, 159, 0.4);
}

.purple-row {
  background-color: rgba(156, 39, 176, 0.12);  /* fioletowy */
  border: 1px solid rgba(123, 31, 162, 0.4);
}

</style>