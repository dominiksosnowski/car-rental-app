<script setup>
import { watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { requestPermissionAndToken, listenForMessages, enableTokenAutoRefresh } from './firebase';


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

let fcmInitialized = false;

watch(
  () => auth.user,
  async (user) => {
    const { name } = router.currentRoute.value;

    if (name === 'Login' && user) {
      router.push({ name: 'Dashboard' });
    }
    if (name === '/') {
      router.replace(user ? '/dashboard' : '/login');
    }

    // 🔹 Inicjalizacja FCM tylko po zalogowaniu i tylko raz
    if (user && !fcmInitialized) {
      fcmInitialized = true;
      await requestPermissionAndToken();
      listenForMessages();
      enableTokenAutoRefresh();
    }
  },
  { immediate: true }
);

</script>

<template>

        
          <router-view />
    


</template>

<style scoped>

</style>
