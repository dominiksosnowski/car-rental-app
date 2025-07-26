<template>
  <v-container fluid class="pa-4">
    <v-row dense class="mb-6">
      <!-- A1. Przychody -->
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="green">mdi-cash</v-icon>
            Przychody
          </v-card-title>
          <v-card-text>
            <div>Tydzień: <strong>{{ earningsWeek }} zł</strong></div>
            <div>Miesiąc: <strong>{{ earningsMonth }} zł</strong></div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- A2. W trakcie naprawy -->
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="orange">mdi-wrench</v-icon>
            W trakcie naprawy
          </v-card-title>
          <v-card-text>
            <h2 class="display-1">{{ inProgressCount }}</h2>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- A3. Umówione w tym tygodniu -->
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>
            <v-icon left color="blue">mdi-calendar-clock</v-icon>
            Umówione w tygodniu
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="upcomingHeaders"
              :items="upcomingThisWeek"
              dense
              hide-default-footer
            >
              <template #item.scheduled_at="{ item }">
                {{ formatDate(item.scheduled_at) }}
              </template>
              <template #item.customer="{ item }">
                {{ item.customer.first_name }} {{ item.customer.last_name }}
              </template>
              <template #item.vehicle="{ item }">
                {{ item.vehicle.brand }} {{ item.vehicle.model }}
              </template>
              <template #item.engine="{ item }">
                {{ item.vehicle.engine }}
              </template>
              <template #item.notes="{ item }">
                {{ item.notes || '–' }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useWorkshopStore }   from '@/stores/workshopStore'

const store = useWorkshopStore()
const { orders } = store

onMounted(() => store.fetchAll())

const now   = new Date()
const in7   = new Date(now); in7.setDate(now.getDate()+7)

function startOfWeek(d) {
  const day = d.getDay() || 7
  const m   = new Date(d)
  m.setDate(d.getDate() - day + 1)
  m.setHours(0,0,0,0)
  return m
}

const earningsWeek = computed(() =>
  store.orders
    .filter(o => o.status === 'completed')
    .filter(o => {
      const d = new Date(o.completed_at)
      return d >= startOfWeek(now) && d <= now
    })
    .flatMap(o => store.parts.filter(p => p.repair_order_id===o.id))
    .reduce((sum,p)=> sum + p.unit_price*p.quantity, 0)
)

const earningsMonth = computed(() =>
  store.orders
    .filter(o => o.status === 'completed')
    .filter(o => {
      const d = new Date(o.completed_at)
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
    })
    .flatMap(o => store.parts.filter(p => p.repair_order_id===o.id))
    .reduce((sum,p)=> sum + p.unit_price*p.quantity, 0)
)

const inProgressCount = computed(() =>
  store.orders.filter(o => o.status==='in_progress').length
)

const upcomingHeaders = [
  { title:'Data',       key:'scheduled_at' },
  { title:'Klient',     key:'customer'     },
  { title:'Pojazd',     key:'vehicle'      },
  { title:'Silnik',     key:'engine'       },
  { title:'Opis',       key:'notes'        }
]

const upcomingThisWeek = computed(() =>
  store.orders
    .filter(o => o.status==='scheduled')
    .filter(o => {
      const d = new Date(o.scheduled_at)
      return d >= now && d <= in7
    })
)
  
function formatDate(str) {
  return new Intl.DateTimeFormat('pl-PL', {
    day:'2-digit', month:'2-digit', year:'numeric'
  }).format(new Date(str))
}
</script>
