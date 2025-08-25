<template>
  <v-card outlined>
    <v-card-title>Archiwalne imprezy</v-card-title>
    <v-card-title>
    <v-spacer></v-spacer>
    <v-text-field
      v-model="search"
      label="Szukaj"
      prepend-inner-icon="mdi-magnify"
      density="compact"
      hide-details
      clearable
      style="max-width: 250px"
    />
    </v-card-title>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="loading"
        item-key="id"
        :items-per-page="10"
        density="compact"
      >
        <template #item.event_date="{ item }">
          {{ formatDate(item.event_date) }}
        </template>

        <template #item.total_amount="{ item }">
          {{ formatPLN(item.total_amount) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-delete" size="small" color="red" class="ml-2" @click="removeItem(item)" />
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <v-dialog v-model="editOpen" max-width="640">
    <v-card>
      <v-card-title>Edytuj imprezę</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveEdit">
          <v-text-field v-model="editForm.event_date" type="date" label="Data" required />
          <v-text-field v-model="editForm.event_time" type="time" label="Godzina" required />
          <v-text-field v-model="editForm.title" label="Nazwa wydarzenia" required />
          <v-text-field v-model="editForm.contact_name" label="Imię i nazwisko" required />
          <v-text-field v-model="editForm.people_count" type="number" min="1" label="Liczba osób" required />
          <v-text-field v-model="editForm.phone" label="Telefon" required />
          <v-text-field v-model="editForm.email" label="Email (opcjonalnie)" />
          <v-text-field v-model="editForm.deposit" type="number" min="0" step="0.01" label="Zaliczka" />
          <v-select v-model="editForm.payment_method" :items="paymentOptions" label="Płatność" clearable />
          <v-textarea v-model="editForm.special_requests" rows="2" auto-grow label="Specjalne życzenia" />
          <v-textarea v-model="editForm.kitchen_notes" rows="2" auto-grow label="Uwagi dla kuchni" />
          <div class="d-flex gap-2 mt-3">
            <v-btn color="primary" type="submit" :loading="savingEdit">Zapisz</v-btn>
            <v-btn variant="text" @click="editOpen = false">Anuluj</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRestaurantEventsStore } from '@/stores/restaurantEventsStore'

const store = useRestaurantEventsStore()
const items = computed(() => store.past)
const loading = computed(() => store.loading)
const paymentOptions = ['gotówka', 'karta', 'przelew']

const headers = [
  { title: 'Data', key: 'event_date' },
  { title: 'Nazwa wydarzenia', key: 'title' },
  { title: 'Imię i nazwisko', key: 'contact_name' },
  { title: 'Liczba osób', key: 'people_count', align: 'end' },
  { title: 'Telefon', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Zapłacono', key: 'total_amount', align: 'end' }, // <--- kwota do zapłaty
  { title: 'Forma płatności', key: 'payment_method' },
  { title: 'Usuń', key: 'actions', align: 'end', sortable: false }
]


function formatPLN(v) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(v || 0))
}
function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('pl-PL')
}

onMounted(() => store.fetchPast())

// Edycja
const editOpen = ref(false)
const editForm = ref({})
const savingEdit = ref(false)

function openEdit(item) {
  editForm.value = {
    id: item.id,
    event_date: item.event_date,
    event_time: (item.event_time || '').slice(0,5),
    title: item.title,
    contact_name: item.contact_name,
    people_count: item.people_count,
    phone: item.phone,
    email: item.email || '',
    deposit: item.deposit || 0,
    payment_method: item.payment_method || '',
    special_requests: item.special_requests || '',
    kitchen_notes: item.kitchen_notes || ''
  }
  editOpen.value = true
}

async function saveEdit() {
  try {
    savingEdit.value = true
    const { id, ...updates } = editForm.value
    await store.update(id, updates)
    editOpen.value = false
  } finally {
    savingEdit.value = false
  }
}

async function removeItem(item) {
  await store.remove(item.id)
}

const search = ref('')

const filteredItems = computed(() => {
  if (!search.value) return items.value
  const term = search.value.toLowerCase()
  return items.value.filter(ev =>
    String(ev.title || '').toLowerCase().includes(term) ||
    String(ev.contact_name || '').toLowerCase().includes(term) ||
    String(ev.phone || '').toLowerCase().includes(term) ||
    String(ev.email || '').toLowerCase().includes(term)
  )
})

</script>
