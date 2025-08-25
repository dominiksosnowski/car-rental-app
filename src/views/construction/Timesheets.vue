<template>
  <v-card outlined>
    <v-card-title class="d-flex align-center justify-center">
      Karty pracy
    </v-card-title>


    <v-card-text>
      <!-- Filtry -->
      <v-row class="mb-4" justify="center" align="center">
        <v-col cols="12" class="d-flex align-center justify-center">
                <v-btn icon @click="prevMonth" :disabled="loading">
                  <v-icon size="32">mdi-chevron-left</v-icon>
                </v-btn>

                <span class="month-display mx-4">
                  {{ monthLabel }}
                </span>

                <v-btn icon @click="nextMonth" :disabled="loading">
                  <v-icon size="32">mdi-chevron-right</v-icon>
                </v-btn>
        </v-col>
      </v-row>

     <v-card-title class="d-flex align-center justify-end">
            <v-btn
        color="primary"
        :block="$vuetify.display.smAndDown"
        size="large"
        @click="openDialog"
      >
    <v-icon start>mdi-calendar-plus</v-icon>
        Dodaj wpis
      </v-btn>
    </v-card-title>

<v-row>
  <v-col
    v-for="group in groupedByEmployee"
    :key="group.employee_id"
    cols="12"
    md="6"
    lg="4"
  >
    <v-card outlined class="mb-3">
      <!-- Nagłówek karty -->
      <v-card-title class="d-flex justify-space-between align-center" style="background:#f5f5f5">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-account</v-icon>
          <strong>
            {{ employees.list.find(e => e.id === group.employee_id)?.first_name }}
            {{ employees.list.find(e => e.id === group.employee_id)?.last_name }}
          </strong>
        </div>
      </v-card-title>

      <!-- Podsumowanie -->
      <v-card-subtitle class="py-2 d-flex align-center">
        <v-icon color="blue" class="mr-1">mdi-file-document-multiple</v-icon>
        <span><strong>Karty pracy:</strong> {{ group.entries.length }} </span>
      </v-card-subtitle>
      <v-card-subtitle class="py-2 d-flex align-center">
        <v-icon color="green" class="mr-1">mdi-clock-outline</v-icon>
        <span><strong>Łącznie:</strong> {{ group.entries.reduce((s,e) => s + Number(e.hours), 0).toFixed(2) }} godzin</span>
      </v-card-subtitle>
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
  <v-card-text v-if="isExpanded(group.employee_id)" class="pa-0" style="background:#fafafa">
    <div
      v-for="(entry, idx) in group.entries"
      :key="entry.id"
      class="pa-3"
    >
      <div class="mb-1 d-flex align-center">
        <v-icon small color="deep-purple" class="mr-1">mdi-calendar</v-icon>
        <span><strong>Data wpisu: </strong>{{ formatDate(entry.work_date) }}</span>
        
      </div>
      <div class="mb-1 d-flex align-center">
        <v-icon small color="teal" class="mr-1">mdi-briefcase</v-icon>
       <span><strong>Miejsce: </strong> {{ projectNameMap[entry.project_id] ?? '—' }}</span>
      </div>
      <div class="mb-1 d-flex align-center">
        <v-icon small color="orange" class="mr-1">mdi-clock</v-icon>
        <span><strong>Godzin: </strong> {{ Number(entry.hours).toFixed(2) }} </span>  
      </div>
      <div class="d-flex align-center">
        <v-icon small color="blue-grey" class="mr-1">mdi-currency-usd</v-icon>
        <span v-if="projectEmployeeRateMap[entry.project_id] != null">
         <strong>Stawka: </strong>  {{ formatCurrency(projectEmployeeRateMap[entry.project_id], projectCurrencyMap[entry.project_id] || 'PLN') }}
        </span>
      </div>
        <div class="d-flex justify-end mt-2">
          <v-btn
            color="error"
            variant="tonal"
            size="small"
            @click="remove(entry.id)"
          >
            <v-icon start>mdi-delete</v-icon>
            Usuń wpis
          </v-btn>
        </div>
      <!-- Separator -->
      <v-divider v-if="idx < group.entries.length - 1" class="my-3"></v-divider>
    </div>
  </v-card-text>
</v-expand-transition>

    </v-card>
  </v-col>
</v-row>


    </v-card-text>
  </v-card>

  <!-- Dialog dodawania wpisu (bez pola stawki) -->
<!-- Dialog dodawania wpisu -->
<v-dialog v-model="dialog" max-width="720px">
  <v-card>
    <v-card-title>
      {{ editingId ? 'Edytuj wpis czasu pracy' : 'Dodaj wpis czasu pracy' }}
    </v-card-title>

    <v-card-text>
      <v-form ref="formRef" v-model="formValid" @submit.prevent="save">
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              :items="employees.list"
              item-value="id"
              :item-props="i => ({ title: `${i.first_name} ${i.last_name}` })"
              v-model="form.employee_id"
              label="Pracownik"
              :rules="[v => !!v || 'Wybierz pracownika']"
              clearable
              required
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.work_date"
              type="date"
              label="Data"
              :rules="[v => !!v || 'Podaj datę']"
              required
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model.number="form.hours"
              type="number"
              step="0.25"
              min="0.25"
              label="Godziny"
              :rules="[
                v => !!v || 'Podaj liczbę godzin',
                v => v > 0 || 'Godziny muszą być większe od 0'
              ]"
              required
            />
          </v-col>

          <v-col cols="12">
            <v-autocomplete
              :items="projects"
              item-title="name"
              item-value="id"
              v-model="form.project_id"
              label="Miejsce pracy"
              :rules="[v => !!v || 'Wybierz projekt']"
              clearable
              required
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="form.note"
              label="Notatka"
              :counter="200"
            />
          </v-col>
        </v-row>

        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="text" @click="dialog = false">Anuluj</v-btn>
          <v-btn color="primary" type="submit" :loading="saving">Zapisz</v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>


</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeesStore } from '@/stores/employeesStore'
import { useTimesheetsStore } from '@/stores/timesheetsStore' // używa tabeli 'time_entries'
import { supabase } from '@/lib/supabase'

const employees = useEmployeesStore()
const timesheets = useTimesheetsStore()
const editingId = ref(null)

const projects = ref([])

// Mapy pomocnicze do nazwy, stawki pracowniczej i waluty
const projectNameMap = computed(() =>
  Object.fromEntries((projects.value || []).map(p => [p.id, p.name]))
)
const projectEmployeeRateMap = computed(() =>
  Object.fromEntries((projects.value || []).map(p => [p.id, p.employee_rate != null ? Number(p.employee_rate) : null]))
)
const projectCurrencyMap = computed(() =>
  Object.fromEntries((projects.value || []).map(p => [p.id, p.currency || 'PLN']))
)

const dialog = ref(false)
const saving = ref(false)

const month = ref(new Date().toISOString().slice(0, 7))
function toLocalISO(date) {
  return date.toLocaleDateString('sv-SE') // yyyy-mm-dd
}

const range = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return {
    start: toLocalISO(new Date(y, m - 1, 1)),
    end:   toLocalISO(new Date(y, m, 0))
  }
})


const headers = [
  { title: 'Data', key: 'work_date' },
  { title: 'Pracownik', key: 'employee' },
  { title: 'Godziny', key: 'hours', align: 'end' },
  { title: 'Stawka', key: 'rate', align: 'end' }, // wyliczana z projektu
  { title: 'Miejsce', key: 'project' },
  { title: 'Notatka', key: 'note' },
  { title: 'Akcje', key: 'actions', sortable: false, align: 'end' }
]

// Formularz BEZ stawki
const form = ref({
  employee_id: null,
  work_date: '',
  hours: null,
  project_id: null,
  note: ''
})

function edit(item) {
  form.value = {
    employee_id: item.employee_id,
    work_date: item.work_date, // już w formacie yyyy-mm-dd
    hours: item.hours,
    project_id: item.project_id,
    note: item.note || ''
  }
  editingId.value = item.id
  dialog.value = true
}

const formRef = ref(null)
const formValid = ref(false)

function openDialog() {
  form.value = {
    employee_id: null,
    work_date: '',
    hours: null,
    project_id: null,
    note: ''
  }
  dialog.value = true
}

async function reload() {
  await timesheets.fetchForRange(range.value.start, range.value.end)
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true

  if (editingId.value) {
    await timesheets.update(editingId.value, { ...form.value })
  } else {
    await timesheets.add({ ...form.value })
  }

  saving.value = false
  dialog.value = false
  editingId.value = null
  await reload()
}



async function remove(id) {
  if (!confirm('Usunąć ten wpis?')) return
  await timesheets.remove(id)
  await reload()
}

// Pobieramy projekty wraz z employee_rate i currency
async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, employee_rate, currency')
    .eq('active', true)
    .order('name')
  if (!error) projects.value = (data || []).map(p => ({
    ...p,
    employee_rate: p.employee_rate != null ? Number(p.employee_rate) : null
  }))
}

function formatDate(d) {
  return d
    ? new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d))
    : '—'
}

function formatCurrency(v, currency = 'PLN') {
  if (v == null) return '—'
  try {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(Number(v))
  } catch {
    return `${Number(v).toFixed(2)} ${currency}`
  }
}

onMounted(async () => {
  await employees.fetchAll()
  await fetchProjects()
  await reload()
})

const groupedByEmployee = computed(() => {
  const groups = new Map()
  for (const entry of timesheets.list) {
    if (!groups.has(entry.employee_id)) {
      groups.set(entry.employee_id, [])
    }
    groups.get(entry.employee_id).push(entry)
  }
  return Array.from(groups, ([employee_id, entries]) => ({ employee_id, entries }))
})

const expandedId = ref(null)
function isExpanded(id) {
  return expandedId.value === id
}
function toggleExpand(id) {
  expandedId.value = isExpanded(id) ? null : id
}


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

</script>
<style scoped>
.month-display {
  font-size: 1.4rem;
  font-weight: 600;
  text-transform: capitalize;
  min-width: 180px;
  text-align: center;
}
</style>