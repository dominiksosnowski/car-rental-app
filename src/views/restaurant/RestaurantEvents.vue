<template>
  <v-row class="mb-6">
    <v-col cols="12" md="12">
      <v-calendar
        :model-value="currentDate"
        is-expanded
        :first-day-of-week="2"
        :show-header="false"
        class="rc-calendar"
       
      >
      <template #day-content="{ day }">
        <div
          class="rc-day"
          :class="{ 'is-outside': !day.inMonth, 'is-today': isToday(day.date) }"
          @click="handleDayClick({ date: day.date })"
          
        >
          <div class="rc-day-number">{{ day.day }}</div>
          <div v-if="eventsForDay(day.date).length" class="rc-events">
            <div v-for="ev in eventsForDay(day.date)" :key="ev.id" class="rc-event">
              {{ ev.title }}: {{ ev.people_count }} osób
            </div>
          </div>
          <div v-else class="rc-empty"><span>—</span></div>
        </div>
      </template>
    </v-calendar>

    </v-col>
  </v-row>
  <v-row dense align="center" justify="space-between" class="mb-4">
    <v-col cols="12" md="3">
      <h2 class="text-h5">Imprezy: {{ items.length }}</h2>
    </v-col>
    <v-col cols="12" md="6" align="center">
      <v-text-field
      v-model="search"
      label="Szukaj..."
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-4"
    />
    </v-col>
    <v-col cols="12" md="3" align="end">
    <v-btn color="primary" class="mb-4" @click="addOpen = true">
    Dodaj imprezę
    </v-btn>
    </v-col>
    <!-- Formularz -->
    <!-- Dialog dodawania -->
<v-dialog v-model="addOpen" max-width="640">
  <v-card>
    <v-card-title>Dodaj imprezę</v-card-title>
    <v-card-text>
      <v-form ref="addFormRef" v-model="addFormValid" @submit.prevent="submit" autocomplete="off">
        <v-text-field v-model="form.event_date" type="date" label="Data" prepend-inner-icon="mdi-calendar" :rules="[required]" required />
        <v-text-field v-model="form.event_time" type="time" label="Godzina" prepend-inner-icon="mdi-clock-outline" :rules="[required]" required />
        <v-text-field v-model="form.title" label="Nazwa wydarzenia" :rules="[required]" required />
        <v-text-field v-model="form.contact_name" label="Imię i nazwisko" :rules="[required]" required />
        <v-text-field v-model="form.people_count" type="number" min="1" label="Liczba osób" :rules="[required]" required />
        <v-text-field v-model="form.phone" label="Telefon" :rules="[required]" required />

        <v-text-field v-model="form.email" label="Email (opcjonalnie)" />
        <v-text-field v-model="form.deposit" type="number" min="0" step="0.01" label="Zaliczka" />
        <v-text-field
          v-model="form.rate_per_person"
          type="number" min="0" step="0.01"
          label="Stawka za osobę"
          prepend-inner-icon="mdi-cash"
          @input="form.total_amount = (Number(form.people_count||0) * Number(form.rate_per_person||0)).toFixed(2)"
        />
        <v-text-field
          :model-value="(Number(form.people_count||0) * Number(form.rate_per_person||0)).toFixed(2)"
          label="Kwota do zapłaty"
          prepend-inner-icon="mdi-cash-multiple"
          readonly
        />
        <v-select v-model="form.payment_method" :items="paymentOptions" label="Płatność" clearable />
        <v-textarea v-model="form.special_requests" rows="2" auto-grow label="Specjalne życzenia (opcjonalnie)" />
        <v-textarea v-model="form.kitchen_notes" rows="2" auto-grow label="Uwagi dla kuchni (opcjonalnie)" />

        <div class="d-flex gap-2 mt-2">
          <v-btn color="primary" type="submit" :loading="saving">Zapisz</v-btn>
          <v-btn variant="text" @click="addOpen = false">Anuluj</v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>

    </v-row>

  <v-row dense>
    <v-col cols="12">
      <v-card outlined>
        <v-card-title>Przyszłe imprezy</v-card-title>
        <v-card-text>
          <!-- Widok desktopowy z rozwijanymi wierszami -->
          <v-data-table
            v-if="!mdAndDown"
            :headers="baseHeaders"
            :items="filteredItems"
            :loading="loading"
            item-key="id"
            :items-per-page="10"
            density="compact"
            v-model:expanded="expanded"
          >
            <template #item.event_date="{ item }">
              {{ formatDate(item.event_date) }}
            </template>
            <template #item.personal="{ item }">
              {{ item.contact_name}}
            </template>

            <template #item.actions="{ item }">
                <v-btn variant="outlined" color="blue"  @click="toggleExpand(item.id)">
                  <v-icon>{{ isExpanded(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
            </template>
            <template #item.edit="{ item }">
              <v-btn icon="mdi-pencil" size="small" @click="openEdit(item)" />
            </template>
            <template #item.archive="{ item }">
              <v-btn icon="mdi-archive" size="small" color="orange" class="ml-1" @click="archive(item)" />
            </template>

            <!-- Szczegóły w rozwijanym wierszu -->
<template #expanded-row="{ columns, item }">
  <tr>
    <td :colspan="columns.length" class="pa-0">
      <v-card flat color="grey-lighten-4" class="pa-4">
        <v-row dense>
          <v-col cols="12" sm="6" md="4">
            <v-icon size="18" class="me-1" color="primary">mdi-clock-outline</v-icon>
            <strong>Godzina:</strong>
            <div class="text-body-2">{{ item.event_time?.slice(0,5) || '—' }}</div>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-icon size="18" class="me-1" color="primary">mdi-phone</v-icon>
            <strong>Telefon:</strong>
            <div class="text-body-2">{{ item.phone || '—' }}</div>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-icon size="18" class="me-1" color="primary">mdi-email</v-icon>
            <strong>Email:</strong>
            <div class="text-body-2">{{ item.email || '—' }}</div>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-icon size="18" class="me-1" color="primary">mdi-cash</v-icon>
            <strong>Zaliczka:</strong>
            <div class="text-body-2">{{ formatPLN(item.deposit) }}</div>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-icon size="18" class="me-1" color="primary">mdi-cash-multiple</v-icon>
            <strong>Do zapłaty łącznie:</strong>
            <div class="text-body-2">{{ formatPLN(item.total_amount) }}</div>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-icon size="18" class="me-1" color="primary">mdi-credit-card-outline</v-icon>
            <strong>Płatność:</strong>
            <div class="text-body-2">{{ item.payment_method || '—' }}</div>
          </v-col>

          <v-col cols="12" v-if="item.special_requests">
            <v-alert type="info" density="comfortable" variant="tonal">
              <v-icon size="18" class="me-1" color="info">mdi-information-outline</v-icon>
              <strong>Życzenia:</strong> {{ item.special_requests }}
            </v-alert>
          </v-col>

          <v-col cols="12" v-if="item.kitchen_notes">
            <v-alert type="warning" density="comfortable" variant="tonal">
              <v-icon size="18" class="me-1" color="warning">mdi-silverware-fork-knife</v-icon>
              <strong>Kuchnia:</strong> {{ item.kitchen_notes }}
            </v-alert>
          </v-col>
        </v-row>
      </v-card>
    </td>
  </tr>
</template>
          </v-data-table>

          <!-- Widok mobilny jako karty -->
          <div v-else>
           <!-- KARTA w widoku mobilnym -->
<v-card v-for="ev in filteredItems" :key="ev.id" class="mb-3">
  <v-card-title class="d-flex justify-space-between">
    <div>
      {{ formatDate(ev.event_date) }} — <strong>{{ ev.title }}</strong>
    </div>
    <div>{{ ev.people_count }} os.</div>
  </v-card-title>

  <v-card-subtitle>{{ ev.contact_name }}</v-card-subtitle>

  <v-card-actions>
    <v-btn variant="outlined" color="blue" @click="toggleExpand(ev.id)">
      <v-icon>{{ isExpanded(ev.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </v-btn>
    <v-btn icon="mdi-pencil" size="small" @click="openEdit(ev)" />
    <v-btn icon="mdi-archive" size="small" color="orange" class="ml-1" @click="archive(ev)" />
  </v-card-actions>

<v-expand-transition>
  <v-card-text v-if="isExpanded(ev.id)" class="pa-0">
    <v-card flat color="grey-lighten-4" class="pa-4">
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-icon size="18" class="me-1" color="primary">mdi-clock-outline</v-icon>
          <strong>Godzina:</strong>
          <div class="text-body-2">{{ ev.event_time?.slice(0,5) || '—' }}</div>
        </v-col>

        <v-col cols="12" sm="6">
          <v-icon size="18" class="me-1" color="primary">mdi-phone</v-icon>
          <strong>Telefon:</strong>
          <div class="text-body-2">{{ ev.phone || '—' }}</div>
        </v-col>

        <v-col cols="12" sm="6">
          <v-icon size="18" class="me-1" color="primary">mdi-email</v-icon>
          <strong>Email:</strong>
          <div class="text-body-2">{{ ev.email || '—' }}</div>
        </v-col>

        <v-col cols="12" sm="6">
          <v-icon size="18" class="me-1" color="primary">mdi-cash</v-icon>
          <strong>Zaliczka:</strong>
          <div class="text-body-2">{{ formatPLN(ev.deposit) }}</div>
        </v-col>

        <v-col cols="12" sm="6">
          <v-icon size="18" class="me-1" color="primary">mdi-cash-multiple</v-icon>
          <strong>Do zapłaty łącznie:</strong>
          <div class="text-body-2">{{ formatPLN(ev.total_amount) }}</div>
        </v-col>

        <v-col cols="12" sm="6">
          <v-icon size="18" class="me-1" color="primary">mdi-credit-card-outline</v-icon>
          <strong>Płatność:</strong>
          <div class="text-body-2">{{ ev.payment_method || '—' }}</div>
        </v-col>

        <v-col cols="12" v-if="ev.special_requests">
          <v-alert type="info" density="comfortable" variant="tonal">
            <v-icon size="18" class="me-1" color="info">mdi-information-outline</v-icon>
            <strong>Życzenia:</strong> {{ ev.special_requests }}
          </v-alert>
        </v-col>

        <v-col cols="12" v-if="ev.kitchen_notes">
          <v-alert type="warning" density="comfortable" variant="tonal">
            <v-icon size="18" class="me-1" color="warning">mdi-silverware-fork-knife</v-icon>
            <strong>Kuchnia:</strong> {{ ev.kitchen_notes }}
          </v-alert>
        </v-col>
      </v-row>
    </v-card>
  </v-card-text>
</v-expand-transition>
</v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Dialog edycji -->
<v-dialog v-model="editOpen" max-width="640">
  <v-card>
    <v-card-title>Edytuj imprezę</v-card-title>
    <v-card-text>
      <v-form ref="editFormRef" v-model="editFormValid" @submit.prevent="saveEdit" autocomplete="off">
        <v-text-field v-model="editForm.event_date" type="date" label="Data" :rules="[required]" required />
        <v-text-field v-model="editForm.event_time" type="time" label="Godzina" :rules="[required]" required />
        <v-text-field v-model="editForm.title" label="Nazwa wydarzenia" :rules="[required]" required />
        <v-text-field v-model="editForm.contact_name" label="Imię i nazwisko" :rules="[required]" required />
        <v-text-field v-model="editForm.people_count" type="number" min="1" label="Liczba osób" :rules="[required]" required />
        <v-text-field v-model="editForm.phone" label="Telefon" :rules="[required]" required />

        <v-text-field v-model="editForm.email" label="Email (opcjonalnie)" />
        <v-text-field v-model="editForm.deposit" type="number" min="0" step="0.01" label="Zaliczka" />
        <v-text-field
          v-model="editForm.rate_per_person"
          type="number" min="0" step="0.01"
          label="Stawka za osobę"
          prepend-inner-icon="mdi-cash"
          @input="editForm.total_amount = (Number(editForm.people_count||0) * Number(editForm.rate_per_person||0)).toFixed(2)"
        />
        <v-text-field
          :model-value="(Number(editForm.people_count||0) * Number(editForm.rate_per_person||0)).toFixed(2)"
          label="Kwota do zapłaty"
          prepend-inner-icon="mdi-cash-multiple"
          readonly
        />
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
import { useDisplay } from 'vuetify' // jeśli chcesz breakpointy Vuetify
import { useRestaurantEventsStore } from '@/stores/restaurantEventsStore'
import RestaurantCalendar from '@/components/restaurant/RestaurantCalendar.vue'

const store = useRestaurantEventsStore()
const items = computed(() => Array.isArray(store.upcoming) ? store.upcoming.filter(Boolean) : [])
const loading = computed(() => store.loading)
const addOpen = ref(false)
const { mdAndDown } = useDisplay() // true jeśli ekran <= md
const showDetails = ref(false)


const paymentOptions = ['gotówka', 'karta', 'przelew']

const baseHeaders = [
  { title: 'Data', key: 'event_date' },
  { title: 'Nazwa wydarzenia', key: 'title' },
  { title: 'Imię i nazwisko', key: 'personal' },
  { title: 'Liczba osób', key: 'people_count', align: 'end' },
  { title: 'Rozwiń szczegóły', key: 'actions', align: 'end', sortable: false },
  { title: 'Edytuj', key: 'edit', align: 'end', sortable: false },
  { title: 'Archiwizuj', key: 'archive', align: 'end', sortable: false }
]

const form = ref({
  event_date: '',
  event_time: '',
  title: '',
  contact_name: '',
  people_count: '',
  phone: '',
  email: '',
  deposit: '',
  rate_per_person: '',
  total_amount: '', // 🆕 kwota do zapłaty
  payment_method: '',
  special_requests: '',
  kitchen_notes: ''
})

const saving = ref(false)

function reset() {
  form.value = {
    event_date: '',
    event_time: '',
    title: '',
    contact_name: '',
    people_count: '',
    phone: '',
    email: '',
    deposit: '',
    rate_per_person: '',
    total_amount: '',
    payment_method: '',
    special_requests: '',
    kitchen_notes: ''
  }
}

const addFormRef = ref(null)
const addFormValid = ref(false)
const editFormRef = ref(null)
const editFormValid = ref(false)
const required = v => !!String(v || '').trim() || 'To pole jest wymagane'

async function submit() {
  const { valid } = await addFormRef.value.validate()
  if (!valid) return
  try {
    saving.value = true
    await store.add(form.value)
    reset()
    addOpen.value = false
  } finally {
    saving.value = false
  }
}


function formatPLN(v) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(v || 0))
}
function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('pl-PL')
}

onMounted(async () => {
  await store.fetchUpcoming()
})


// Edycja
const editOpen = ref(false)
const editForm = ref({})

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
    rate_per_person: item.rate_per_person ?? 0,
    total_amount: item.total_amount || 0,
    payment_method: item.payment_method || '',
    special_requests: item.special_requests || '',
    kitchen_notes: item.kitchen_notes || ''
  }
  editOpen.value = true
}

const savingEdit = ref(false)
async function saveEdit() {
  const { valid } = await editFormRef.value.validate()
  if (!valid) return
  try {
    savingEdit.value = true
    const { id, ...updates } = editForm.value
    await store.update(id, updates)
    editOpen.value = false
  } finally {
    savingEdit.value = false
  }
}

async function archive(item) {
  await store.archive(item.id)
}

const search = ref('')

const filteredItems = computed(() => {
  if (!search.value) return items.value

  const s = search.value.toLowerCase()

  return items.value.filter(ev => {
    return (
      ev.contact_name?.toLowerCase().includes(s) ||
      ev.title?.toLowerCase().includes(s) ||
      ev.event_date?.toLowerCase().includes(s)
    )
  })
})

const expanded = ref([]) // tablica ID rozwiniętych pozycji
function isExpanded(id) {
  return expanded.value.includes(id)
}
function toggleExpand(id) {
  if (isExpanded(id)) {
    expanded.value = expanded.value.filter(x => x !== id)
  } else {
    expanded.value = [...expanded.value, id]
  }
}

const calendarAttributes = computed(() => {
  return items.value.map((ev, idx) => ({
    key: `ev-${ev.id ?? idx}`,
    dates: ev.event_date,
    dot: { color: 'blue' },
    popover: {
      label: ev.title,
      visibility: 'hover'
    }
  }))
})

function handleDayClick(day) {
  const d = day.date
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  form.value.event_date = `${yyyy}-${mm}-${dd}`
  if (!form.value.event_time) form.value.event_time = '18:00'
  addOpen.value = true
}


const eventsForDay = (date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const dateStr = `${yyyy}-${mm}-${dd}`
  return items.value.filter(ev => ev.event_date === dateStr)
}

const props = defineProps({
  locale: { type: String, default: 'pl-PL' },
  initialDate: { type: [Date, String], default: () => new Date() },
})

const currentDate = ref(resolveDate(props.initialDate) ?? new Date())

function isToday(d) {
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function openAddEvent(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  form.value = { title: '', people_count: 0, date: `${yyyy}-${mm}-${dd}` }
  showDialog.value = true
}

function resolveDate(d) {
  if (!d) return undefined
  if (d instanceof Date) return d
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? undefined : parsed
}



</script>
<style scoped>
.rental-calendar {
  display: grid;
  gap: 12px;
  width: 100%; /* szerokość na całą stronę */
}

:deep(.vc-container) {
  width: 100% !important;
  padding: 20px;
}

.rc-day {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  min-height: 90px;
}

.rc-day.is-outside {
  opacity: 0.5;
}

.rc-day:hover {
  background-color: rgba(0, 128, 255, 0.3); /* delikatne podświetlenie */
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}


.rc-day.is-today {
  outline: 2px solid #2563eb88;
  background: rgba(25, 118, 210, 0.15);
}

.rc-day-number {
  justify-self: end;
  font-size: 12px;
  color: #667085;
}

.rc-events {
  font-size: 12px;
  line-height: 1.3;
  color: #111827;
}

.rc-event {
  font-weight: 500;
}

.rc-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #c2c7d0;
}


</style>