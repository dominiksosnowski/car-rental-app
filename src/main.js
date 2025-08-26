import { createApp } from 'vue'
import App from './App.vue'

// 🛠️ Stan aplikacji
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

// 🧭 Router
import router from '@/router'

// 🎨 Vuetify
import { createVuetify } from 'vuetify'
import * as components   from 'vuetify/components'
import * as directives   from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { pl } from 'vuetify/locale'

// 📅 Kalendarz
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

// 🔧 Inicjalizacja aplikacji
const app = createApp(App)

// 📦 Stan
const pinia = createPinia()
app.use(pinia)

// 🎨 Motyw i komponenty
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

// 🔐 Autoryzacja
const authStore = useAuthStore()
authStore.init()

// 🔌 Pluginy
app.use(router)
app.use(vuetify)
app.use(VCalendar, {}) // 📅 Globalna rejestracja komponentu kalendarza

// 🚀 Start
app.mount('#app')


