<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col>
        <h2 class="text-h5">Archiwum wypożyczeń</h2>
      </v-col>
    </v-row>

    <v-list two-line>
      <v-list-item
        v-for="r in rentals"
        :key="r.id"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ r.client_first }} {{ r.client_last }} →
            {{ r.vehicles?.brand }} {{ r.vehicles?.model }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ r.start_date }} – {{ r.end_date }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-if="!rentals.length">
        <v-list-item-content>
          <v-list-item-title>— Brak archiwalnych wypożyczeń —</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup>
import { onMounted }   from 'vue'
import { storeToRefs } from 'pinia'
import { useRentalStore } from '@/stores/rentalStore'

const rentalStore = useRentalStore()
const { list: rentals, loading, error } = storeToRefs(rentalStore)

onMounted(async () => {
  await rentalStore.fetchArchived()
})
</script>
