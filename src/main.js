import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import router from '@/router'


import { createVuetify } from 'vuetify'
import * as components   from 'vuetify/components'
import * as directives   from 'vuetify/directives'
import 'vuetify/styles'   // globalne style vuetify
import '@mdi/font/css/materialdesignicons.css'
import { pl } from 'vuetify/locale'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const vuetify = createVuetify({
  components,
  directives,
    locale: {
    locale: 'pl',
    messages: { pl }
  },
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary:   '#1976D2',
          secondary: '#424242',
          accent:    '#82B1FF',
        }
      }
    }
  }
})

// Inicjalizacja stanu zalogowania
const authStore = useAuthStore()
authStore.init()


app.use(router)
app.use(vuetify)
app.mount('#app')
