<template>
  <div class="vehicles-view">
    <h2>Pojazdy</h2>
    <VehicleForm @added="onVehicleAdded" />

    <button @click="fetchVehicles" :disabled="loading">
      {{ loading ? 'Ładowanie...' : 'Odśwież listę' }}
    </button>

    <ul>
      <li v-for="v in vehicles" :key="v.id" class="vehicle-item">
        {{ v.brand }} {{ v.model }} ({{ v.reg_number }}) —
        Badanie: {{ v.inspection_date }}, Ubezp.: {{ v.insurance_date }}
        zarobek: {{ earningsByVehicle[v.id] || 0 }} zł
        <button @click="startEdit(v)">Edytuj</button>
        <button @click="remove(v.id)" :disabled="loading">Usuń</button>
      </li>
    </ul>

    <EditVehicleForm
      v-if="editingVehicle"
      :vehicle="editingVehicle"
      @updated="onVehicleUpdated"
      @cancel="editingVehicle = null"
    />

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import VehicleForm from '@/components/rental/VehicleForm.vue'
import EditVehicleForm from '@/components/rental/EditVehicleForm.vue'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useRentalStore }  from '@/stores/rentalStore'
import { usePaymentStore } from '@/stores/paymentStore'

const store    = useVehicleStore()
const rentalStore  = useRentalStore()
const paymentStore = usePaymentStore()
const vehicleStore = useVehicleStore()
const { list: vehicles, loading, error } = storeToRefs(vehicleStore)
const { list: rentals }    = storeToRefs(rentalStore)
const { list: payments }   = storeToRefs(paymentStore)

onMounted(async () => {
  await vehicleStore.fetchAll()
  await rentalStore.fetchAll()
  await paymentStore.fetchAll()
})

const fetchVehicles = async () => {
  await store.fetchAll()
}

const editingVehicle = ref(null)

const onVehicleAdded = async () => {
  await fetchVehicles()
}

const remove = async (id) => {
  if (!confirm('Na pewno usunąć ten pojazd?')) return
  await store.deleteVehicle(id)
  await fetchVehicles()
}

const startEdit = (v) => {
  editingVehicle.value = { ...v }
}

const onVehicleUpdated = async () => {
  editingVehicle.value = null
  await fetchVehicles()
}

const earningsByVehicle = computed(() => {
  return rentals.value.reduce((acc, r) => {
    // sumujemy wpłaty tylko dla tej rezerwacji
    const paid = payments.value
      .filter(p => p.rental_id === r.id)
      .reduce((sum, p) => sum + Number(p.amount), 0)

    acc[r.vehicle_id] = (acc[r.vehicle_id] || 0) + paid
    return acc
  }, {})
})


</script>
