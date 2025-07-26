<template>
  <v-container fluid class="pa-8">
    <v-row justify="center" align="stretch" dense>
      <!-- Kafelek do Wypożyczalni -->
      <v-col cols="12" md="4">
        <v-card
          class="pa-4"
          outlined
          hover
          @click="goTo('Rental')"
        >
          <v-card-title class="headline">
            <v-icon left color="primary">mdi-car</v-icon>
            Wypożyczalnia
          </v-card-title>
          <v-card-text>
            Przejdź do panelu zarządzania wypożyczeniami
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary">Otwórz →</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Kafelek do Warsztatu -->
      <v-col cols="12" md="4">
        <v-card
          class="pa-4"
          outlined
          hover
          @click="goTo('Workshop')"
        >
          <v-card-title class="headline">
            <v-icon left color="orange">mdi-wrench</v-icon>
            Warsztat
          </v-card-title>
          <v-card-text>
            Przejdź do panelu zarządzania naprawami
          </v-card-text>
          <v-card-actions>
            <v-btn text color="orange">Otwórz →</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

function goTo(name: string) {
  router.push({ name })
}
</script>
