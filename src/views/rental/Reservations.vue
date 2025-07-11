<template>
  <div class="reservations-view">
    <h2>Rezerwacje</h2>

    <ReservationForm @added="onReservationAdded" />

    <button @click="fetchReservations" :disabled="loading">
      {{ loading ? 'Ładowanie…' : 'Odśwież listę' }}
    </button>

    <ul>
      <li v-for="r in reservations" :key="r.id" class="reservation-item">
        <strong>ID: {{ r.id }}</strong> —
        {{ r.first_name }} {{ r.last_name }} ({{ r.phone }})  
        → {{ r.vehicles.brand }} {{ r.vehicles.model }} {{ r.vehicles.reg_number }} 
        | {{ r.start_date }} – {{ r.end_date }}  
        <div class="notes">Notatki: {{ r.notes || '–' }}</div>

        <button @click="startEdit(r)">Edytuj</button>
        <button @click="remove(r.id)">Usuń</button>
      </li>
    </ul>

    <EditReservationForm
      v-if="editing"
      :reservation="editing"
      @updated="onReservationUpdated"
      @cancel="() => (editing = null)"
    />


    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs }    from 'pinia'
import ReservationForm     from '@/components/rental/ReservationForm.vue'
import EditReservationForm from '@/components/rental/EditReservationForm.vue'
import { useReservationStore } from '@/stores/reservationStore'

const store = useReservationStore()
const { list: reservations, loading, error } = storeToRefs(store)
const editing = ref(null)

const fetchReservations = async () => {
  await store.fetchAll()
}

onMounted(fetchReservations)

const onReservationAdded = async () => {
  await fetchReservations()
}

const remove = async (id) => {
  if (!confirm('Usuń tę rezerwację?')) return
  await store.deleteReservation(id)
  await fetchReservations()
}

const startEdit = (r) => {
  editing.value = { ...r }
}

const onReservationUpdated = async () => {
  editing.value = null
  await fetchReservations()
}
</script>

<style scoped>
.reservation-item {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}
.notes {
  font-style: italic;
  margin: 0.25rem 0;
}
button {
  margin-left: 0.5rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
