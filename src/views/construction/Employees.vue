<template>
  <v-card outlined>
    <!-- Nagłówek -->
    <v-card-title class="flex-wrap" :class="$vuetify.display.smAndDown ? 'flex-column ga-2' : 'd-flex align-center justify-space-between'">
      <div class="d-flex align-center ga-4" :class="$vuetify.display.smAndDown && 'flex-column align-start'">
        <div>Zatrudnionych pracowników: {{ activeCount }}</div>

        <v-checkbox
          v-model="showFormer"
          label="Pokaż byłych pracowników"
          hide-details
          density="compact"
        />
      </div>

      <v-btn
        :block="$vuetify.display.smAndDown"          
        size="large"
        color="primary"
        @click="openAddDialog"
      >
        <v-icon start>mdi-account-plus</v-icon>
        Dodaj pracownika
      </v-btn>
    </v-card-title>

    <!-- Tabela / widok mobilny -->
    <v-card-text>
<template v-if="$vuetify.display.smAndDown">
  <v-container fluid class="pa-0">
    <v-row dense>
      <v-col
        v-for="item in filteredItems"
        :key="item.id"
        cols="12"
      >
        <v-card outlined>
          <!-- Nagłówek karty -->
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <div class="font-weight-bold">
                {{ item.first_name }} {{ item.last_name }}
              </div>
              <div class="d-flex align-center">
                <v-icon start small color="primary">mdi-phone</v-icon>
                <a
                  :href="`tel:${item.phone}`"
                  style="text-decoration: none; color: inherit;"
                >
                  {{ item.phone }}
                </a>
              </div>
            </div>
          </v-card-title>

          <!-- Przycisk rozwinięcia -->
          <v-card-actions class="py-2">
            <v-btn
              variant="outlined"
              block
              color="primary"
              @click="toggleExpand(item.id)"
            >
              <v-icon start>
                {{ isExpanded(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
              Szczegóły
            </v-btn>
          </v-card-actions>

          <!-- Rozwijana sekcja -->
          <v-expand-transition>
            <div v-if="isExpanded(item.id)">
              <v-divider></v-divider>
              <v-card-text>
                <div><strong>Status:</strong> {{ item.status }}</div>
                <div><strong>Firma:</strong> {{ item.company_name || '-' }}</div>
                <div>
                  <strong>Badania lekarskie:</strong>
                  <span :style="getDateStyle(item.medical_exam_date)">
                    {{ formatDate(item.medical_exam_date) }}
                  </span>
                </div>

                <div>
                  <strong>Koniec umowy:</strong>
                  <span :style="getDateStyle(item.contract_end_date)">
                    {{ formatDate(item.contract_end_date) }}
                  </span>
                </div>
              </v-card-text>
              <v-card-actions class="py-2">
                <v-row dense class="w-100">
                  <v-col cols="6">
                    <v-btn
                      variant="outlined"
                      block
                      color="primary"
                      @click="openEditDialog(item)"
                    >
                      <v-icon start>mdi-pencil</v-icon>
                      Edytuj
                    </v-btn>
                  </v-col>

                  <v-col cols="6" v-if="item.status === 'zatrudniony'">
                    <v-btn
                      variant="outlined"
                      block
                      color="red"
                      @click="markFired(item.id)"
                    >
                      <v-icon start>mdi-account-remove</v-icon>
                      Zwolnij
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
<v-card-actions class="py-2" v-if="item.medicalDoc || item.bhpDoc">
      <v-row dense class="w-100">
        <v-col cols="12" v-if="item.medicalDoc">
          <v-btn
            variant="outlined"
            block
            color="primary"
            @click="downloadDocument(item.medicalDoc.file_path)"
          >
            <v-icon start>mdi-download</v-icon>
            Pobierz badania lekarskie
          </v-btn>
        </v-col>

        <v-col cols="12" v-if="item.bhpDoc">
          <v-btn
            variant="outlined"
            block
            color="primary"
            @click="downloadDocument(item.bhpDoc.file_path)"
          >
            <v-icon start>mdi-download</v-icon>
            Pobierz BHP
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>



      <template v-else>
<v-data-table
  :headers="headers"
  :items="filteredItems"
  item-key="id"
  density="compact"
>
  <!-- Status -->
  <template #item.status="{ value }">
    <v-chip
      :color="value === 'zatrudniony' ? 'green' : 'red'"
      text-color="white"
      small
    >
      {{ value }}
    </v-chip>
  </template>

  <!-- Data badań lekarskich -->
  <template #item.medical_exam_date="{ value }">
    <span :style="getDateStyle(value)">
      {{ formatDate(value) }}
    </span>
  </template>



  <!-- Data końca umowy -->
  <template #item.contract_end_date="{ value }">
    <span :style="getDateStyle(value)">
      {{ formatDate(value) }}
    </span>
  </template>

<template #item.medical_doc="{ item }">
  <div v-if="item.medicalDoc" class="d-flex flex-column ga-1">
    <v-btn
      color="green"
      size="small"
      block
      @click="downloadDocument(item.medicalDoc.file_path)"
    >
      <v-icon start>mdi-download</v-icon>
      Pobierz
    </v-btn>

    <v-btn
      color="red"
      size="small"
      block
      @click="deleteDocument(item.medicalDoc.id, item.medicalDoc.file_path, item.id, 'medical')"
    >
      <v-icon start>mdi-delete</v-icon>
      Usuń
    </v-btn>
  </div>

  <div v-else class="d-flex flex-column">
    <v-btn
      color="primary"
      @click="$refs[`fileInput-medical-${item.id}`].click()"
    >
      <v-icon>mdi-upload</v-icon>
      Dodaj
    </v-btn>
    <input
      type="file"
      :ref="`fileInput-medical-${item.id}`"
      accept="application/pdf"
      style="display: none"
      @change="e => {
        const file = e.target.files[0]
        if (file) {
          uploadDocument(file, item.id, 'medical')
          e.target.value = null
        }
      }"
    />
  </div>
</template>


<template #item.bhp_doc="{ item }">
  <div v-if="item.bhpDoc" class="d-flex flex-column ga-2">
    <v-btn
    size="small"
      color="green"
      block
      @click="downloadDocument(item.bhpDoc.file_path)"
    >
      <v-icon start>mdi-download</v-icon>
      Pobierz
    </v-btn>

    <v-btn
      color="red"
      size="small"
      block
      @click="deleteDocument(item.bhpDoc.id, item.bhpDoc.file_path, item.id, 'bhp')"
    >
      <v-icon start>mdi-delete</v-icon>
      Usuń
    </v-btn>
  </div>

  <div v-else class="d-flex flex-column ga-2">
    <v-btn
      color="primary"
      @click="$refs[`fileInput-bhp-${item.id}`].click()"
    >
      <v-icon>mdi-upload</v-icon>
      Dodaj
    </v-btn>
    <input
      type="file"
      :ref="`fileInput-bhp-${item.id}`"
      accept="application/pdf"
      style="display: none"
      @change="e => {
        const file = e.target.files[0]
        if (file) {
          uploadDocument(file, item.id, 'bhp')
          e.target.value = null
        }
      }"
    />
  </div>
</template>




  <!-- Edycja -->
  <template #item.edit="{ item }">
    <v-btn icon="mdi-pencil" variant="text" @click="openEditDialog(item)" />
  </template>

  <!-- Zwolnienie -->
  <template #item.fire="{ item }">
    <v-btn
      v-if="item.status === 'zatrudniony'"
      icon="mdi-account-remove"
      variant="text"
      color="red"
      @click="markFired(item.id)"
    />
  </template>
</v-data-table>

      </template>
    </v-card-text>
  </v-card>
<v-dialog v-model="dialog" max-width="500px">
  <v-card>
    <v-card-title>
      {{ editId ? 'Edytuj pracownika' : 'Dodaj pracownika' }}
    </v-card-title>
    <v-card-text>
      <v-form ref="formRef" v-model="formValid" lazy-validation @submit.prevent="save" autocomplete="off">
        <v-text-field
          v-model="form.first_name"
          label="Imię"
          :rules="[v => !!v || 'Imię jest wymagane']"
          required
        />
        <v-text-field
          v-model="form.last_name"
          label="Nazwisko"
          :rules="[v => !!v || 'Nazwisko jest wymagane']"
          required
        />
        <v-text-field
          v-model="form.phone"
          label="Telefon"
        />
        <v-select
          v-model="form.status"
          :items="['zatrudniony', 'były pracownik']"
          label="Status"
        />
                  <v-text-field
            v-model="form.company_name"
            label="Firma zatrudniająca"
          />

          <v-text-field
            v-model="form.medical_exam_date"
            label="Data badań lekarskich"
            type="date"
          />

          <v-text-field
            v-model="form.contract_end_date"
            label="Data końca umowy"
            type="date"
          />
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialog = false">Anuluj</v-btn>
          <v-btn color="primary" type="submit">Zapisz</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>

<v-snackbar
  v-model="snackbar.show"
  :color="snackbar.color"
  timeout="3000"
>
  {{ snackbar.text }}
</v-snackbar>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeesStore } from '@/stores/employeesStore'
import { supabase } from '@/lib/supabase'

const employees = useEmployeesStore()
const dialog = ref(false)
const editId = ref(null)
const showFormer = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  phone: '',
  status: 'zatrudniony',
  medical_exam_date: '',
  bhp_exam_date: '',
  contract_end_date: '',
  company_name: ''
})

const headers = [
  { title: 'Imię', key: 'first_name' },
  { title: 'Nazwisko', key: 'last_name' },
  { title: 'Telefon', key: 'phone' },
  { title: 'Firma', key: 'company_name' },
  { title: 'Data badań lekarskich', key: 'medical_exam_date' },
  { title: 'Koniec umowy', key: 'contract_end_date' },
  { title: 'Dok. badań', key: 'medical_doc', sortable: false },
  { title: 'Dok. BHP', key: 'bhp_doc', sortable: false },
  { title: 'Status', key: 'status' },
  { title: 'Edytuj', key: 'edit', sortable: false },
  { title: 'Zwolnij', key: 'fire', sortable: false }
]




// Przekształcamy listę i mapujemy active → status
const items = computed(() =>
  (employees.list || []).map(e => ({
    ...e,
    status: e.active ? 'zatrudniony' : 'były pracownik'
  }))
)

// Filtrowanie: pokaż wszystkich lub tylko aktywnych
const filteredItems = computed(() => {
  if (showFormer.value) return items.value
  return items.value.filter(e => e.status === 'zatrudniony')
})

onMounted(employees.fetchAll)

function openAddDialog() {
  editId.value = null
  form.value = {
    first_name: '',
    last_name: '',
    phone: '',
    status: 'zatrudniony',
    medical_exam_date: '',
    bhp_exam_date: '',
    contract_end_date: '',
    company_name: ''
  }
  dialog.value = true
}

function openEditDialog(item) {
  editId.value = item.id
  form.value = {
    first_name: item.first_name,
    last_name: item.last_name,
    phone: item.phone,
    status: item.status,
    medical_exam_date: item.medical_exam_date || '',
    bhp_exam_date: item.bhp_exam_date || '',
    contract_end_date: item.contract_end_date || '',
    company_name: item.company_name || ''
  }
  dialog.value = true
}

const formRef = ref(null)
const formValid = ref(false)

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return // przerwij, jeśli wymagane pola puste

  const payload = {
    first_name: form.value.first_name,
    last_name: form.value.last_name,
    phone: form.value.phone ?? '',
    active: form.value.status === 'zatrudniony',
    medical_exam_date: form.value.medical_exam_date || null,
    bhp_exam_date: form.value.bhp_exam_date || null,
    contract_end_date: form.value.contract_end_date || null,
    company_name: form.value.company_name || null
  }

  if (editId.value) {
    await employees.update(editId.value, payload)
  } else {
    await employees.add(payload)
  }

  dialog.value = false
}


async function markFired(id) {
  await employees.update(id, { active: false })
}

const activeCount = computed(() =>
  items.value.filter(e => e.status === 'zatrudniony').length
)

function getDateStyle(dateStr) {
  if (!dateStr) return {}
  const today = new Date()
  const target = new Date(dateStr)
  const diffTime = target - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays <= 7) {
    return { color: 'red', fontWeight: 'bold' }
  }
  return {}
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pl-PL')
}

const expandedIds = ref([])

function toggleExpand(id) {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter(e => e !== id)
  } else {
    expandedIds.value.push(id)
  }
}

function isExpanded(id) {
  return expandedIds.value.includes(id)
}

async function onFileSelected(event, employeeId) {
  const files = Array.isArray(event) ? event : event?.target?.files
  const file = files?.[0]
  if (!file) return

  await uploadDocument(file, employeeId)

  // czyścimy input po wysłaniu
  event.target.value = null
}

async function uploadDocument(file, employeeId, type) {
  if (!file) return

  const ext = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${ext}`
  const filePath = `${employeeId}/${type}-${fileName}`

  // 1. Upload do Storage
  const { error: uploadError } = await supabase
    .storage
    .from('employee-documents')
    .upload(filePath, file, {
      contentType: 'application/pdf'
    })

  if (uploadError) {
    console.error('Błąd uploadu:', uploadError)
      showSnackbar('Błąd zapisu w bazie', 'error')
    return
  }
  showSnackbar('Dokument dodany', 'success')

  // 2. Zapis metadanych w tabeli
  const { error: insertError } = await supabase
    .from('employee_documents')
    .insert([{
      employee_id: employeeId,
      file_path: filePath,
      file_type: type // 'bhp' lub 'medical'
    }])

  if (insertError) {
    console.error('Błąd zapisu w bazie:', insertError)
    return
  }

  console.log('Plik wrzucony i powiązany z pracownikiem')

  // 3. Pobierz świeże dane dokumentów dla tego pracownika
  const { data: docs, error: docsError } = await supabase
    .from('employee_documents')
    .select('*')
    .eq('employee_id', employeeId)

  if (docsError) {
    console.error('Błąd pobierania dokumentów:', docsError)
    return
  }

  // 4. Zaktualizuj tylko tego pracownika w store
  const store = useEmployeesStore()
  const idx = store.list.findIndex(e => e.id === employeeId)
  if (idx !== -1) {
    const bhpDoc = docs.find(d => d.file_type === 'bhp') || null
    const medicalDoc = docs.find(d => d.file_type === 'medical') || null

    store.list[idx] = {
      ...store.list[idx],
      bhpDoc,
      medicalDoc
    }
  }
}




const documents = ref([])

async function fetchDocuments(employeeId) {
  const { data, error } = await supabase
    .from('employee_documents')
    .select('*')
    .eq('employee_id', employeeId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Błąd pobierania dokumentów:', error)
    return
  }

  // Rozdzielamy dokumenty po typie
  const bhpDoc = data.find(doc => doc.file_type === 'bhp') || null
  const medicalDoc = data.find(doc => doc.file_type === 'medical') || null

  documents.value = {
    all: data,       // wszystkie dokumenty
    bhp: bhpDoc,     // dokument BHP lub null
    medical: medicalDoc // dokument badań lekarskich lub null
  }
}


async function downloadDocument(filePath) {
  const { data, error } = await supabase
    .storage
    .from('employee-documents')
    .createSignedUrl(filePath, 60) // ważny 60 sekund

  if (error) {
    console.error('Błąd pobierania:', error)
    return
  }

  window.open(data.signedUrl, '_blank')
}

async function deleteDocument(docId, filePath, employeeId, type) {
  // 1. Usuń plik ze Storage
  const { error: storageError } = await supabase
    .storage
    .from('employee-documents')
    .remove([filePath])

  if (storageError) {
    console.error('Błąd usuwania pliku ze Storage:', storageError)
    return
  }

  // 2. Usuń rekord z bazy
  const { error: dbError } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', docId)

  if (dbError) {
    console.error('Błąd usuwania rekordu z bazy:', dbError)
      showSnackbar('Błąd usuwania pliku ze Storage', 'error')
    return
  }

  // 3. Wyczyść dokument w store, żeby od razu pojawił się przycisk uploadu
  const idx = employees.list.findIndex(e => e.id === employeeId)
  if (idx !== -1) {
    employees.list[idx] = {
      ...employees.list[idx],
      ...(type === 'bhp' ? { bhpDoc: null } : { medicalDoc: null })
    }
  }

  console.log('Dokument usunięty')
  showSnackbar('Dokument usunięty', 'success')
}

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, text: message, color }
}

</script>
