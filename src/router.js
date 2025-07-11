import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Rental from '@/views/Rental.vue'
import Vehicles    from '@/views/rental/Vehicles.vue'
import Rentals     from '@/views/rental/Rentals.vue'
import Repairs     from '@/views/rental/Repairs.vue'
import Reservations from '@/views/rental/Reservations.vue'

const routes = [
  // 1. Główna ścieżka – dynamiczne przekierowanie
  {
    path: '/',
    redirect: () => {
      const { user } = useAuthStore()
      return user ? '/dashboard' : '/login'
    }
  },

  // 2. Trasa logowania (publiczna)
  {
    path: '/login',
    name: 'Login',
    component: Login
  },

  // 3. Dashboard (chronione)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },

{
  path: '/rental',
  name: 'Rental',           // <-- dopisz nazwę
  component: Rental,
  meta: { requiresAuth: true },
  children: [
    { path: 'vehicles',    name: 'Vehicles',    component: Vehicles },
    { path: 'rentals',     name: 'Rentals',     component: Rentals },
    { path: 'repairs',     name: 'Repairs',     component: Repairs },
    { path: 'reservations', name: 'Reservations', component: Reservations }
    // ...
  ]
},

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const { user } = useAuthStore()
  if (to.meta.requiresAuth && !user) return next({ name: 'Login' })
  if (to.name === 'Login' && user) return next({ name: 'Dashboard' })
  next()
})


export default router
