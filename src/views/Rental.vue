<template>
  <v-app>
    <!-- Pasek górny -->
    <v-app-bar app color="primary" dark>
      <!-- Ikona menu dla mobile -->
      <v-app-bar-nav-icon
        class="d-sm-none"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Wypożyczalnia</v-toolbar-title>
      <v-spacer class="d-none d-sm-flex" />

      <!-- Linki desktop -->
      <template v-if="$vuetify.display.smAndUp">
        <v-btn text to="/Dashboard">
          <v-icon start>mdi-home</v-icon>
          Strona główna
        </v-btn>
        <v-btn text to="/rental/RentalDashboard">
          <v-icon start>mdi-chart-line</v-icon>
          Podsumowanie
        </v-btn>
        <v-btn text to="/rental/Vehicles">
          <v-icon start>mdi-car</v-icon>
          Pojazdy
        </v-btn>
        <v-btn text to="/rental/Rentals">
          <v-icon start>mdi-key-chain</v-icon>
          Wypożyczenia
        </v-btn>
        <v-btn text to="/rental/Payments">
          <v-icon start>mdi-cash-multiple</v-icon>
          Płatności
        </v-btn>
        <v-btn text to="/rental/Repairs">
          <v-icon start>mdi-wrench</v-icon>
          Naprawy
        </v-btn>
        <v-btn text to="/rental/Reservations">
          <v-icon start>mdi-calendar-check</v-icon>
          Rezerwacje
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Drawer mobilny -->
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      class="d-sm-none"
    >
      <v-list nav density="comfortable">
        <v-list-item to="/Dashboard" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="blue">mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Strona główna</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/rental/RentalDashboard" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="purple">mdi-chart-line</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Podsumowanie</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/rental/Vehicles" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="teal">mdi-car</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Pojazdy</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/rental/Rentals" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="orange">mdi-key-chain</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Wypożyczenia</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/rental/Payments" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="green">mdi-cash-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Płatności</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/rental/Repairs" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="red">mdi-wrench</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Naprawy</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/rental/Reservations" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="green">mdi-calendar-check</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Rezerwacje</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Główna zawartość -->
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
import { ref } from 'vue'

const drawer = ref(false)
</script>
