<!-- src/components/rental/PaymentForm.vue -->
<template>
  <!-- ograniczamy szerokość formularza do 50% i centrujemy -->
  <div class="payment-form-wrapper">
    <v-form @submit.prevent="onSubmit" ref="form">
      <v-row dense align="center">
        <!-- Kwota -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model.number="amount"
            label="Kwota"
            type="number"
            step="0.01"
            min="0.01"
            required
          />
        </v-col>

        <!-- Data wpłaty – tylko data -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="date"
            label="Data wpłaty"
            type="date"
            required
            prepend-inner-icon="mdi-calendar"
          />
        </v-col>


        <!-- Metoda płatności -->
        <v-col cols="12" md="4">
          <v-select
            v-model="method"
            :items="methods"
            label="Metoda"
            clearable
            required
          />
        </v-col>

        <!-- Notatki -->
        <v-col cols="12">
          <v-textarea
            v-model="notes"
            label="Notatki"
            rows="2"
          />
        </v-col>
      </v-row>

      <!-- Przycisk -->
      <v-row>
        <v-col cols="12" class="text-right">
          <v-btn :loading="loading" color="primary" type="submit">
            {{ loading ? 'Dodaj…' : 'Dodaj wpłatę' }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Błąd -->
      <v-alert
        v-if="error"
        type="error"
        variant="outlined"
        class="mt-2"
      >
        {{ error }}
      </v-alert>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed }    from 'vue'
import { storeToRefs }      from 'pinia'
import { usePaymentStore }  from '@/stores/paymentStore'

const props = defineProps({
  rentalId: { type: [String, Number], required: true }
})
const emit = defineEmits(['added'])

const paymentStore = usePaymentStore()
const { loading, error } = storeToRefs(paymentStore)

const amount   = ref(0)
const date     = ref(new Date().toISOString().substr(0,10))
const menuDate = ref(false)

const method = ref(null)
const notes  = ref('')

const methods = ['gotówka','przelew','karta']

const minDate = new Date().toISOString().substr(0,10)

// gotowy ISO + północ lokalna
const paidAt = computed(() =>
  date.value
    ? new Date(`${date.value}T00:00`).toISOString()
    : ''
)

// format do pola tekstowego
const displayDate = computed(() =>
  date.value
    ? new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      }).format(new Date(date.value))
    : ''
)

async function onSubmit() {
  loading.value = true

  const payload = {
    rental_id:      props.rentalId,
    amount:         amount.value,
    payment_method: method.value,
    notes:          notes.value || null,
    paid_at:        paidAt.value
  }

  const added = await paymentStore.addPayment(payload)
  loading.value = false

  if (added) {
    amount.value = 0
    method.value = null
    notes.value  = ''
    date.value   = new Date().toISOString().substr(0,10)
    emit('added', added)
  }
}
</script>

<style scoped>
.payment-form-wrapper {

  margin: 0 auto;
}
</style>
