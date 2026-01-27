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
      path: '/register',
      name: 'member-register',
      component: () => import('../pages/MemberRegisterView.vue'),
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
          path: 'status',
          name: 'member-status',
          component: () => import('../views/pwd/MemberApplicationStatusView.vue'),
        },
        {
          path: 'appointments',
          name: 'member-appointments',
          component: () => import('../views/pwd/MemberAppointmentView.vue'),
        },
        {
          path: 'account',
          component: () => import('../views/pwd/MemberAccountView.vue'),
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
        },
        {
          path: 'accessibility',
          name: 'member-settings',
          component: () => import('../views/pwd/MemberAccessibilitySettingsView.vue'),
        },
        {
          path: 'announcements',
          name: 'member-announcements',
          component: () => import('../views/pwd/MemberAnnouncementView.vue'),
        },
        {
          path: 'history',
          name: 'member-history',
          component: () => import('../views/pwd/MemberHistoryView.vue'),
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
    next({ name: 'member-login' })
  } else if (to.name === 'admin-login' && authStore.isAuthenticated) {
    next({ name: 'admin' })
  } else if (to.name === 'member-login' && authStore.isAuthenticated) {
    next({ name: 'member' })
  } else {
    next()
  }
})

export default router
