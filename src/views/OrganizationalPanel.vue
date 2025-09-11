<template>
  <v-app>
    <!-- Pasek górny -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon
        class="d-sm-none"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Sprawy organizacyjne</v-toolbar-title>
      <v-spacer class="d-none d-sm-flex" />

      <!-- Linki desktop -->
      <template v-if="$vuetify.display.smAndUp">
        <v-btn text to="/Dashboard">
          <v-icon start>mdi-home</v-icon>
          Strona główna
        </v-btn>
        <v-btn text to="/organizational/home">
          <v-icon>mdi-chart-line</v-icon>
          Podsumowanie
        </v-btn>
        <v-btn text to="/organizational/money-given">
          <v-icon start>mdi-cash-fast</v-icon>
          Pieniądze wręczone
        </v-btn>
        <v-btn text to="/organizational/todo">
          <v-icon start>mdi-format-list-checks</v-icon>
          Do zrobienia
        </v-btn>
        <v-btn text to="/organizational/done">
          <v-icon start>mdi-check-circle</v-icon>
          Zrobione
        </v-btn>
        <v-btn text to="/organizational/monthly-tasks">
          <v-icon start>mdi-calendar-month</v-icon>
          Miesięczne zadania
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
        <v-list-item to="/dashboard" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="blue">mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Strona główna</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/organizational/home" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="red">mdi-chart-line</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Podsumowanie</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/organizational/money-given" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="green">mdi-cash-fast</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Pieniądze wręczone</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/organizational/todo" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="orange">mdi-format-list-checks</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Do zrobienia</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/organizational/done" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="teal">mdi-check-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Zrobione</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/organizational/monthly-tasks" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="purple">mdi-calendar-month</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Miesięczne zadania</v-list-item-title>
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
