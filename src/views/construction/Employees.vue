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
        <v-list>
          <v-list-item
            v-for="item in filteredItems"
            :key="item.id"
          >
            <v-list-item-title>
              {{ item.first_name }} {{ item.last_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              📞 {{ item.phone }} | Status: {{ item.status }}
            </v-list-item-subtitle>
            <template #append>
              <v-btn icon="mdi-pencil" variant="text" @click="openEditDialog(item)" />
              <v-btn
                v-if="item.status === 'zatrudniony'"
                icon="mdi-account-remove"
                variant="text"
                color="red"
                @click="markFired(item.id)"
              />
            </template>
          </v-list-item>
        </v-list>
      </template>

      <template v-else>
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          item-key="id"
          density="compact"
        >
          <template #item.status="{ value }">
            <v-chip
              :color="value === 'zatrudniony' ? 'green' : 'red'"
              text-color="white"
              small
            >
              {{ value }}
            </v-chip>
          </template>
          <template #item.edit="{ item }">
            <v-btn icon="mdi-pencil" variant="text" @click="openEditDialog(item)" />
          </template>
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
      <v-form ref="formRef" v-model="formValid" lazy-validation @submit.prevent="save">
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
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialog = false">Anuluj</v-btn>
          <v-btn color="primary" type="submit">Zapisz</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</v-dialog>


</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeesStore } from '@/stores/employeesStore'

const employees = useEmployeesStore()
const dialog = ref(false)
const editId = ref(null)
const showFormer = ref(false)

const form = ref({
  first_name: '',
  last_name: '',
  phone: '',
  status: 'zatrudniony'
})

const headers = [
  { title: 'Imię', key: 'first_name' },
  { title: 'Nazwisko', key: 'last_name' },
  { title: 'Telefon', key: 'phone' },
  { title: 'Status', key: 'status' },
  { title: 'Edytuj', key: 'edit', sortable: false },
  { title: 'Zwolnij', key: 'fire', sortable: false },
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
  form.value = { first_name: '', last_name: '', phone: '', status: 'zatrudniony' }
  dialog.value = true
}

function openEditDialog(item) {
  editId.value = item.id
  form.value = { first_name: item.first_name, last_name: item.last_name, phone: item.phone, status: item.status }
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
    active: form.value.status === 'zatrudniony'
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

</script>
