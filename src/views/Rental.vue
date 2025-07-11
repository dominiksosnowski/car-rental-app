<template>
  <div class="rental-container">
    <nav class="rental-nav">
      <button @click="go('Dashboard')">Strona główna</button>
      <button @click="go('Vehicles')">Pojazdy</button>
      <button @click="go('Rentals')">Wypożyczenia</button>
      <button @click="go('Repairs')">Naprawy</button>
      <button @click="go('Reservations')">Rezerwacje</button>
    </nav>

    <section class="rental-content">
      <router-view />
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function go(name) {
  router.push({ name })
}
</script>

<style scoped>
.rental-container { display: flex; flex-direction: column; }

.rental-nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
}

.rental-nav button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.rental-content {
  padding: 1rem;
}
</style>
