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
import ArchivedRentals from '@/views/rental/ArchivedRentals.vue'
import RentalDashboard from '@/views/rental/RentalDashboard.vue'
import ArchivedVehicles from '@/views/rental/ArchivedVehicles.vue'

import Workshop from '@/views/Workshop.vue'
import WorkshopDashboard from '@/views/workshop/WorkshopDashboard.vue'
import WorkshopScheduled   from '@/views/workshop/WorkshopScheduled.vue'
import WorkshopInProgress  from '@/views/workshop/WorkshopInProgress.vue'
import WorkshopCompleted   from '@/views/workshop/WorkshopCompleted.vue'
import WorkshopPayments    from '@/views/workshop/WorkshopPayments.vue'

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
  redirect: '/rental/RentalDashboard',
  children: [
    { path: 'vehicles',    name: 'Vehicles',    component: Vehicles },
    { path: 'rentals',     name: 'Rentals',     component: Rentals },
    { path: 'repairs',     name: 'Repairs',     component: Repairs },
    { path: 'reservations', name: 'Reservations', component: Reservations},
    {path: 'ArchivedRentals',name: 'ArchivedRentals',component: ArchivedRentals},
    {path: 'RentalDashboard',name: 'RentalDashboard',component: RentalDashboard},
    {path: 'ArchivedVehicles',name: 'ArchivedVehicles',component: ArchivedVehicles}
    // ...
  ]
},
  {
    path: '/workshop',
    name: 'Workshop',
    component: Workshop,
    meta: { requiresAuth: true },
    redirect: '/workshop/WorkshopDashboard',
    children: [
      {
        path: 'WorkshopDashboard',
        name: 'WorkshopDashboard',
        component: WorkshopDashboard
      },
      {
        path: 'scheduled',
        name: 'WorkshopScheduled',
        component: WorkshopScheduled
      },
      {
        path: 'in-progress',
        name: 'WorkshopInProgress',
        component: WorkshopInProgress
      },
      {
        path: 'completed',
        name: 'WorkshopCompleted',
        component: WorkshopCompleted
      },
      {
        path: 'payments',
        name: 'WorkshopPayments',
        component: WorkshopPayments
      },

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
