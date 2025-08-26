<script setup>
import { watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'



const router = useRouter()
const auth = useAuthStore()

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

</style>
