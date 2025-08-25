<template>
  <v-sheet elevation="1" rounded class="pa-4">
    <div class="d-flex align-center justify-space-between mb-2">
      <h3 class="text-h6">Kalendarz imprez</h3>
      <div class="d-flex gap-2">
        <v-btn size="small" variant="tonal" @click="goToday">Dziś</v-btn>
        <v-btn size="small" icon="mdi-chevron-left" @click="prev" />
        <v-btn size="small" icon="mdi-chevron-right" @click="next" />
      </div>
    </div>

    <VCalendar
      ref="cal"
      :view="view"
      :min-weeks="6"
      :attributes="calendarAttributes"
      @dayclick="onDayClick"
    >
      <template #day-content="{ day }">
        <div class="vc-day-content">
          <div class="d-flex align-center justify-space-between">
            <span class="text-caption">{{ day.day }}</span>
            <v-icon
              v-if="eventsOnDay(day).length"
              size="16"
              color="primary"
            >
              mdi-calendar-star
            </v-icon>
          </div>

          <div v-if="eventsOnDay(day).length" class="mt-1">
            <div
              v-for="(ev, i) in eventsOnDay(day)"
              :key="ev.id || `${ev.event_date}-${i}`"
              class="d-flex align-center text-truncate event-pill"
              :title="`${ev.event_time || '--:--'} • ${ev.title} • ${ev.people_count} os.`"
            >
              <v-icon size="14" class="me-1">mdi-clock-outline</v-icon>
              <span class="me-2 text-caption">{{ ev.event_time || '--:--' }}</span>
              <v-icon size="14" class="me-1">mdi-party-popper</v-icon>
              <span class="me-2 text-caption text-truncate">{{ ev.title }}</span>
              <v-icon size="14" class="me-1">mdi-account-group</v-icon>
              <span class="text-caption">{{ ev.people_count }}</span>
            </div>
          </div>
        </div>
      </template>
    </VCalendar>
  </v-sheet>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRestaurantEventsStore } from '@/stores/restaurantEventsStore'

// RestaurantCalendar.vue
const props = defineProps({
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['day-click'])

const store = useRestaurantEventsStore()
const view = ref('month')
const cal = ref(null)

onMounted(async () => {
  if (!Array.isArray(props.items) || props.items.length === 0) {
    await store.fetchUpcoming?.()
  }
  console.log('[RestaurantCalendar] props.items is array?', Array.isArray(props.items), props.items)
})


const allEvents = computed(() => {
  const base = Array.isArray(props.items) && props.items.length
    ? props.items
    : (Array.isArray(store.upcoming) ? store.upcoming : [])
  return base.filter(Boolean)
})

const normalizedEvents = computed(() =>
  allEvents.value.map((ev, i) => {
    const date = String(ev.event_date || '').slice(0, 10)
    const time = String(ev.event_time || '').slice(0, 5)
    return {
      id: ev.id ?? `${date}-${ev.title ?? 'ev'}-${i}`,
      event_date: date,
      event_time: time,
      title: ev.title ?? '—',
      people_count: Number.isFinite(ev.people_count) ? ev.people_count : 0
    }
  })
)

const eventsByDate = computed(() => {
  const map = {}
  for (const ev of normalizedEvents.value) {
    if (!map[ev.event_date]) map[ev.event_date] = []
    map[ev.event_date].push(ev)
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.event_time.localeCompare(b.event_time))
  }
  return map
})

const calendarAttributes = computed(() => {
  if (!Array.isArray(props.items)) return []
  return props.items
    .map((e, idx) => {
      const dates = e?.date ?? e?.dates ?? null
      if (!dates) return null
      return {
        key: `ev-${e?.id ?? idx}`,     // stabilny klucz
        dates,                         // wymagane
        dot: { color: e?.color ?? 'blue' },
        // customData: e                // opcjonalnie, jeśli używasz slotów dnia
      }
    })
    .filter(Boolean)
})

const attributes = computed(() =>
  Object.keys(eventsByDate.value || {}).map(date => ({
    key: `ev-${date}`,
    dates: parseYmd(date),
    highlight: { color: 'blue', fillMode: 'light' },
    dot: { color: 'blue' }
  }))
)

function eventsOnDay(daySlot) {
  const key = dayKey(daySlot)
  const list = eventsByDate.value[key]
  return Array.isArray(list) ? list : []
}

function parseYmd(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function fmtYmdLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function dayKey(daySlot) {
  const d = daySlot?.date
  return d instanceof Date ? fmtYmdLocal(d) : String(d).slice(0, 10)
}

function onDayClick(daySlot) {
  const key = dayKey(daySlot)
  emit('day-click', key, eventsOnDay(daySlot))
}

function goToday() {
  cal.value?.move(new Date())
}
function prev() {
  cal.value?.moveBy(-1)
}
function next() {
  cal.value?.moveBy(1)
}
</script>

<style scoped>
.vc-day-content { min-height: 62px; }
.event-pill { gap: 4px; line-height: 1.2; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
