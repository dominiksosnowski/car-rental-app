import { createRouter, createWebHistory } from 'vue-router'
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
import ActiveRepairs  from '@/views/workshop/ActiveRepairs.vue'
import CompletedRepairs   from '@/views/workshop/CompletedRepairs.vue'
import WorkshopPayments    from '@/views/workshop/WorkshopPayments.vue'

// Nowy import modułu construction
import ConstructionLayout from '@/views/construction/ConstructionLayout.vue'
import Employees from '@/views/construction/Employees.vue'
import Timesheets from '@/views/construction/Timesheets.vue'
import Advances from '@/views/construction/Advances.vue'
import Payroll from '@/views/construction/Payroll.vue'
import ProjectsView from '@/views/construction/ProjectsView.vue'
import ProjectsDashboard from '@/views/construction/ProjectsDashboard.vue'

// Organizational
import OrganizationalPanel from '@/views/OrganizationalPanel.vue'
import OrganizationalHome from '@/views/organizational/OrganizationalHome.vue'
import OrganizationalTodo from '@/views/organizational/OrganizationalTodo.vue'
import OrganizationalMoneyGiven from '@/views/organizational/OrganizationalMoneyGiven.vue'
import OrganizationalDone from '@/views/organizational/OrganizationalDone.vue'
import OrganizationalMonthlyTasks from '@/views/organizational/OrganizationalMonthlyTasks.vue'

const routes = [
  {
    path: '/',
    redirect: () => {
      const { user } = useAuthStore()
      return user ? '/dashboard' : '/login'
    }
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },

  {
    path: '/rental',
    name: 'Rental',
    component: Rental,
    meta: { requiresAuth: true },
    redirect: '/rental/RentalDashboard',
    children: [
      { path: 'vehicles', name: 'Vehicles', component: Vehicles },
      { path: 'rentals', name: 'Rentals', component: Rentals },
      { path: 'repairs', name: 'Repairs', component: Repairs },
      { path: 'reservations', name: 'Reservations', component: Reservations },
      { path: 'ArchivedRentals', name: 'ArchivedRentals', component: ArchivedRentals },
      { path: 'RentalDashboard', name: 'RentalDashboard', component: RentalDashboard },
      { path: 'ArchivedVehicles', name: 'ArchivedVehicles', component: ArchivedVehicles }
    ]
  },

  {
    path: '/workshop',
    name: 'Workshop',
    component: Workshop,
    meta: { requiresAuth: true },
    redirect: '/workshop/WorkshopDashboard',
    children: [
      { path: 'WorkshopDashboard', name: 'WorkshopDashboard', component: WorkshopDashboard },
      { path: 'scheduled', name: 'WorkshopScheduled', component: WorkshopScheduled },
      { path: 'in-progress', name: 'ActiveRepairs', component: ActiveRepairs },
      { path: 'completed', name: 'CompletedRepairs', component: CompletedRepairs },
      { path: 'payments', name: 'WorkshopPayments', component: WorkshopPayments }
    ]
  },

// Nowy moduł construction
{
  path: '/construction',
  name: 'ConstructionLayout',
  component: ConstructionLayout,
  meta: { requiresAuth: true },

  // zmieniony redirect
  redirect: '/construction/projects-dashboard',

  children: [
    { path: 'employees', name: 'ConstructionEmployees', component: Employees },
    { path: 'timesheets', name: 'ConstructionTimesheets', component: Timesheets },

    // nowa trasa do dashboardu projektów
    { path: 'projects-dashboard', name: 'ProjectsDashboard', component: ProjectsDashboard },

    { path: 'projects', name: 'ProjectsView', component: ProjectsView },
    { path: 'advances', name: 'ConstructionAdvances', component: Advances },
    { path: 'payroll', name: 'ConstructionPayroll', component: Payroll }
  ]
},

  {
    path: '/organizational',
    name: 'OrganizationalPanel',
    component: OrganizationalPanel,
    meta: { requiresAuth: true },
    redirect: '/organizational/home',
    children: [
      { path: 'home', name: 'OrganizationalHome', component: OrganizationalHome },
      { path: 'todo', name: 'OrganizationalTodo', component: OrganizationalTodo },
      { path: 'money-given', name: 'OrganizationalMoneyGiven', component: OrganizationalMoneyGiven },
      { path: 'done', name: 'OrganizationalDone', component: OrganizationalDone },
      { path: 'monthly-tasks', name: 'OrganizationalMonthlyTasks', component: OrganizationalMonthlyTasks }
    ]
  },

  {
    path: '/restaurant',
    name: 'RestaurantLayout',
    meta: { requiresAuth: true },
    component: () => import('@/views/restaurant/RestaurantLayout.vue'),
    redirect: { name: 'RestaurantEvents' },
    children: [
      { path: 'events', name: 'RestaurantEvents', component: () => import('@/views/restaurant/RestaurantEvents.vue') },
      { path: 'past', name: 'RestaurantPast', component: () => import('@/views/restaurant/RestaurantPast.vue') }
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/' }
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
