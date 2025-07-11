<!-- src/components/rental/PaymentForm.vue -->
<template>
  <form @submit.prevent="onSubmit" class="payment-form">
    <label>
      Kwota
      <input v-model.number="amount" type="number" step="0.01" min="0.01" required/>
    </label>

    <label>
      Data płatności
      <input v-model="paidAt" type="datetime-local" required/>
    </label>

    <label>
      Metoda
      <select v-model="method">
        <option value="">– wybierz –</option>
        <option value="gotówka">gotówka</option>
        <option value="przelew">przelew</option>
        <option value="karta">karta</option>
      </select>
    </label>

    <label>
      Notatki
      <textarea v-model="notes" rows="2"></textarea>
    </label>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Dodaj…' : 'Dodaj wpłatę' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePaymentStore } from '@/stores/paymentStore'

const props = defineProps({
  rentalId: { type: String, required: true }
})
const emit = defineEmits(['added'])

const paymentStore = usePaymentStore()
const { loading, error } = storeToRefs(paymentStore)

const amount  = ref(0)
const paidAt  = ref(new Date().toISOString().slice(0,16))
const method  = ref('')
const notes   = ref('')

async function onSubmit() {
  loading.value = true
  const payload = {
    rental_id:     props.rentalId,
    amount:        amount.value,
    payment_method: method.value || null,
    notes:         notes.value || null,
    paid_at:       new Date(paidAt.value).toISOString(),
  }

  const added = await paymentStore.addPayment(payload)
  loading.value = false
  if (added) {
    amount.value = 0
    method.value = ''
    notes.value  = ''
    paidAt.value = new Date().toISOString().slice(0,16)
    emit('added', added)
  }
}
</script>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label { display: flex; flex-direction: column;}
button { padding: 0.4rem; margin-top: 0.5rem; }
.error { color: red; }
</style>
