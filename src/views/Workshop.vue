<template>
  <v-app>
    <!-- Pasek górny -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon
        class="d-sm-none"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Warsztat</v-toolbar-title>
      <v-spacer class="d-none d-sm-flex" />

      <!-- Linki desktop -->
      <template v-if="$vuetify.display.smAndUp">
        <v-btn text to="/Dashboard">
          <v-icon start>mdi-home</v-icon>
          Strona główna
        </v-btn>
        <v-btn text to="/workshop/WorkshopDashboard">
          <v-icon start>mdi-chart-line</v-icon>
          Podsumowanie
        </v-btn>
        <v-btn text to="/workshop/in-progress">
          <v-icon start>mdi-wrench-clock</v-icon>
          Aktualne naprawy
        </v-btn>
        <v-btn text to="/workshop/payments">
          <v-icon start>mdi-cash-multiple</v-icon>
          Płatności
        </v-btn>
        <v-btn text to="/workshop/scheduled">
          <v-icon start>mdi-calendar-clock</v-icon>
          Umówione pojazdy
        </v-btn>
        <v-btn text to="/workshop/completed">
          <v-icon start>mdi-check-circle</v-icon>
          Zakończone naprawy
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

        <v-list-item to="/workshop/WorkshopDashboard" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="purple">mdi-chart-line</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Podsumowanie</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/workshop/in-progress" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="orange">mdi-wrench-clock</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Aktualne naprawy</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/workshop/payments" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="green">mdi-cash-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Płatności</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/workshop/scheduled" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="teal">mdi-calendar-clock</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Umówione pojazdy</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/workshop/completed" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="red">mdi-check-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Zakończone naprawy</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Główna treść -->
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
