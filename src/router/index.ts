import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: () => ({ name: 'member-login' }), // fallback; guard below overrides by role
    },
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
      path: '/register',
      name: 'member-register',
      component: () => import('../pages/MemberRegisterView.vue'),
      meta: { requiresAuth: false },
    },

    {
      path: '/admin',
      name: 'admin',
      component: () => import('../pages/AdminPage.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          name: 'admin-dashboard',
          path: '',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { requiresAuth: true, role: 'admin' },
        },
        {
          name: 'admin-services',
          path: 'services',
          component: () => import('../views/admin/ServicesView.vue'),
          meta: { requiresAuth: true, role: 'admin' },
        },
        {
          name: 'admin-applications',
          path: 'applications',
          component: () => import('../views/admin/ApplicationsView.vue'),
          meta: { requiresAuth: true, role: 'admin' },
        },
        {
          name: 'admin-announcements',
          path: 'announcements',
          component: () => import('../views/admin/AnnouncementsView.vue'),
          meta: { requiresAuth: true, role: 'admin' },
        },
        {
          name: 'admin-activity',
          path: 'activity-logs',
          component: () => import('../views/admin/ActivityLogsView.vue'),
          meta: { requiresAuth: true, role: 'admin' },
        },
        {
          name: 'admin-appointments',
          path: 'appointments',
          component: () => import('../views/admin/AppointmentsView.vue'),
          meta: { requiresAuth: true, role: 'admin' },
        },
      ],
    },

    {
      path: '/member',
      name: 'member',
      component: () => import('../pages/MemberPage.vue'),
      meta: { requiresAuth: true, role: 'member' },
      children: [
        {
          name: 'member-dashboard',
          path: '',
          component: () => import('../views/pwd/MemberDashboardView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
        {
          name: 'member-services',
          path: 'services',
          component: () => import('../views/pwd/MemberServicesView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
        {
          path: 'status',
          name: 'member-status',
          component: () => import('../views/pwd/MemberApplicationStatusView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
        {
          path: 'appointments',
          name: 'member-appointments',
          component: () => import('../views/pwd/MemberAppointmentView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
        {
          path: 'account',
          component: () => import('../views/pwd/MemberAccountView.vue'),
          meta: { requiresAuth: true, role: 'member' },
          children: [
            {
              path: '',
              name: 'member-profile',
              component: () => import('../views/pwd/MemberProfileView.vue'),
            },
            {
              path: 'edit',
              name: 'member-edit-profile',
              component: () => import('../views/pwd/MemberEditProfileView.vue'),
            },
            {
              path: 'password',
              name: 'member-change-password',
              component: () => import('../views/pwd/MemberChangePasswordView.vue'),
            },
          ],
        },
        {
          path: 'support',
          name: 'member-help',
          component: () => import('../views/pwd/MemberHelpAndSupportView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
        {
          path: 'accessibility',
          name: 'member-settings',
          component: () => import('../views/pwd/MemberAccessibilitySettingsView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
        {
          path: 'announcements',
          name: 'member-announcements',
          component: () => import('../views/pwd/MemberAnnouncementView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
        {
          path: 'history',
          name: 'member-history',
          component: () => import('../views/pwd/MemberHistoryView.vue'),
          meta: { requiresAuth: true, role: 'member' },
        },
      ],
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.checkAuth()
  const requiresAuth = to.meta.requiresAuth !== false
  const role = to.meta.role

  // Root path: redirect by role if valid token, else to login
  if (to.path === '/' || to.name === 'root') {
    if (!authStore.isAuthenticated) {
      next({ name: 'member-login' })
      return
    }
    const userRole = authStore.user?.role
    if (userRole === 'admin') {
      next({ path: '/admin' })
      return
    }
    if (userRole === 'member') {
      next({ path: '/member' })
      return
    }
    next({ name: 'member-login' })
    return
  }

  // If trying to access login pages while authenticated, redirect to appropriate dashboard
  if (to.name === 'admin-login' && authStore.isAuthenticated) {
    const userRole = authStore.user?.role
    if (userRole === 'admin') {
      next({ path: '/admin' })
      return
    }
    if (userRole === 'member') {
      next({ path: '/member' })
      return
    }
  }

  if (to.name === 'member-login' && authStore.isAuthenticated) {
    const userRole = authStore.user?.role
    if (userRole === 'admin') {
      next({ path: '/admin' })
      return
    }
    if (userRole === 'member') {
      next({ path: '/member' })
      return
    }
  }

  // Check if route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'member-login' })
    return
  }

  // Check role-based access
  if (role) {
    const userRole = authStore.user?.role
    if (!userRole || userRole !== role) {
      // User doesn't have required role, redirect based on their actual role
      if (userRole === 'admin') {
        next({ path: '/admin' })
        return
      }
      if (userRole === 'member') {
        next({ path: '/member' })
        return
      }
      next({ name: 'member-login' })
      return
    }
  }

  // All checks passed, allow navigation
  next()
})

export default router
