<template>
  <v-card outlined>
    <v-card-text>
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

  <v-btn @click="nextMonth" :disabled="loading">
    <v-icon size="32">mdi-chevron-right</v-icon>
  </v-btn>
</v-sheet>

<v-sheet
  class="pa-3 mb-4 text-h5"
  color="blue-lighten-5"
  rounded
  elevation="1"
>
  <v-row align="center">
    <!-- Suma wypłat -->
    <v-col cols="12" md="6" class="d-flex align-center justify-space-between justify-md-end">
      <strong>Suma wypłat:&nbsp;</strong>
      <span class="text-success">{{ formatCurrency(totalGrossSum) }}</span>
    </v-col>

    <!-- Separator tylko na desktop -->
    <v-divider
      vertical
      class="d-none d-md-flex"
      color="black"
      thickness="2"
    ></v-divider>

    <!-- Pozostało do wypłaty -->
    <v-col cols="12" md="5" class="d-flex align-center justify-space-between justify-md-start">
      <strong>Pozostało do wypłaty:&nbsp;</strong>
      <span class="text-success">{{ formatCurrency(totalNetSum) }}</span>
    </v-col>
  </v-row>
</v-sheet>


      <v-row>
        <v-col
          v-for="item in rows"
          :key="item.employee_id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="mb-3" elevation="2">
            <!-- Header -->
            <v-card-title
              class="d-flex justify-space-between align-center"
              style="background:#f5f5f5"
            >
              <strong>{{ employeeName(item.employee_id) }}</strong>
              <span class="text-h6 text-success">
                {{ formatCurrency(item.net_sum) }}
              </span>
            </v-card-title>

            <!-- Subheader -->
            <v-card-subtitle class="py-2">
              <v-row no-gutters>
                <v-col cols="12" class="d-flex align-center mb-1">
                  <v-icon size="16" class="me-2 text-amber">mdi-timer-sand</v-icon>
                  <span class="text-body-2">
                    <strong>Godziny:</strong> {{ Number(item.hours_sum).toFixed(2) }} h
                  </span>
                </v-col>

                <v-col cols="12" class="d-flex align-center mb-1">
                  <v-icon size="16" class="me-2 text-success">mdi-cash</v-icon>
                  <span class="text-body-2">
                    <strong>Zarobiono:</strong> {{ formatCurrency(item.gross_sum) }}
                  </span>
                </v-col>

                <v-col cols="12" class="d-flex align-center">
                  <v-icon size="16" class="me-2 text-red">mdi-cash-minus</v-icon>
                  <span class="text-body-2">
                    <strong>Zaliczki:</strong> {{ formatCurrency(item.advances_sum) }}
                  </span>
                </v-col>
              </v-row>
            </v-card-subtitle>


            <!-- Actions -->
            <v-card-actions class="py-2">
              <v-btn
                variant="outlined"
                block
                color="primary"
                @click="toggleExpand(item.employee_id)"
              >
                <v-icon start>
                  {{ isExpanded(item.employee_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
                Szczegóły
              </v-btn>
            </v-card-actions>

            <!-- Expanded details -->
            <v-expand-transition>
              <v-card-text
                v-if="isExpanded(item.employee_id)"
                class="pa-0"
                style="background:#fafafa"
              >
                <v-card flat class="pa-4">
                  <!-- Czas pracy -->
                  <v-row dense>
                    <v-col cols="12" class="mb-1">
                      <v-icon size="18" class="me-1 text-deep-orange">mdi-timer-sand</v-icon>
                      <strong>Czas pracy</strong>
                    </v-col>
                    <template v-if="!item.details?.length">
                      <v-col cols="12" class="text-medium-emphasis">
                        <v-icon size="18" class="me-1 text-grey">mdi-clock-outline</v-icon>
                        Brak szczegółów czasu pracy
                      </v-col>
                    </template>
                    <template v-else>
                      <v-col
                        v-for="detail in item.details"
                        :key="detail.place"
                        cols="12" sm="6"
                      >
                        <div class="mb-1">
                          <v-icon size="18" class="me-1 text-grey">mdi-office-building-marker-outline</v-icon>
                          <strong>{{ detail.place }}</strong>
                        </div>
                        <div class="text-body-2">
                          <v-icon size="18" class="me-1 text-amber">mdi-clock-time-four-outline</v-icon>
                          {{ Number(detail.hours).toFixed(2) }} h
                        </div>
                        <div class="text-body-2">
                          <v-icon size="18" class="me-1 text-success">mdi-cash</v-icon>
                          {{ formatCurrency(detail.earned) }}
                        </div>
                      </v-col>
                    </template>

                    <!-- Zaliczki -->
                    <v-col cols="12" class="mt-3 mb-1">
                      <v-icon size="18" class="me-1 text-deep-orange">mdi-cash-multiple</v-icon>
                      <strong>Zaliczki</strong>
                    </v-col>
                    <template v-if="!item.advances_details?.length">
                      <v-col cols="12" class="text-medium-emphasis">
                        Brak zaliczek w tym okresie
                      </v-col>
                    </template>
                    <template v-else>
                      <v-col
                        v-for="adv in item.advances_details"
                        :key="adv.date + adv.amount"
                        cols="12" sm="6"
                      >
                        <div class="text-body-2">
                          <v-icon size="18" class="me-1 text-blue">mdi-calendar</v-icon>
                          <strong>Data:</strong> {{ adv.date }}
                        </div>
                        <div class="text-body-2">
                          <v-icon size="18" class="me-1 text-red">mdi-cash-plus</v-icon>
                          <strong>Kwota:</strong> {{ formatCurrency(adv.amount) }}
                        </div>
                        <div class="text-body-2" style="min-height:1.25rem">
                          <v-icon v-if="adv.note" size="18" class="me-1 text-grey">mdi-note-text-outline</v-icon>
                          <strong>Notatki:</strong>
                          <span v-if="adv.note">{{ adv.note }}</span>
                        </div>
                      </v-col>
                    </template>
                  </v-row>
                </v-card>
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeesStore } from '@/stores/employeesStore'
import { usePayrollStore } from '@/stores/payrollStore'
import { useDisplay } from 'vuetify'

const employees = useEmployeesStore()
const payroll = usePayrollStore()
const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

const month = ref(new Date().toISOString().slice(0,7))
// const rows = computed(() => payroll.rows)
const loading = computed(() => payroll.loading)
const BONUS_IDS = [6, 7] // Marek Kuśmierski, Leszek Murawski
const BONUS_PER_HOUR = 5

const rows = computed(() => {
  return payroll.rows.map(r => {
    if (BONUS_IDS.includes(r.employee_id)) {
      const bonus = Number(r.hours_sum || 0) * BONUS_PER_HOUR
      const updatedDetails = r.details?.map(d => ({
        ...d,
        earned: Number(d.earned || 0) + Number(d.hours || 0) * BONUS_PER_HOUR
      })) || []
      return {
        ...r,
        gross_sum: Number(r.gross_sum || 0) + bonus,
        net_sum: Number(r.net_sum || 0) + bonus,
        details: updatedDetails
      }
    }
    return r
  })
})



// Tylko jeden wiersz rozwinięty
const expandedId = ref(null)

function isExpanded(id) {
  return expandedId.value === id
}

function toggleExpand(id) {
  expandedId.value = isExpanded(id) ? null : id
}

const headers = [
  { title: 'Pracownik', key: 'employee' },
  { title: 'Godziny', key: 'hours_sum', align: 'end' },
  { title: 'Zarobione', key: 'gross_sum', align: 'end' },
  { title: 'Zaliczki', key: 'advances_sum', align: 'end' },
  { title: 'Do wypłaty', key: 'net_sum', align: 'end' },
  { title: 'Rozwiń', key: 'actions', align: 'end', sortable: false }
]

function employeeName(id) {
  const e = employees.list.find(e => e.id === id)
  return e ? `${e.first_name} ${e.last_name}` : '—'
}

function formatCurrency(v) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
    .format(Number(v || 0))
}

function localYMD(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

async function reload() {
  const [y, m] = month.value.split('-').map(Number)
  const start = localYMD(y, m, 1)
  const lastDay = new Date(y, m, 0).getDate()
  const end = localYMD(y, m, lastDay)
  await payroll.fetchForMonth(start, end)
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
  reload() // automatyczne odświeżenie
}

function prevMonth() { shiftMonth(-1) }
function nextMonth() { shiftMonth(1) }

onMounted(async () => {
  await employees.fetchAll()
  await reload()
})

const totalNetSum = computed(() => {
  return rows.value.reduce((sum, r) => sum + Number(r.net_sum || 0), 0)
})

const totalGrossSum = computed(() => {
  return rows.value.reduce((sum, r) => sum + Number(r.gross_sum || 0), 0)
})


</script>

<style scoped>
/* Wspólne wyrównanie ikon i tekstu */
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Dla sekcji z kilkoma kolumnami */
.detail-row.spaced {
  justify-content: space-between;
  flex-wrap: wrap;
}

/* Stałe miejsce na notatkę – zapobiega "skakaniu" układu */
.note-cell {
  min-height: 1.25rem; /* ~wysokość jednej linii tekstu */
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Ikonki lekko wyszarzone lub kolorowe wg sekcji */
.icon-grey { color: #757575; }
.icon-amber { color: #ffb300; }
.icon-green { color: #4caf50; }
.icon-red { color: #f44336; }
.icon-blue { color: #2196f3; }
.icon-orange { color: #ff7043; }

/* Odstępy pionowe między wierszami w rozwiniętej liście */
.expanded-block > .detail-row {
  padding: 0.2rem 0;
  border-bottom: 1px dashed #e0e0e0;
}
.expanded-block > .detail-row:last-child {
  border-bottom: none;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
}
.details-table td {
  padding: 0.25rem 0.5rem;
  vertical-align: top;
}
.details-table tr:not(:last-child) td {
  border-bottom: 1px dashed #e0e0e0;
}
.details-table td:first-child {
  width: 50%;
}
.details-table td:nth-child(2) {
  width: 20%;
}
.details-table td:nth-child(3) {
  width: 30%;
}
.month-display {
  font-size: 1.4rem;
  font-weight: 600;
  text-transform: capitalize;
  min-width: 180px;
  text-align: center;
}

</style>