<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <button @click="goRental">Przejdź do Wypożyczalni</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goRental() {
  router.push({ path: '/rental' })
}
</script>

<style scoped>
.dashboard { text-align: center; margin-top: 2rem; }
button    { padding: 0.5rem 1rem; font-size: 1rem; }
</style>
