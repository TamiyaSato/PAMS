import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../pages/AdminLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/member/login',
      name: 'member-login',
      component: () => import('../pages/MemberLoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../pages/AdminPage.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../views/admin/DashboardView.vue'),
        },
        {
          path: 'services',
          component: () => import('../views/admin/ServicesView.vue'),
        },
        {
          path: 'applications',
          component: () => import('../views/admin/ApplicationsView.vue'),
        },
        {
          path: 'announcements',
          component: () => import('../views/admin/AnnouncementsView.vue'),
        },
        {
          path: 'activity-logs',
          component: () => import('../views/admin/ActivityLogsView.vue'),
        },
        {
          path: 'appointments',
          component: () => import('../views/admin/AppointmentsView.vue'),
        },
      ],
    },
    {
      path: '/member',
      name: 'member',
      component: () => import('../pages/MemberPage.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('../views/pwd/MemberDashboardView.vue'),
        },
        {
          path: 'services',
          component: () => import('../views/pwd/MemberServicesView.vue'),
        },
        {
          path: 'applications',
          component: () => import('../views/admin/ApplicationsView.vue'),
        },
        {
          path: 'announcements',
          component: () => import('../views/admin/AnnouncementsView.vue'),
        },
        {
          path: 'activity-logs',
          component: () => import('../views/admin/ActivityLogsView.vue'),
        },
        {
          path: 'appointments',
          component: () => import('../views/admin/AppointmentsView.vue'),
        },
      ],
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'member-login' })
  } else if (to.name === 'admin-login' && authStore.isAuthenticated) {
    // Redirect to home if already authenticated and trying to access login
    next({ name: 'admin' })
  } else if (to.name === 'member-login' && authStore.isAuthenticated) {
    // Redirect to home if already authenticated and trying to access login
    next({ name: 'member' })
  } else {
    next()
  }
})

export default router
