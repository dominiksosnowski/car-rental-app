<!-- src/components/rental/PaymentList.vue -->
<template>
  <div class="payment-list">
    <h4>Wpłaty</h4>
    <ul>
      <li v-for="p in payments" :key="p.id" class="payment-item">
        <span>
          {{ new Date(p.paid_at).toLocaleString() }}:
          {{ p.amount.toFixed(2) }} zł
          <small v-if="p.payment_method">({{ p.payment_method }})</small>
        </span>
        <button @click="remove(p.id)">Usuń</button>
      </li>
    </ul>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePaymentStore } from '@/stores/paymentStore'

const props = defineProps({
  rentalId: { type: String, required: true }
})

const paymentStore = usePaymentStore()
const { list: payments, error } = storeToRefs(paymentStore)

onMounted(() => paymentStore.fetchByRental(props.rentalId))

async function remove(id) {
  if (!confirm('Usuń tę wpłatę?')) return
  await paymentStore.deletePayment(id)
}
</script>

<style scoped>
.payment-list {
  margin-top: 0.5rem;
}
.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}
button { font-size: 0.8rem; }
.error { color: red; }
</style>
