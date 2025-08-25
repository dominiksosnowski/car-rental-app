<!-- src/components/rental/PaymentList.vue -->
<template>
  <v-card flat class="payment-list pa-4">
    <!-- Tytuł historii -->
    <v-card-title class="text-h6">Historia wpłat</v-card-title>

    <v-list dense>
      <!-- gdy brak wpłat -->
      <v-list-item v-if="!payments.length">
        <v-list-item-content>
          <v-list-item-title>— Brak wpłat —</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <!-- lista wpłat -->
      <v-list-item
        v-for="p in payments"
        :key="p.id"
        class="payment-item"
      >
        <v-list-item-content class="d-flex justify-space-between align-center">
          <span>
            {{ formatDateTime(p.paid_at) }} – {{ p.amount.toFixed(2) }} zł
            <small v-if="p.payment_method">
              ({{ p.payment_method }})
            </small>
            <small v-if="p.payment_method">
             Notatki: ({{ p.notes }})
            </small>
          </span>

          <!-- przycisk usuwania inline -->
          <v-btn icon small color="error" @click="remove(p.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider class="my-4"/>

    <!-- Tytuł formularza -->
    <v-card-subtitle class="text-h6">Dodaj wpłatę</v-card-subtitle>
    <PaymentForm
      :rentalId="rentalId"
      @added="onPaymentAdded"
      class="mt-2"
    />
  </v-card>
</template>

<script setup>
import { computed, onMounted }       from 'vue'
import { storeToRefs }               from 'pinia'
import { usePaymentStore }           from '@/stores/paymentStore'
import PaymentForm                   from '@/components/rental/PaymentForm.vue'

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

function formatDateTime(d) {
  return d
    ? new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(d))
    : '–'
}
</script>

<style scoped>
.payment-item {
  /* Każdy item to flex-box z justify-space-between */
}
</style>
