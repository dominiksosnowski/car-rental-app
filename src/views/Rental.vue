<template>
    <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Wypożyczalnia</v-toolbar-title>
      <v-spacer/>
      <v-btn text to="/Dashboard">Strona główna</v-btn>
      <v-btn text to="/rental/RentalDashboard">Podsumowanie</v-btn>
      <v-btn text to="/rental/Vehicles">Pojazdy</v-btn>
      <v-btn text to="/rental/Rentals">Wypożyczenia</v-btn>
      <v-btn text to="/rental/Repairs">Naprawy</v-btn>
      <v-btn text to="/rental/Reservations">Rezerwacje</v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-fade-transition mode="out-in">
          <router-view/>
        </v-fade-transition>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function go(name) {
  router.push({ name })
}
</script>

<style scoped>

</style>
