<template>
  <v-app>
    <!-- Pasek górny -->
    <v-app-bar app color="primary" dark>
      <!-- Ikona menu dla mobile -->
      <v-app-bar-nav-icon
        class="d-sm-none"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Do zrobienia</v-toolbar-title>
      <v-spacer class="d-none d-sm-flex" />

      <!-- Linki desktop -->
      <template v-if="$vuetify.display.smAndUp">
        <v-btn text to="/Dashboard">
          <v-icon start>mdi-home</v-icon>
          Strona główna
        </v-btn>
        <v-btn text to="/dominik/tasks">
          <v-icon start>mdi-playlist-edit</v-icon>
          Do zrobienia
        </v-btn>
        <v-btn text to="/dominik/done">
          <v-icon start>mdi-check-circle</v-icon>
          Ukończone
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

        <v-list-item to="/dominik/tasks" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="orange">mdi-playlist-edit</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Do zrobienia</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item to="/dominik/done" @click="drawer = false">
          <v-list-item-icon>
            <v-icon color="green">mdi-check-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Ukończone</v-list-item-title>
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
