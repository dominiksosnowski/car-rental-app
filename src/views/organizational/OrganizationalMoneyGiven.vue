<template>
  <v-container>
    <!-- Pasek wyboru miesiąca -->
    <v-sheet
      class="pa-3 mb-4 d-flex align-center justify-center"
      color="blue-lighten-4"
      rounded
      elevation="1"
    >
      <v-btn @click="prevMonth" :disabled="loading">
        <v-icon size="32">mdi-chevron-left</v-icon>
      </v-btn>

      <span class="month-display mx-4 text-h6 font-weight-bold">
        {{ monthLabel }}
      </span>

      <v-btn @click="nextMonth" :disabled="loading">
        <v-icon size="32">mdi-chevron-right</v-icon>
      </v-btn>
    </v-sheet>

    <!-- Karta z podsumowaniem -->
    <v-card outlined>
<v-card outlined>
  <!-- Tytuł -->
  <v-card-title class="bg-green-lighten-5 d-flex align-center">
    <v-icon color="green" class="me-2">mdi-cash-fast</v-icon>
    Przekazy w miesiącu
  </v-card-title>

  <!-- Przycisk pod tytułem -->
  <v-card-actions class="bg-green-lighten-5 pt-0">
    <v-btn variant="elevated" color="primary" @click="openDialog()">
      <v-icon start>mdi-plus</v-icon> Dodaj przekaz
    </v-btn>
  </v-card-actions>

  <v-card-text>
    <!-- reszta zawartości karty -->
  </v-card-text>
</v-card>


      <v-card-text>
        <div class="mb-2 d-flex align-center">
          <v-icon color="indigo" class="me-2">mdi-counter</v-icon>
          <strong>Ilość przekazów:</strong>&nbsp;{{ filteredItems.length }}
        </div>
        <div class="mb-4 d-flex align-center">
          <v-icon color="deep-orange" class="me-2">mdi-cash-multiple</v-icon>
          <strong>Łączna kwota:</strong>&nbsp;{{ formatCurrency(totalAmount) }}
        </div>

        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon start color="grey">mdi-format-list-bulleted</v-icon>
              Szczegóły przekazów
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact">
                <template v-for="(item, idx) in filteredItems" :key="item.id">
                  <v-list-item>
                    <v-list-item-content>
                      <div class="d-flex align-center mb-1">
                        <v-icon color="blue" class="me-2">mdi-calendar</v-icon>
                        <strong>Data:</strong>&nbsp;{{ formatDate(item.date) }}
                      </div>
                      <div class="d-flex align-center mb-1">
                        <v-icon color="green" class="me-2">mdi-cash</v-icon>
                        <strong>Kwota:</strong>&nbsp;{{ formatCurrency(item.amount) }}
                      </div>
                      <div v-if="item.note" class="d-flex align-center">
                        <v-icon color="grey" class="me-2">mdi-note-text</v-icon>
                        <strong>Notatka:</strong>&nbsp;{{ item.note }}
                      </div>
                    </v-list-item-content>

                    <!-- Akcje po prawej stronie -->
<v-list-item-action class="d-flex flex-row justify-end ga-2">
  <v-btn color="blue" size="small" @click="openDialog(item)">
    <v-icon start>mdi-pencil</v-icon> Edytuj
  </v-btn>
  <v-btn color="red" size="small" @click="deleteItem(item.id)">
    <v-icon start>mdi-delete</v-icon> Usuń
  </v-btn>
</v-list-item-action>

                  </v-list-item>

                  <!-- Separator między elementami -->
                  <v-divider v-if="idx !== filteredItems.length - 1" class="my-3" />
                </template>

                <v-list-item v-if="!filteredItems.length" title="Brak przekazów" />
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>

    <!-- Dialog formularza -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ editedItem.id ? 'Edytuj przekaz' : 'Dodaj przekaz' }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="save">
            <v-text-field
              v-model="editedItem.date"
              label="Data"
              type="date"
              required
            />
            <v-text-field
              v-model.number="editedItem.amount"
              label="Kwota"
              type="number"
              step="0.01"
              required
            />
            <v-textarea
              v-model="editedItem.note"
              label="Notatki"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">Anuluj</v-btn>
          <v-btn color="primary" @click="save">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrganizationalMoneyGivenStore } from '@/stores/organizationalMoneyGivenStore'

const store = useOrganizationalMoneyGivenStore()

const dialog = ref(false)
const editedItem = ref({ id: null, date: '', amount: null, note: '' })
const formRef = ref(null)

function openDialog(item = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = { id: null, date: '', amount: null, note: '' }
  }
  dialog.value = true
}

async function save() {
  if (!editedItem.value.date || !editedItem.value.amount) return
  if (editedItem.value.id) {
    await store.update(editedItem.value.id, {
      date: editedItem.value.date,
      amount: editedItem.value.amount,
      note: editedItem.value.note
    })
  } else {
    await store.add({
      date: editedItem.value.date,
      amount: editedItem.value.amount,
      note: editedItem.value.note
    })
  }
  dialog.value = false
}

async function deleteItem(id) {
  if (confirm('Na pewno usunąć ten wpis?')) {
    await store.remove(id)
  }
}

// Miesiąc w formacie YYYY-MM
const month = ref(new Date().toISOString().slice(0, 7))

const monthLabel = computed(() => {
  const [y, m] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
})

// Filtr przekazów po miesiącu
const filteredItems = computed(() => {
  return store.items.filter(item => {
    if (!item.date) return false
    const d = new Date(item.date)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return ym === month.value
  })
})

const totalAmount = computed(() =>
  filteredItems.value.reduce((sum, i) => sum + Number(i.amount || 0), 0)
)

function shiftMonth(delta) {
  const [y, m] = month.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth() { shiftMonth(-1) }
function nextMonth() { shiftMonth(1) }

function formatCurrency(val) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(val || 0)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return isNaN(d) ? '–' : d.toLocaleDateString('pl-PL')
}

onMounted(() => {
  store.fetchAll()
})
</script>
