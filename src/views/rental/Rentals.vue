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
        <v-btn
          color="secondary"
          :loading="loading"
          class="ml-2"
          @click="rentalStore.fetchAll()"
        >
          Odśwież listę
        </v-btn>
        <v-btn text class="ml-4" @click="$router.push({ name: 'ArchivedRentals' })">
          Archiwum →
        </v-btn>
      </v-col>
    </v-row>

    <!-- B. Tabela wypożyczeń -->
    <v-data-table
      :headers="headers"
      :items="rentals"
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
        ({{ item.vehicles?.reg_number || '–' }})
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
  const s = new Date(r.start_date)
  const e = r.end_date ? new Date(r.end_date) : new Date()
  const msInDay = 1000 * 60 * 60 * 24
  const days = Math.ceil((e - s) / msInDay)

  if (r.monthly_rate > 0 && (!r.daily_rate || r.daily_rate === 0)) {
    const dim = new Date(s.getFullYear(), s.getMonth()+1, 0).getDate()
    const m = Math.floor(days / dim)
    const rem = days - m * dim
    return m * r.monthly_rate + rem * (r.monthly_rate / dim)
  }
  return days * (r.daily_rate || 0)
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
</script>
<style lang="css" scoped>
.button {
  text-transform: uppercase;
}
</style>