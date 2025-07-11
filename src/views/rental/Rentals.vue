<template>
  <div class="rentals-view">
    <h2>Wypożyczenia</h2>
    <RentalForm @saved="onRentalSaved" />

    <ul>
      <li v-for="r in rentals" :key="r.id">
        {{ r.client_first }} {{ r.client_last }} →
        {{ r.vehicles?.[0]?.brand || '–' }}
        {{ r.vehicles?.[0]?.model || '' }}
        {{ r.vehicles?.[0]?.reg_number || '' }}
        | {{ r.start_date }} – {{ r.end_date }}
        | zapłacono: {{ rentalPayments[r.id] || 0 }} zł
        | do zapłaty: {{ calcCost(r).toFixed(2) }} zł
        | kaucja: {{ r.deposit ? 'tak' : 'nie' }}
<button @click="togglePayments(r.id)">
        {{ showPayments[r.id] ? 'Ukryj wpłaty' : 'Pokaż wpłaty' }}
      </button>

      <div v-if="showPayments[r.id]" class="payments-section">
        <PaymentList :rentalId="r.id" />

        <PaymentForm 
          :rentalId="r.id"
          @added="onPaymentAdded"
        />
      </div>
        <button @click="startEdit(r)">Edytuj</button>
        <button @click="remove(r.id)">Usuń</button>
      </li>
    </ul>

    <EditRentalForm
      v-if="editing"
      :rental="editing"
      @updated="onRentalUpdated"
      @cancel="editing = null"
    />

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="loading">Ładowanie…</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs }              from 'pinia'
import { reactive }      from 'vue'
import { useRentalStore }           from '@/stores/rentalStore'
import { usePaymentStore }          from '@/stores/paymentStore'
import RentalForm                   from '@/components/rental/RentalForm.vue'
import EditRentalForm               from '@/components/rental/EditRentalForm.vue'
import PaymentForm       from '@/components/rental/PaymentForm.vue'
import PaymentList       from '@/components/rental/PaymentList.vue'

const showPayments = reactive({})

function togglePayments(id) {
  showPayments[id] = !showPayments[id]
}

async function onPaymentAdded() {
  // po dodaniu wpłaty odśwież listę wpłat dla danego rental
  // PaymentList we własnym onAdded może wywołać fetchByRental lub tutaj:
  // optionalnie emitować event z id, żeby przeładować
}

const rentalStore  = useRentalStore()
const paymentStore = usePaymentStore()

const { list: rentals, loading, error } = storeToRefs(rentalStore)
const { list: payments }                = storeToRefs(paymentStore)

const editing = ref(null)

onMounted(async () => {
  await rentalStore.fetchAll()
  await paymentStore.fetchAll()
})

const rentalPayments = computed(() => {
  return payments.value.reduce((acc, p) => {
    acc[p.rental_id] = (acc[p.rental_id] || 0) + Number(p.amount)
    return acc
  }, {})
})

const onRentalSaved = async () => {
  await rentalStore.fetchAll()
  await paymentStore.fetchAll()
}

const startEdit = r => {
  editing.value = { ...r }
}

const onRentalUpdated = async () => {
  editing.value = null
  await rentalStore.fetchAll()
  await paymentStore.fetchAll()
}

const remove = async id => {
  if (!confirm('Usuń to wypożyczenie?')) return
  await rentalStore.deleteRental(id)
  await paymentStore.fetchAll()
}

// pomocnicza funkcja: ile dni jest w miesiącu daty d
function daysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()
}

// główna funkcja licząca koszt
function calcCost(r) {
  const s = new Date(r.start_date)
  const e = new Date(r.end_date)
  const msInDay = 1000 * 60 * 60 * 24
  // całkowita liczba dni (z wliczeniem dnia końcowego)
  const totalDays = Math.ceil((e - s) / msInDay)

  // jeśli mamy stawkę miesięczną bez dziennej → pro‐rata
  if (r.monthly_rate > 0 && (!r.daily_rate || r.daily_rate === 0)) {
    const dim = daysInMonth(s)
    const fullMonths = Math.floor(totalDays / dim)
    const remDays    = totalDays - fullMonths * dim
    return fullMonths * r.monthly_rate
         + remDays * (r.monthly_rate / dim)
  }

  // w przeciwnym wypadku: zwykła stawka dzienna
  return totalDays * (r.daily_rate || 0)
}
</script>

<style scoped>
.rentals-view {
  padding: 1rem;
}

.loading {
  color: #666;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
