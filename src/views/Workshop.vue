<template>
    <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Warsztat</v-toolbar-title>
      <v-spacer/>
      <v-btn text to="/Dashboard">Strona główna</v-btn>
      <v-btn text to="/workshop/WorkshopDashboard">Podsumowanie</v-btn>
      <v-btn text to="/workshop/completed">Zakończone naprawy</v-btn>
      <v-btn text to="/workshop/in-progress">Aktualne naprawy</v-btn>
      <v-btn text to="/workshop/payments">Płatności</v-btn>
      <v-btn text to="/workshop/scheduled">Umówione pojazdy</v-btn>
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


// zapewnij, że aktualna zakładka jest wyróżniona przy odświeżeniu

</script>
