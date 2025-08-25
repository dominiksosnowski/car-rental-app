<template>
  <v-app>
    <!-- Pasek górny -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon
        class="d-sm-none"
        @click="drawer = !drawer"
      />
      <v-toolbar-title>Leśna Resto-Bar</v-toolbar-title>
      <v-spacer class="d-none d-sm-flex" />

      <!-- Linki desktop -->
      <template v-if="$vuetify.display.smAndUp">
        <v-btn text to="/Dashboard">
          <v-icon start>mdi-home</v-icon>
          Strona główna
        </v-btn>
        <v-btn text to="/restaurant/events">
          <v-icon start>mdi-party-popper</v-icon>
          Przyszłe imprezy
        </v-btn>
        <v-btn text to="/restaurant/past">
          <v-icon start>mdi-archive</v-icon>
          Archiwalne imprezy
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Menu boczne (mobilne) -->
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

    <v-list-item to="/restaurant/events" @click="drawer = false">
      <v-list-item-icon>
        <v-icon color="green">mdi-party-popper</v-icon>
      </v-list-item-icon>
      <v-list-item-title>Przyszłe imprezy</v-list-item-title>
    </v-list-item>

    <v-divider class="my-2" />

    <v-list-item to="/restaurant/past" @click="drawer = false">
      <v-list-item-icon>
        <v-icon color="deep-orange">mdi-archive</v-icon>
      </v-list-item-icon>
      <v-list-item-title>Archiwalne imprezy</v-list-item-title>
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const drawer = ref(false)
const tab = ref(0)

watch(() => route.name, (n) => {
  tab.value = n === 'RestaurantPast' ? 1 : 0
}, { immediate: true })
</script>
