<template>
  <v-card outlined>


    <v-card-text>
      <!-- Filtr po miesiącu -->
<v-sheet
  class="pa-3 mb-4 d-flex align-center justify-center"
  color="blue-lighten-4"
  rounded
  elevation="1"
>
  <v-btn  @click="prevMonth" :disabled="loading">
    <v-icon size="32">mdi-chevron-left</v-icon>
  </v-btn>

  <span class="month-display mx-4">
    {{ monthLabel }}
  </span>

  <v-btn  @click="nextMonth" :disabled="loading">
    <v-icon size="32">mdi-chevron-right</v-icon>
  </v-btn>
</v-sheet>

<v-card-title class="d-flex align-center ">
      <v-btn size="large" color="primary" @click="openDialog()">
        <v-icon start>mdi-cash-plus</v-icon>
        Dodaj zaliczkę
      </v-btn>
      </v-card-title>
      <!-- Lista zaliczek -->
<v-row>
  <v-col
    v-for="group in groupedAdvances"
    :key="group.employee_id"
    cols="12"
    md="6"
    lg="4"
  >
    <v-card class="mb-3" elevation="2">
      <!-- Nagłówek -->
      <v-card-title
        class="d-flex justify-space-between align-center"
        style="background:#f5f5f5"
      >
        <strong>{{ employeeName(group.employee_id) }}</strong>
        <span class="text-h6 text-success">
          {{ formatCurrency(totalAmount(group.entries)) }}
        </span>
      </v-card-title>

      <!-- Podsumowanie -->
      <v-card-subtitle class="py-2">
        <v-icon color="blue" class="mr-1">mdi-file-document-multiple</v-icon>
        Liczba zaliczek: {{ group.entries.length }}
      </v-card-subtitle>

      <!-- Akcja -->
      <v-card-actions class="py-2">
        <v-btn
          variant="outlined"
          block
          color="primary"
          @click="toggleExpand(group.employee_id)"
        >
          <v-icon start>
            {{ isExpanded(group.employee_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
          Szczegóły
        </v-btn>
      </v-card-actions>

      <!-- Szczegóły -->
      <v-expand-transition>
        <v-card-text
          v-if="isExpanded(group.employee_id)"
          class="pa-0"
          style="background:#fafafa"
        >
          <v-card flat class="pa-4">
            <template v-if="!group.entries.length">
              <div class="text-medium-emphasis">
                Brak zaliczek w tym okresie
              </div>
            </template>
            <template v-else>
              <v-col
                v-for="adv in group.entries"
                :key="adv.id"
                cols="12"
                class="mb-3"
              >
<v-sheet rounded outlined class="pa-3 h-100">
  <div class="text-body-1 mb-1">
    <v-icon size="18" class="me-1 text-blue">mdi-calendar</v-icon>
    <strong>Data:</strong> {{ adv.advance_date }}
  </div>
  <div class="text-body-1 mb-1">
    <v-icon size="18" class="me-1 text-red">mdi-cash-plus</v-icon>
    <strong>Kwota:</strong> {{ formatCurrency(adv.amount) }}
  </div>
  <div
    v-if="adv.note"
    class="text-body-2"
    style="min-height:1.25rem"
  >
    <v-icon size="18" class="me-1 text-grey">mdi-note-text-outline</v-icon>
    <strong>Notatki:</strong> {{ adv.note }}
  </div>
<div class="mt-2 d-flex justify-end ga-2">
  <v-btn
    variant="outlined"
    color="primary"
    @click="openDialog(adv)"
  >
    <v-icon size="18" class="me-1 text-primary">mdi-pencil</v-icon>
    <span><strong>Edytuj</strong></span>
  </v-btn>

  <v-btn
    variant="outlined"
    color="error"
    class="delete-btn"
    @click="remove(adv.id)"
  >
    <v-icon size="18" class="me-1 text-red">mdi-delete</v-icon>
    <span><strong>Usuń</strong></span>
  </v-btn>
</div>

</v-sheet>

<!-- separator między zaliczkami -->
<v-divider class="my-4" style="border-style: dashed; opacity: 0.5;"></v-divider>


              </v-col>
               
            </template>
          </v-card>
        </v-card-text>
      </v-expand-transition>
    </v-card>
  </v-col>
</v-row>

    </v-card-text>
  </v-card>

  <!-- Dialog dodawania/edycji -->
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title>{{ editId ? 'Edytuj zaliczkę' : 'Dodaj zaliczkę' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="formValid" lazy-validation @submit.prevent="save" autocomplete="off">
          <v-row>
            <v-col cols="12" md="6">
<v-autocomplete
  v-model="form.employee_id"
  :items="activeEmployees"
  item-value="id"
  :item-title="item => `${item.first_name} ${item.last_name}`"
  label="Pracownik"
  :rules="[v => !!v || 'Wybierz pracownika']"
  clearable
  hide-details="auto"
  variant="outlined"
  density="comfortable"
  :filter="(item, queryText) => {
    const text = `${item.first_name} ${item.last_name}`.toLowerCase()
    return text.includes(queryText.toLowerCase())
  }"
/>

            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.advance_date"
                type="date"
                label="Data"
                :rules="[v => !!v || 'Podaj datę']"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.amount"
                type="number"
                step="0.01"
                label="Kwota"
                :rules="[v => v > 0 || 'Podaj kwotę większą od 0']"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.note"
                label="Notatka"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end ga-2 mt-4">
            <v-btn variant="text" @click="dialog = false">Anuluj</v-btn>
            <v-btn type="submit" color="primary" :loading="loadingSave">Zapisz</v-btn>
          </div>
        </v-form>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeesStore } from '@/stores/employeesStore'
import { useAdvancesStore } from '@/stores/advancesStore'

const employees = useEmployeesStore()
const advances = useAdvancesStore()

// 🔹 Formatowanie daty bez użycia UTC
function localYMD(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const month = ref(new Date().toISOString().slice(0, 7))

const range = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return {
    start: localYMD(y, m, 1),
    end: localYMD(y, m, new Date(y, m, 0).getDate())
  }
})

const headers = [
  { title: 'Data', key: 'advance_date' },
  { title: 'Pracownik', key: 'employee' },
  { title: 'Kwota', key: 'amount', align: 'end' },
  { title: 'Notatka', key: 'note' },
  { title: 'Akcje', key: 'actions', sortable: false, align: 'end' }
]

const dialog = ref(false)
const loadingSave = ref(false)
const editId = ref(null)

const form = ref({ employee_id: null, advance_date: '', amount: null, note: '' })

async function reload() {
  await advances.fetchForRange(range.value.start, range.value.end)
}

function openDialog(item = null) {
  if (item) {
    editId.value = item.id
    form.value = {
      employee_id: item.employee_id,
      advance_date: item.advance_date,
      amount: item.amount,
      note: item.note || ''
    }
  } else {
    editId.value = null
    form.value = { employee_id: null, advance_date: '', amount: null, note: '' }
  }
  dialog.value = true
}

const formRef = ref(null)
const formValid = ref(false)

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loadingSave.value = true
  if (editId.value) {
    await advances.update(editId.value, { ...form.value })
  } else {
    await advances.add({ ...form.value })
  }
  loadingSave.value = false
  dialog.value = false
  await reload()
}

async function remove(id) {
  if (!confirm('Usunąć tę zaliczkę?')) return
  await advances.remove(id)
  await reload()
}

onMounted(async () => {
  await employees.fetchAll()
  await reload()
})

const loading = ref(false) // jeśli chcesz blokować przyciski przy ładowaniu

const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})

function shiftMonth(delta) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, (m - 1) + delta, 1)
  const y2 = d.getFullYear()
  const m2 = String(d.getMonth() + 1).padStart(2, '0')
  month.value = `${y2}-${m2}`
  reload()
}

function prevMonth() { shiftMonth(-1) }
function nextMonth() { shiftMonth(1) }

// Dane posortowane wg pracowników
const groupedAdvances = computed(() => {
  const map = new Map()
  for (const adv of advances.list) {
    if (!map.has(adv.employee_id)) {
      map.set(adv.employee_id, [])
    }
    map.get(adv.employee_id).push(adv)
  }
  return Array.from(map, ([employee_id, entries]) => ({ employee_id, entries }))
})

function employeeName(id) {
  const e = employees.list.find(e => e.id === id)
  return e ? `${e.first_name} ${e.last_name}` : '—'
}

function totalAmount(entries) {
  return entries.reduce((sum, e) => sum + Number(e.amount || 0), 0)
}

function formatCurrency(v) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(Number(v || 0))
}

// expand helpery
const expandedId = ref(null)
function isExpanded(id) { return expandedId.value === id }
function toggleExpand(id) { expandedId.value = isExpanded(id) ? null : id }

const activeEmployees = computed(() =>
  employees.list.filter(e => e.active)
)

</script>
<style scoped>
.month-display {
  font-size: 1.4rem;
  font-weight: 600;
  text-transform: capitalize;
  min-width: 180px;
  text-align: center;
}
.delete-btn {
  transition: background-color 0.2s ease, color 0.2s ease;
}

.delete-btn:hover {
  background-color: #ffebee; /* delikatne czerwone tło */
  color: #b71c1c;            /* ciemniejszy czerwony tekst */
}


</style>