<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">     
        <v-card-title class="text-h6">Koszty</v-card-title>
<!-- Pasek do nawigacji po miesiącach -->
<v-row class="mb-4" justify="center" align="center">
  <v-col cols="12" class="d-flex align-center justify-center">
    <!-- Poprzedni miesiąc -->
    <v-btn icon @click="prevMonth" :disabled="loading">
      <v-icon size="32">mdi-chevron-left</v-icon>
    </v-btn>

    <!-- Aktualny miesiąc -->
    <span class="month-display mx-4 text-h6 font-weight-bold">
      {{ monthLabel }}
    </span>

    <!-- Następny miesiąc -->
    <v-btn icon @click="nextMonth" :disabled="loading">
      <v-icon size="32">mdi-chevron-right</v-icon>
    </v-btn>
  </v-col>
</v-row>


            <v-row>
          <v-col cols="12">
            <v-card
              class="pa-4"
              color="blue-grey-lighten-5"
              elevation="2"
            >

              <v-card-title
                class="d-flex  align-center text-h6"
                
              >
                <span>Łącznie: <strong>{{ formatPLN(totalAll) }}</strong></span>
              </v-card-title>
              
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-card class="d-flex  align-center">
            <v-card-title>
          <v-btn size="large" color="primary" @click="dialogForm = true">
            <v-icon start>mdi-plus</v-icon> Dodaj fakturę
          </v-btn>
            </v-card-title>
          </v-card>
        </v-row>

          <!-- dialog z formularzem -->
          <v-dialog v-model="dialogForm" max-width="600px">
            <v-card>
         
              <v-card-text>
                <InvoiceForm
                  :suppliers="suppliers"
                  @submitted="handleSubmitted"
                  @cancel="dialogForm = false"
                />
              </v-card-text>
            </v-card>
          </v-dialog>

      </v-col>
    </v-row>

    <!-- Podsumowanie kosztów per hurtownia -->
<v-row>

<!-- Panele z hurtowniami -->
<v-expansion-panels multiple>
  <v-expansion-panel
    v-for="supplier in suppliers"
    :key="supplier"
  >
    <v-expansion-panel-title>
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center">
          <!-- Stałe ikony wpisane w template -->
          <v-icon
            v-if="supplier === 'InterCars'"
            class="me-2"
            color="indigo-darken-2"
          >mdi-car-wrench</v-icon>
          <v-icon
            v-else-if="supplier === 'InterTeam'"
            class="me-2"
            color="indigo-darken-2"
          >mdi-tools</v-icon>
          <v-icon
            v-else-if="supplier === 'Auto-Starter'"
            class="me-2"
            color="indigo-darken-2"
          >mdi-car-battery</v-icon>
          <v-icon
            v-else-if="supplier === 'AutoCzar'"
            class="me-2"
            color="indigo-darken-2"
          >mdi-steering</v-icon>
          <v-icon
            v-else
            class="me-2"
            color="indigo-darken-2"
          >mdi-store</v-icon>

          <span class="font-weight-medium">{{ supplier }}</span>
        </div>

        <strong :class="totalForSupplier(supplier) > 0 ? 'text-success' : 'text-grey'">
          {{ formatPLN(totalForSupplier(supplier)) }}
        </strong>
      </div>
    </v-expansion-panel-title>

    <v-expansion-panel-text>
      <v-list density="compact" lines="two">
        <template v-if="filteredInvoicesBySupplier(supplier).length">
          <div
            v-for="(inv, idx) in filteredInvoicesBySupplier(supplier)"
            :key="inv.id"
          >
            <v-list-item>
              <template #prepend>
                <v-icon color="blue-darken-2">mdi-calendar</v-icon>
              </template>

              <v-list-item-title class="d-flex justify-space-between align-center">
                <span>{{ formatDate(inv.invoice_date) }}</span>
                <span
                  class="font-weight-bold"
                  :class="Number(inv.amount) >= 0 ? 'text-red-darken-2' : 'text-green-lighten-1'"
                >
                  {{ formatPLN(inv.amount) }}
                </span>
 <v-btn
        icon
        size="small"
        color="red-lighten-2"
        class="ms-2"
        @click="removeInvoice(inv.id)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
              </v-list-item-title>

              <v-list-item-subtitle>
                <v-icon size="small" class="me-1" color="grey-darken-1">mdi-note-text</v-icon>
                {{ inv.note || 'Brak notatki' }}
              </v-list-item-subtitle>
            </v-list-item>

            <!-- Separator między fakturami -->
            <v-divider v-if="idx < filteredInvoicesBySupplier(supplier).length - 1" />
          </div>
        </template>

        <v-list-item v-else>
          <v-list-item-title>Brak faktur</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>

<!-- Globalna sekcja Łącznie na dole wszystkich kart -->
<v-divider class="my-4" />





</v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import InvoiceForm from '../../components/workshop/InvoiceForm.vue'


const suppliers = [
  'InterCars',
  'InterTeam',
  'Auto-Starter',
  'AutoCzar',
  'Inne'
]

const summaryHeaders = [
  { title: 'Hurtownia', key: 'supplier' },
  { title: 'Suma kosztów', key: 'total_amount', align: 'end' }
]

const invoiceHeaders = [
  { title: 'Data', key: 'invoice_date' },
  { title: 'Hurtownia', key: 'supplier' },
  { title: 'Kwota', key: 'amount', align: 'end' },
  { title: 'Notatka', key: 'note' }
]

const selectedMonth = ref('')
const invoices = ref([])
const summary = ref([])

const loadingInvoices = ref(false)
const loadingSummary = ref(false)

const availableMonths = computed(() => {
  const months = new Set(invoices.value.map(i => i.invoice_date?.slice(0, 7)).filter(Boolean))
  return Array.from(months).sort().reverse()
})

const monthItems = computed(() =>
  availableMonths.value.map(v => ({
    title: formatMonth(v),
    value: v
  }))
)

const filteredInvoices = computed(() => {
  if (!selectedMonth.value) return invoices.value
  return invoices.value.filter(i =>
    i.invoice_date?.startsWith(selectedMonth.value)
  )
})

const summaryFiltered = computed(() => {
  if (!selectedMonth.value) return summary.value

  const bySupplier = new Map()
  suppliers.forEach(s => bySupplier.set(s, 0))

  invoices.value.forEach(inv => {
    if (inv?.invoice_date?.startsWith(selectedMonth.value)) {
      const s = inv.supplier || 'Inne'
      bySupplier.set(s, (bySupplier.get(s) || 0) + Number(inv.amount || 0))
    }
  })

  return suppliers.map(s => ({
    supplier: s,
    total_amount: bySupplier.get(s) || 0
  }))
})

const summaryWithTotal = computed(() => {
  const source = selectedMonth.value ? summaryFiltered.value : summary.value
  const total = source.reduce((acc, row) => acc + row.total_amount, 0)

  return [
    ...source,
    {
      supplier: '🧾 Suma ogółem',
      total_amount: total
    }
  ]
})

function formatPLN(val: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(val || 0))
}

function formatDate(d: string) {
  try {
    const [y, m, day] = d.split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString('pl-PL')
  } catch {
    return d
  }
}

function formatMonth(month: string) {
  try {
    const [y, m] = month.split('-').map(Number)
    return new Date(y, m - 1).toLocaleString('pl-PL', { month: 'long', year: 'numeric' })
  } catch {
    return month
  }
}

async function fetchInvoices() {
  loadingInvoices.value = true
  try {
    const { data, error } = await supabase
      .from('workshop_invoices')
      .select('*')
      .order('invoice_date', { ascending: false })
      .order('id', { ascending: false })

    if (error) throw error
    invoices.value = data || []
  } catch (e) {
    console.error(e)
    invoices.value = []
  } finally {
    loadingInvoices.value = false
  }
}

async function fetchSummary() {
  loadingSummary.value = true
  try {
    const { data, error } = await supabase
      .from('workshop_invoices_summary')
      .select('*')

    if (error) throw error

    const mapped = suppliers.map(s => {
      const row = (data || []).find(r => r.supplier === s)
      return { supplier: s, total_amount: row?.total_amount ?? 0 }
    })

    summary.value = mapped
  } catch (e) {
    console.error(e)
    summary.value = suppliers.map(s => ({ supplier: s, total_amount: 0 }))
  } finally {
    loadingSummary.value = false
  }
}

async function handleSubmitted() {
  await Promise.all([fetchInvoices(), fetchSummary()])
}

onMounted(() => {
  selectedMonth.value = month.value
  handleSubmitted()
})
function filteredInvoicesBySupplier(supplier: string) {
  return filteredInvoices.value.filter(inv => inv.supplier === supplier)
}

function totalForSupplier(supplier: string) {
  return filteredInvoicesBySupplier(supplier)
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
}

const dialogForm = ref(false)
const totalAll = computed(() =>
  filteredInvoices.value.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
)

const loading = ref(false) // możesz użyć do blokowania przycisków

// 🗓️ Aktualny miesiąc w formacie "YYYY-MM"
const month = ref(new Date().toISOString().slice(0, 7))

// 📅 Wyświetlany label np. "sierpień 2025"
const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})

// 🔄 Przesunięcie miesiąca o delta (np. -1 lub 1)
function shiftMonth(delta: number) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, (m - 1) + delta, 1)
  const y2 = d.getFullYear()
  const m2 = String(d.getMonth() + 1).padStart(2, '0')

  // aktualizacja miesiąca w obydwu zmiennych
  month.value = `${y2}-${m2}`
  selectedMonth.value = month.value

  // przeładuj dane dla nowego miesiąca
  handleSubmitted()
}

async function removeInvoice(id) {
  if (!confirm('Usunąć tę fakturę?')) return

  try {
    const { error } = await supabase
      .from('workshop_invoices')
      .delete()
      .eq('id', id)
console.log('Usuwam id:', id, typeof id)

    if (error) throw error

    // usuń z lokalnej listy — żeby UI odświeżył się od razu
    invoices.value = invoices.value.filter(inv => inv.id !== id)
  } catch (e) {
    console.error(e)
    alert('Nie udało się usunąć faktury')
  }
}



// ⬅️ Poprzedni miesiąc
function prevMonth() {
  shiftMonth(-1)
}

// ➡️ Następny miesiąc
function nextMonth() {
  shiftMonth(1)
}
</script>

<style scoped>
.total-row {
  background-color: #f2f6fc;
  font-weight: bold;
}
</style>
