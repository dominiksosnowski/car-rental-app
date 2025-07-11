<template>
  <div>
    <p >
      naprawy
    </p>
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
</script>