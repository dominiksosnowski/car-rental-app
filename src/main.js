import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Inicjalizacja stanu zalogowania
const authStore = useAuthStore()
authStore.init()

app.use(router)
app.mount('#app')
