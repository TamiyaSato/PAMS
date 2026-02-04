<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import pamsLogo from '@/assets/PAMS.png'

const authStore = useAuthStore()
const router = useRouter()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const logoutDialog = ref(false)

const handleLogout = () => {
  logoutDialog.value = false
  localStorage.removeItem('authToken')
  authStore.logout()
  router.push('/member/login')
}

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth) {
      logoutDialog.value = false
    }
  },
)
</script>

<template>
  <v-layout>
    <v-navigation-drawer
      permanent
      rail
      expand-on-hover
      width="280"
      rail-width="72"
      class="member-drawer"
    >
      <div class="logo-section">
        <img :src="pamsLogo" alt="PAMS Logo" class="logo-image" />
      </div>

      <v-list nav class="menu-list">
        <v-list-item
          to="/member/"
          prepend-icon="dashboard"
          title="Dashboard"
          exact
          class="menu-item"
        />

        <v-list-item
          to="/member/services"
          prepend-icon="inventory_2"
          title="Apply for Services"
          class="menu-item"
        />

        <v-list-item
          to="/member/status"
          prepend-icon="assignment"
          title="Application Status"
          class="menu-item"
        />

        <v-list-item
          to="/member/history"
          prepend-icon="edit"
          title="History & Documents"
          class="menu-item"
        />

        <v-list-item
          to="/member/announcements"
          prepend-icon="mail"
          title="Announcements"
          class="menu-item"
        />

        <v-list-item
          to="/member/accessibility"
          prepend-icon="accessibility"
          title="Accessibility Settings"
          class="menu-item"
        />

        <v-list-item
          to="/member/support"
          prepend-icon="help"
          title="Help & Support"
          class="menu-item"
        />

        <v-list-item
          to="/member/appointments"
          prepend-icon="event"
          title="Appointments & Schedule"
          class="menu-item"
        />

        <v-list-item
          to="/member/account"
          prepend-icon="person"
          title="My Account"
          class="menu-item"
        />
      </v-list>

      <v-list class="logout-list">
        <v-list-item
          prepend-icon="logout"
          title="Logout"
          class="logout-item"
          @click="logoutDialog = true"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-app-bar flat title="Overview" />

      <v-dialog v-if="isAuthenticated" v-model="logoutDialog" max-width="420" persistent>
        <v-card class="logout-card">
          <v-card-title class="logout-title"> Confirm Logout </v-card-title>

          <v-card-text class="logout-text"> Are you sure you want to log out? </v-card-text>

          <v-card-actions class="logout-actions">
            <div class="logout-btn-wrapper">
              <v-btn class="btn-no" @click="logoutDialog = false"> NO </v-btn>
              <v-btn class="btn-yes" @click="handleLogout"> YES </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <RouterView />
    </v-main>
  </v-layout>
</template>

<style scoped>
.member-drawer {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  font-family: 'Inter', sans-serif;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px;
}

.logo-text {
  font-weight: 800;
  font-size: 18px;
  color: #0b1b5a;
}

.menu-list {
  padding-top: 6px;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 10px;
  color: #6b7280;
}

:deep(.menu-item .v-icon) {
  color: #9ca3af;
}

:deep(.menu-item.v-list-item--active) {
  background: #f0f7ff;
  color: #2563eb;
}
:deep(.v-navigation-drawer--rail .v-icon) {
  transform: translateX(-5px);
}

.logout-item {
  color: #444242;
}

.logout-card {
  border-radius: 14px;
  padding: 18px 12px;
}

.logout-title {
  text-align: center;
  font-weight: 700;
  font-size: 18px;
  padding-bottom: 6px;
}

.logout-text {
  text-align: center;
  font-size: 14px;
  color: #0e0d0d;
  margin-top: 4px;
}

.logout-actions {
  justify-content: center !important;
  padding-bottom: 18px;
}

.logout-btn-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.btn-no {
  background-color: #e0e0e0;
  color: #333;
  border-radius: 999px;
  min-width: 90px;
  height: 36px;
  font-weight: 600;
}

.btn-yes {
  background-color: #f5c400;
  color: #000;
  border-radius: 999px;
  min-width: 90px;
  height: 36px;
  font-weight: 600;
}
.logo-image {
  height: 130px;
  width: auto;
  object-fit: contain;
}
</style>
