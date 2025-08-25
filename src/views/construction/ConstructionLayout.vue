<template>
  <v-app>
    <!-- Pasek górny -->
    <v-app-bar app color="primary" dark>
      <!-- Ikona menu dla mobile -->
      <v-app-bar-nav-icon
        class="d-sm-none"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Budowlanka</v-toolbar-title>
      <v-spacer class="d-none d-sm-flex" />

      <!-- Linki desktop -->
      <template v-if="$vuetify.display.smAndUp">
        <v-btn text to="/Dashboard">
          <v-icon start>mdi-home</v-icon>
          Strona główna
        </v-btn>

        <v-btn text :to="{ name: 'ProjectsDashboard' }">
          <v-icon start>mdi-view-dashboard</v-icon>
          Podsumowanie projektów
        </v-btn>

        <v-btn text :to="{ name: 'ConstructionTimesheets' }">
          <v-icon start>mdi-calendar-clock</v-icon>
          Czas pracy
        </v-btn>

        <!-- NOWY przycisk: Dashboard projektów -->


        <!-- Projekty (lista/zarządzanie) -->
        <v-btn text :to="{ name: 'ProjectsView' }">
          <v-icon start>mdi-briefcase</v-icon>
          Projekty
        </v-btn>

        <v-btn text :to="{ name: 'ConstructionAdvances' }">
          <v-icon start>mdi-cash-fast</v-icon>
          Zaliczki
        </v-btn>
        <v-btn text :to="{ name: 'ConstructionPayroll' }">
          <v-icon start>mdi-cash</v-icon>
          Wypłaty
        </v-btn>
        <v-btn text :to="{ name: 'ConstructionEmployees' }">
          <v-icon start>mdi-account-group</v-icon>
          Pracownicy
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

        <v-list-item :to="{ name: 'ProjectsDashboard' }" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="indigo">mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Podsumowanie projektów</v-list-item-title>
        </v-list-item>

        <v-list-item :to="{ name: 'ConstructionTimesheets' }" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="blue">mdi-calendar-clock</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Czas pracy</v-list-item-title>
        </v-list-item>

        <!-- NOWA pozycja: Dashboard projektów -->


        <!-- Projekty (lista/zarządzanie) -->
        <v-list-item :to="{ name: 'ProjectsView' }" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="teal">mdi-briefcase</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Projekty</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item :to="{ name: 'ConstructionAdvances' }" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="orange">mdi-cash-fast</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Zaliczki</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item :to="{ name: 'ConstructionPayroll' }" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="green">mdi-cash</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Wypłaty</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item :to="{ name: 'ConstructionEmployees' }" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="purple">mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Pracownicy</v-list-item-title>
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
