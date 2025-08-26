<template>
  <v-container fluid class="pa-8">
    <v-row justify="center" align="stretch" class="cards-row">
      <v-col
        v-for="card in visibleCards"
        :key="card.title"
        cols="12"
        sm="6"
        md="3"
        class="d-flex"
      >
        <v-card
          class="pa-0 overflow-hidden flex-grow-1"
          outlined
          hover
          @click="goTo(card.route)"
        >
          <!-- HERO -->
          <div class="d-flex justify-center">
            <v-img
              :src="card.img"
              height="160"
              contain
              class="my-4"
            />
          </div>

          <!-- KOLOROWA SEKCJA TEKSTOWA -->
          <div class="card-body" :style="{ backgroundColor: card.color }">
            <v-card-title class="headline pt-3 text-white">
              <v-icon left color="white">{{ card.icon }}</v-icon>
              {{ card.title }}
            </v-card-title>
            <v-card-text class="text-white">
              {{ card.text }}
            </v-card-text>
            <v-card-actions>
              <v-btn variant="flat" text color="white">Otwórz</v-btn>
            </v-card-actions>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// function goTo(name: string) {
//   router.push({ name })
// }

async function goTo(name: string) {
  try {
    // Wyślij powiadomienie do adminów
      await fetch("/.netlify/functions/send-to-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    console.log("Wysłano powiadomienie")
  } catch (err) {
    console.error("Błąd wysyłki powiadomienia:", err);
  }

  // Przejdź do wybranej trasy
  router.push({ name });
}


const cards = [
  { title: 'Wypożyczalnia', icon: 'mdi-car', color: '#1976d2', img: '/logos/rental.png', route: 'Rental', text: 'Przejdź do panelu zarządzania wypożyczeniami' },
  { title: 'Warsztat', icon: 'mdi-wrench', color: '#fb8c00', img: '/logos/workshop.png', route: 'Workshop', text: 'Przejdź do panelu zarządzania naprawami' },
  { title: 'Budowlanka', icon: 'mdi-account-hard-hat-outline', color: '#43a047', img: '/logos/construction.png', route: 'ConstructionLayout', text: 'Przejdź do panelu budowlanego' },
  { title: 'Leśna', icon: 'mdi-silverware-fork-knife', color: '#8e24aa', img: '/logos/restaurant.png', route: 'RestaurantLayout', text: 'Przejdź do panelu imprez' },
  { title: 'Dominik', icon: 'mdi-format-list-checks', color: '#e53935', img: '/logos/ToDo.png', route: 'DominikLayout', text: 'Przejdź do panelu zadań' }
]

// Mapowanie: email -> dozwolone tytuły kart
const emailAccessMap: Record<string, string[]> = {
  'dominiksosnowski14@gmail.com': cards.map(c => c.title), // pełny dostęp
  'dominik.rakowiec@op.pl': cards.map(c => c.title),       // pełny dostęp
  'lesnaresto@gmail.com': ['Leśna']                        // tylko panel restauracji
}

const visibleCards = computed(() => {
  const email = authStore.user?.email || ''
  const allowedTitles = emailAccessMap[email] || []
  return cards.filter(c => allowedTitles.includes(c.title))
})


</script>

<style scoped>
.cards-row {
  gap: 32px; /* odstęp między kolumnami */
}

.v-card {
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

.v-card:hover {
  transform: translateY(-4px);
}

.card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 8px;
}
</style>
