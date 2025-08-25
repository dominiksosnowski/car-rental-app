<!-- src/components/InvoiceForm.vue -->
<template>
  <v-card>
    <v-card-title>Dodaj fakturę zakupową</v-card-title>
    <v-card-text>
      <v-form ref="formRef" v-model="isValid" @submit.prevent="onSubmit">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.invoice_date"
              label="Data faktury"
              type="date"
              :max="today"
              required
              prepend-inner-icon="mdi-calendar"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="form.supplier"
              :items="suppliers"
              label="Hurtownia"
              required
              prepend-inner-icon="mdi-store"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="form.amount"
              label="Kwota"
              type="number"
              step="0.01"
              min="0"
              prefix="zł"
              required
              prepend-inner-icon="mdi-cash-multiple"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.note"
              label="Notatka (opcjonalnie)"
              rows="2"
              auto-grow
              prepend-inner-icon="mdi-note-text"
            />
          </v-col>

          <v-col cols="12" class="d-flex gap-2">
            <v-btn :loading="loading" color="primary" type="submit" prepend-icon="mdi-content-save">
              Zapisz
            </v-btn>
            <v-btn :disabled="loading" variant="text" @click="resetForm" prepend-icon="mdi-broom">
              Wyczyść
            </v-btn>
          </v-col>

          <v-col cols="12" v-if="errorMsg">
            <v-alert type="error" :text="errorMsg" />
          </v-col>
          <v-col cols="12" v-if="successMsg">
            <v-alert type="success" :text="successMsg" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase }    from '@/lib/supabase'

const props = defineProps<{
  suppliers: string[]
}>()

const emit = defineEmits<{
  (e: 'submitted', payload: any): void
}>()

const today = computed(() => new Date().toISOString().slice(0, 10))

const formRef = ref()
const isValid = ref(false)
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const form = ref({
  invoice_date: today.value,
  supplier: '',
  amount: null as number | null,
  note: '' as string
})

function resetForm() {
  form.value = {
    invoice_date: today.value,
    supplier: '',
    amount: null,
    note: ''
  }
  errorMsg.value = null
  successMsg.value = null
}

function validate(): string | null {
  if (!form.value.invoice_date) return 'Wymagana jest data faktury.'
  if (!form.value.supplier) return 'Wymagana jest hurtownia.'
  if (form.value.amount == null || Number.isNaN(form.value.amount)) return 'Wymagana jest kwota.'
  return null
}

async function onSubmit() {
  errorMsg.value = null
  successMsg.value = null

  const v = validate()
  if (v) {
    errorMsg.value = v
    return
  }

  try {
    loading.value = true
    const payload = {
      invoice_date: form.value.invoice_date,
      supplier: form.value.supplier,
      amount: Number(form.value.amount),
      note: form.value.note || null
    }

    const { data, error } = await supabase
      .from('workshop_invoices')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error

    successMsg.value = 'Zapisano fakturę.'
    emit('submitted', data)
    resetForm()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Nie udało się zapisać.'
  } finally {
    loading.value = false
  }
}
</script>
