<!-- src/views/rentals/Rentals.vue -->
<template>
  <v-container fluid class="pa-4">

    <!-- A. Nagłówek z akcjami -->
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5">Wypożyczenia: {{ rentals.length }}</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn color="primary" @click="showAddForm = true">
          Nowe wypożyczenie
        </v-btn>
        <v-btn text class="ml-4" @click="$router.push({ name: 'ArchivedRentals' })">
          Archiwum →
        </v-btn>
      </v-col>
      <v-row justify="center" class="mb-4">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="searchQuery"
            label="Wyszukaj klienta lub pojazd"
            prepend-inner-icon="mdi-magnify"
            clearable
          />
        </v-col>
      </v-row>
    </v-row>

    <!-- B. Tabela wypożyczeń -->
    <v-data-table
      v-if="$vuetify.display.mdAndUp"
      :headers="headers"
      :items="filteredRentals"
      :items-per-page="20"
      class="elevation-1"
      show-expand
      v-model:expanded="expanded"
    >
      <!-- 1. Wypożyczenie -->
      <template #item.start_date="{ item }">
        {{ formatDateLong(item.start_date) }}
      </template>

      <!-- 2. Zdanie -->
      <template #item.end_date="{ item }">
        {{ formatDateLong(item.end_date) }}
      </template>

      <!-- 3. Imię i nazwisko -->
      <template #item.client="{ item }">
        {{ item.client_first }} {{ item.client_last }}
      </template>

      <!-- 4. Numer telefonu -->
      <template #item.client_phone="{ item }">
        <a :href="`tel:${item.client_phone.replace(/\s+/g,'')}`" class="text-decoration-none">
          {{ item.client_phone || '–' }}
        </a>
      </template>

      <!-- 5. Pojazd -->
      <template #item.vehicle="{ item }">
        {{ item.vehicles?.brand || '–' }}
        {{ item.vehicles?.model || '' }}
        {{ item.vehicles?.reg_number || '–' }}
      </template>

      <!-- 6. Zapłacono -->
      <template #item.paid="{ item }">
        {{ formatCurrency(rentalPayments[item.id] || 0) }}
      </template>

      <!-- 7. Do zapłaty -->
      <template #item.toPay="{ item }">
        {{ formatCurrency(calcCost(item)) }}
      </template>

      <template #item.notes="{ item }">
        {{ item.notes || '–' }}
      </template>

      <!-- 8. Kaucja -->
      <template #item.deposit="{ item }">
        {{ item.deposit ? 'tak' : 'nie' }}
      </template>

      <!-- 9. Edytuj -->
      <template #item.edit="{ item }">
        <v-btn prepend-icon="mdi-pencil" @click="startEdit(item)" class="button">
          edytuj
        </v-btn>
      </template>

      <!-- 10. Archiwizuj -->
      <template #item.archive="{ item }">
        <v-btn variant="outlined" prepend-icon="mdi-archive" color="warning" @click="archive(item.id)">
          archiwizuj
        </v-btn>
      </template>

      <!-- rozszerzalny wiersz: płatności -->
      <template #expanded-row="{ item }">
        <tr>
          <td :colspan="headers.length">
            <v-row>
              <v-col cols="12">
                <PaymentList 
                  :rentalId="item.id" 
                  @added="onPaymentAdded(item.id)" 
                />
              </v-col>
            </v-row>
          </td>
        </tr>
      </template>

      <!-- gdy brak danych -->
      <template #no-data>
        <v-alert type="info" variant="outlined">
          — Brak wypożyczeń —
        </v-alert>
      </template>
    </v-data-table>

<!-- Mobile -->
<v-container v-else fluid>
  <v-row dense>
    <v-col
      v-for="item in filteredRentals"
      :key="item.id"
      cols="12"
    >
      <v-card outlined>
        <v-card-title class="justify-space-between align-center">
          <span class="text-subtitle-1">
            <v-icon start color="primary">mdi-account</v-icon>
            {{ item.client_first }} {{ item.client_last }}
          </span>
        </v-card-title>
        <v-card-subtitle>
          <span class="text-caption">
            <v-icon start color="teal">mdi-calendar-range</v-icon>
            {{ formatDateLong(item.start_date) }} — {{ formatDateLong(item.end_date) }}
          </span>
        </v-card-subtitle>
        <v-divider />

        <v-card-text>
          <div>
            <v-icon start color="indigo">mdi-car</v-icon>
            <strong>Pojazd:</strong> {{ item.vehicles?.brand }} {{ item.vehicles?.model }} ({{ item.vehicles?.reg_number }})
          </div>
          <div>
            <v-icon start color="green">mdi-phone</v-icon>
            <strong>Tel.: </strong> 
            <a :href="`tel:${item.client_phone?.replace(/\s+/g,'')}`"> {{ item.client_phone || '–' }}</a>
          </div>
          <div>
            <v-icon start color="blue">mdi-cash-check</v-icon>
            <strong>Zapłacono:</strong> {{ formatCurrency(rentalPayments[item.id] || 0) }}
          </div>
          <div>
            <v-icon start color="deep-orange">mdi-cash</v-icon>
            <strong>Do zapłaty:</strong> {{ formatCurrency(calcCost(item)) }}
          </div>
          <div>
            <v-icon start color="purple">mdi-shield-check</v-icon>
            <strong>Kaucja:</strong> {{ item.deposit ? 'tak' : 'nie' }}
          </div>
          <div>
            <v-icon start color="grey">mdi-note-text</v-icon>
            <strong>Notatki:</strong> {{ item.notes || '–' }}
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn size="small" prepend-icon="mdi-pencil" @click="startEdit(item)">Edytuj</v-btn>
          <v-btn size="small" prepend-icon="mdi-archive" color="warning" @click="archive(item.id)">Archiwizuj</v-btn>
          <v-spacer />
        </v-card-actions>
        <v-card-actions>
              <v-btn block color="primary" variant="outlined" size="large" @click="toggleCard(item.id)">
            <v-icon start>{{ expandedCardIds.includes(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>Płatności 
          </v-btn>
        </v-card-actions>

        <!-- Sekcja płatności -->
        <v-expand-transition>
          <div v-if="expandedCardIds.includes(item.id)" class="pa-3">
            <PaymentList 
              :rentalId="item.id" 
              @added="onPaymentAdded(item.id)" 
            />
          </div>
        </v-expand-transition>
      </v-card>
    </v-col>
  </v-row>
</v-container>


    
    <!-- C. Dialogi: dodawanie / edycja -->
    <v-dialog v-model="showAddForm" max-width="1000" persistent>
      <v-card>
        <v-card-title>Nowe wypożyczenie</v-card-title>
        <v-divider />
        <v-card-text>
          <RentalForm @saved="onRentalSaved" @cancel="showAddForm = false" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditForm" max-width="1000" persistent>
      <v-card v-if="editing">
        <v-card-title>Edytuj wypożyczenie</v-card-title>
        <v-divider />
        <v-card-text>
          <EditRentalForm
            :rental="editing"
            @updated="onRentalUpdated"
            @cancel="showEditForm = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- D. Błąd globalny -->
    <v-alert v-if="error" color="error" variant="outlined" class="mt-4">
      Błąd: {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs }              from 'pinia'

import { useRentalStore }  from '@/stores/rentalStore'
import { usePaymentStore } from '@/stores/paymentStore'

import RentalForm     from '@/components/rental/RentalForm.vue'
import EditRentalForm from '@/components/rental/EditRentalForm.vue'
import PaymentForm    from '@/components/rental/PaymentForm.vue'
import PaymentList    from '@/components/rental/PaymentList.vue'

const rentalStore  = useRentalStore()
const paymentStore = usePaymentStore()

const { list: rentals, loading, error } = storeToRefs(rentalStore)
const { list: payments }                = storeToRefs(paymentStore)

const expanded   = ref([])
const showAddForm  = ref(false)
const showEditForm = ref(false)
const editing      = ref(null)

onMounted(async () => {
  await Promise.all([
    rentalStore.fetchAll(),
    paymentStore.fetchAll()
  ])
})

// nagłówki w żądanej kolejności
const headers = [
  { title: 'Wypożyczenie',      key: 'start_date' },
  { title: 'Zdanie',            key: 'end_date'   },
  { title: 'Imię i nazwisko',   key: 'client'     },
  { title: 'Numer telefonu',    key: 'client_phone' },
  { title: 'Pojazd',            key: 'vehicle'    },
  { title: 'Zapłacono',         key: 'paid'       },
  { title: 'Do zapłaty',        key: 'toPay'      },
  {  title: 'Notatki',          key: 'notes'    },
  { title: 'Kaucja',            key: 'deposit'    },
  { title: 'Edytuj',            key: 'edit',      sortable: false },
  { title: 'Archiwizuj',        key: 'archive',   sortable: false }
]

// sumy wpłat wg wypożyczenia
const rentalPayments = computed(() =>
  payments.value.reduce((acc, p) => {
    acc[p.rental_id] = (acc[p.rental_id] || 0) + Number(p.amount)
    return acc
  }, {})
)

function onRentalSaved() {
  showAddForm.value = false
  rentalStore.fetchAll()
  paymentStore.fetchAll()
}

function startEdit(r) {
  editing.value      = { ...r }
  showEditForm.value = true
}

async function onRentalUpdated() {
  showEditForm.value = false
  editing.value      = null
  await rentalStore.fetchAll()
  await paymentStore.fetchAll()
}

async function archive(id) {
  if (!confirm('Przenieść do archiwum?')) return
  await rentalStore.archiveRental(id)
}

function onPaymentAdded(rentalId) {
  paymentStore.fetchAll()
}

function calcCost(r) {
  const monthlyRate = Number(r.monthly_rate || 0)
  const dailyRateFromMonthly = monthlyRate / 30 // stała proporcja
  const hasMonthly = monthlyRate > 0

  const s = new Date(r.start_date)
  const e = r.end_date ? new Date(r.end_date) : new Date()

  // fallback: jeśli brak miesięcznej stawki, zwykła dzienna
  if (!hasMonthly) {
    const msInDay = 1000 * 60 * 60 * 24
    const days = Math.max(0, Math.round((toMidnight(e) - toMidnight(s)) / msInDay))
    return days * (Number(r.daily_rate) || 0)
  }

  // 1) policz pełne “rocznice” dnia miesiąca startu
  let anniversaries = 0
  let cursor = new Date(s)
  while (true) {
    const next = addOneMonthSameDay(cursor)
    if (next > e) break
    anniversaries++
    cursor = next
  }

  // 2) dni “ponad miesiąc” (jeśli koniec po ostatniej rocznicy)
  const extraDays = diffDays(cursor, e) // może być 0
  const cost = anniversaries * monthlyRate + extraDays * dailyRateFromMonthly
  return roundMoney(cost)
}

// ————— helpers —————

// Zaokrąglenie do 2 miejsc dla walut
function roundMoney(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100
}

// Wyznacza kolejną rocznicę: ten sam dzień miesiąca, miesiąc +1
function addOneMonthSameDay(d) {
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()
  // Tworzymy datę na miesiąc dalej, próbując zachować “day”
  // Jeśli miesiąc nie ma tak wielu dni, JS przesunie datę (np. 31 -> 1 kolejnego)
  // Chcemy twardo obliczyć rocznicę dnia -> użyjemy min z ostatnim dniem miesiąca
  const lastDayNextMonth = new Date(y, m + 2, 0).getDate()
  const targetDay = Math.min(day, lastDayNextMonth)
  return toMidnight(new Date(y, m + 1, targetDay))
}

// Różnica w pełnych dniach (bez pułapek DST – sprowadzamy do północy)
function diffDays(a, b) {
  const msInDay = 1000 * 60 * 60 * 24
  return Math.max(0, Math.round((toMidnight(b) - toMidnight(a)) / msInDay))
}

// Ustala godzinę na 00:00:00.000 (lokalnie), by uniknąć DST
function toMidnight(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}


function formatDateLong(dateStr) {
  if (!dateStr) return '–'
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(dateStr))
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency', currency: 'PLN', minimumFractionDigits: 2
  }).format(val || 0)
}

const searchQuery = ref('')

const filteredRentals = computed(() => {
  if (!searchQuery.value) return rentals.value

  const query = searchQuery.value.toLowerCase().trim()

  return rentals.value.filter(r => {
    const fullName = `${r.client_first} ${r.client_last}`.toLowerCase()
    const vehicle = `${r.vehicles?.brand || ''} ${r.vehicles?.model || ''} ${r.vehicles?.reg_number || ''}`.toLowerCase()
    return fullName.includes(query) || vehicle.includes(query)
  })
})

const expandedCardIds = ref([])

function toggleCard(id) {
  if (expandedCardIds.value.includes(id)) {
    expandedCardIds.value = expandedCardIds.value.filter(x => x !== id)
  } else {
    expandedCardIds.value.push(id)
  }
}

</script>
<style lang="css" scoped>
.button {
  text-transform: uppercase;
}
</style>