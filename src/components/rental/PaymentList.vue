<!-- src/components/rental/PaymentList.vue -->
<template>
  <v-card flat class="payment-list pa-4">
    <!-- Tytuł historii -->
     <div>
    <v-card-title class="text-h6">Historia wpłat</v-card-title>
<v-btn color="primary" @click="dialog = true">
  <v-icon start>mdi-cash-plus</v-icon>
  Dodaj wpłatę
</v-btn>
</div>
<div v-if="!payments.length" class="text-center text-medium-emphasis py-4">
  — Brak wpłat —
</div>

<v-row dense>
  <v-col
    v-for="p in payments"
    :key="p.id"
    cols="12"
    class="paymentDivider"
  >
    <v-sheet rounded outlined class="pa-3">
      <!-- Data -->
      <div class="mb-1 d-flex align-center">
        <v-icon size="18" color="blue" class="me-1">mdi-calendar</v-icon>
        <strong>Data:</strong> {{ formatDateOnly(p.paid_at) }}
      </div>

      <!-- Kwota -->
      <div class="mb-1 d-flex align-center">
        <v-icon size="18" color="green" class="me-1">mdi-cash</v-icon>
        <strong>Kwota:</strong> {{ p.amount.toFixed(2) }} zł
      </div>

      <!-- Metoda płatności -->
      <div v-if="p.payment_method" class="mb-1 d-flex align-center">
        <v-icon size="18" color="teal" class="me-1">mdi-credit-card-outline</v-icon>
        <strong>Płatność:</strong> {{ p.payment_method }}
      </div>

      <!-- Notatki -->
      <div v-if="p.notes" class="mb-1 d-flex align-center">
        <v-icon size="18" color="grey" class="me-1">mdi-note-text-outline</v-icon>
        <strong>Notatki:</strong> {{ p.notes }}
      </div>

      <!-- Usuń -->
      <div class="mt-2 d-flex justify-end">
        <v-btn
          variant="outlined"
          color="error"
          size="small"
          @click="remove(p.id)"
        >
          <v-icon start>mdi-delete</v-icon>
          Usuń
        </v-btn>
      </div>
    </v-sheet>
  </v-col>
  
</v-row>


    <v-divider class="my-4"/>

    <!-- Tytuł formularza -->
<!-- Przycisk otwierający dialog -->


<!-- Dialog z formularzem -->
<v-dialog v-model="dialog" max-width="600px">
  <v-card>
    <v-card-title>Dodaj wpłatę</v-card-title>
    <v-card-text>
      <PaymentForm
        :rentalId="rentalId"
        @added="onPaymentAddedDialog"
        class="mt-2"
      />
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn variant="text" @click="dialog = false">Anuluj</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted }       from 'vue'
import { storeToRefs }               from 'pinia'
import { usePaymentStore }           from '@/stores/paymentStore'
import PaymentForm                   from '@/components/rental/PaymentForm.vue'

const dialog = ref(false)

function onPaymentAddedDialog() {
  paymentStore.fetchAll()
  emit('added')
  dialog.value = false // zamknięcie po dodaniu
}

const props = defineProps({
  rentalId: { type: [String, Number], required: true }
})
const emit = defineEmits(['added'])

const paymentStore = usePaymentStore()
const { list: allPayments, error } = storeToRefs(paymentStore)

// Filtrujemy globalną listę wpłat pod kątem aktualnego wynajmu
const payments = computed(() =>
  allPayments.value.filter(p => p.rental_id === props.rentalId)
)

onMounted(() => {
  // Pobieramy wszystkie wpłaty raz na starcie
  paymentStore.fetchAll()
})

async function remove(id) {
  if (!confirm('Usuń tę wpłatę?')) return
  await paymentStore.deletePayment(id)
  // Odświeżamy całą listę, żeby usunięcie wpłynęło globalnie
  await paymentStore.fetchAll()
}

function onPaymentAdded() {
  // Po dodaniu wpłaty pobieramy wszystkie ponownie
  paymentStore.fetchAll()
  emit('added')
}

function formatDateOnly(dateStr) {
  const [y, m, d] = dateStr.split('-')
  const months = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ]
  const monthName = months[Number(m) - 1]
  return `${Number(d)} ${monthName} ${Number(y)}`
}




</script>

<style scoped>
.paymentDivider{
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
}
</style>
