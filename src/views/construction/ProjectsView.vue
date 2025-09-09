<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center mb-4">
        <h1 class="text-h5">Projekty</h1>
        <v-btn size="large" color="primary" @click="openDialog()">
          <v-icon start>mdi-briefcase-plus</v-icon>
          Dodaj projekt
        </v-btn>
      </v-col>
      <v-checkbox
      v-model="showFinished"
      label="Pokaż zakończone projekty"
      class="mb-4"
    />
      <!-- Tabela projektów -->
      <v-col cols="12">
        <v-card>
          <v-card-title>Lista projektów</v-card-title>
          <v-card-text>
            <v-progress-linear
              v-if="projects.loading"
              indeterminate
              color="primary"
              class="mb-4"
            />
            <v-alert v-if="projects.error" type="error" variant="tonal" class="mb-4">
              {{ projects.error }}
            </v-alert>

<v-col cols="12">
  <v-row>
    <v-col
      v-for="proj in filteredProjects"
      :key="proj.id"
      cols="12"
      md="4"
    >
      <v-card outlined class="d-flex flex-column h-100">
        <!-- Nagłówek karty -->
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="me-2">mdi-briefcase</v-icon>
          <span class="font-weight-bold">{{ proj.name }}</span>
        </v-card-title>

        <!-- Dane projektu -->
        <v-card-text class="flex-grow-1">
          <div class="d-flex align-center mb-1">
            <v-icon color="teal" class="me-2">mdi-account-cash</v-icon>
            Stawka pracownicza:&nbsp;<strong>{{ formatCurrency(proj.employee_rate) }}</strong>
          </div>
          <div class="d-flex align-center mb-1">
            <v-icon color="purple" class="me-2">mdi-currency-usd</v-icon>
            Waluta:&nbsp;<strong>{{ proj.currency }}</strong>
          </div>
          <div class="d-flex align-center">
            <v-icon color="blue" class="me-2">mdi-map-marker</v-icon>
            Lokalizacja:&nbsp;<strong>{{ proj.location || '—' }}</strong>
          </div>
        </v-card-text>

        <!-- Dolny pasek akcji -->
<v-card-actions
  class="d-flex flex-column flex-sm-row justify-end ga-2"
>
  <v-btn
    color="primary"
    variant="tonal"
    size="small"
    class="action-btn"
    @click="openDialog(proj)"
  >
    <v-icon start>mdi-pencil</v-icon>
    Edytuj projekt
  </v-btn>

  <v-btn
    v-if="proj.active"
    color="warning"
    variant="tonal"
    size="small"
    class="action-btn"
    @click="finishProject(proj.id)"
  >
    <v-icon start>mdi-close-circle</v-icon>
    Zakończ projekt
  </v-btn>
</v-card-actions>

      </v-card>
    </v-col>
  </v-row>
</v-col>

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Wspólny dialog dodawania/edycji -->
    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>{{ editId ? 'Edytuj projekt' : 'Dodaj projekt' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid" lazy-validation @submit.prevent="saveProject" autocomplete="off">
            <v-text-field
              v-model="form.name"
              label="Nazwa projektu"
              variant="outlined"
              :rules="[v => !!v || 'Nazwa jest wymagana']"
              required
              class="mb-3"
            />

            <v-text-field
              v-model.number="form.company_rate"
              type="number"
              step="0.01"
              min="0"
              label="Stawka firmowa"
              variant="outlined"
              :rules="[v => v > 0 || 'Stawka musi być > 0']"
              :append-inner-text="form.currency"
              required
              class="mb-3"
            />

            <v-text-field
              v-model.number="form.employee_rate"
              type="number"
              step="0.01"
              min="0"
              label="Stawka pracownicza"
              variant="outlined"
              :rules="[v => v > 0 || 'Stawka musi być > 0']"
              :append-inner-text="form.currency"
              required
              class="mb-3"
            />

            <v-select
              v-model="form.currency"
              :items="currencies"
              label="Waluta"
              variant="outlined"
              :rules="[v => !!v || 'Waluta jest wymagana']"
              required
              class="mb-3"
            />

            <v-text-field
              v-model="form.location"
              label="Lokalizacja (opcjonalnie)"
              variant="outlined"
              class="mb-4"
            />

            <div class="d-flex justify-end ga-2">
              <v-btn variant="text" @click="dialog = false">Anuluj</v-btn>
              <v-btn color="primary" type="submit" :loading="loadingSave">
                Zapisz
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'

const projects = useProjectsStore()

const currencies = ['PLN', 'EUR', 'USD']

const headers = [
  { title: 'Nazwa', key: 'name' },
  { title: 'Stawka firmowa', key: 'company_rate', align: 'end' },
  { title: 'Stawka pracownicza', key: 'employee_rate', align: 'end' },
  { title: 'Waluta', key: 'currency', align: 'center' },
  { title: 'Lokalizacja', key: 'location' },
  { title: 'Edytuj', key: 'edit', sortable: false, align: 'end' },
  { title: 'Zakończ', key: 'end', sortable: false, align: 'end' }
]

const dialog = ref(false)
const loadingSave = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  company_rate: null,
  employee_rate: null,
  currency: 'PLN',
  location: ''
})

onMounted(() => {
  projects.fetchAll()
})

function openDialog(item = null) {
  if (item) {
    editId.value = item.id
    form.value = {
      name: item.name,
      company_rate: item.company_rate ?? null,
      employee_rate: item.employee_rate ?? null,
      currency: item.currency || 'PLN',
      location: item.location || ''
    }
  } else {
    editId.value = null
    form.value = { name: '', company_rate: null, employee_rate: null, currency: 'PLN', location: '' }
  }
  dialog.value = true
}

const formRef = ref(null)
const formValid = ref(false)

async function saveProject() {
  // Wywołujemy walidację i odbieramy wynik
  const { valid } = await formRef.value.validate()
  if (!valid) return // przerywamy dalsze wykonanie, jeśli coś nie przeszło

  loadingSave.value = true
  const payload = { ...form.value }
  if (editId.value) {
    await projects.update(editId.value, payload)
  } else {
    await projects.add(payload)
  }
  loadingSave.value = false
  dialog.value = false
  projects.fetchAll()
}

async function removeProject(id) {
  if (!confirm('Usunąć ten projekt?')) return
  await projects.remove(id)
  projects.fetchAll()
}

function formatCurrency(v, currency = 'PLN') {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(n)
  } catch {
    return `${n.toFixed(2)} ${currency}`
  }
}

const showFinished = ref(false)

const filteredProjects = computed(() =>
  showFinished.value
    ? projects.list
    : projects.list.filter(p => p.active)
)

async function finishProject(id) {
  if (!confirm('Oznaczyć ten projekt jako zakończony?')) return
  await projects.finish(id)
}

</script>
<style scoped>
.action-btn {
  transition: background-color 0.25s ease, transform 0.2s ease;
  width: 100%;               /* na mobile wypełnia całą szerokość */
}

@media (min-width: 600px) {
  .action-btn {
    width: auto;             /* na większych ekranach normalna szerokość */
  }
}

.action-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

</style>