<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()
console.log(auth.user)
watch(
  () => auth.user,
  (user) => {
    const { name } = router.currentRoute.value
    if (name === 'Login' && user) {
      router.push({ name: 'Dashboard' })
    }
    if (name === '/') {
      router.replace(user ? '/dashboard' : '/login')
    }
  }
)


</script>

<template>
  <router-view />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
