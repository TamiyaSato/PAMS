<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import pamsLogo from '@/assets/PAMS Logo 2.png'

const authStore = useAuthStore()
const router = useRouter()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const logoutDialog = ref(false)
const displayName = computed(() => {
  const u = authStore.user
  if (!u) return ''
  return u.username || u.email || ''
})

const handleLogout = () => {
  logoutDialog.value = false
  localStorage.removeItem('authToken')
  authStore.logout()
  router.push('/admin/login')
}

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth) logoutDialog.value = false
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
      class="admin-drawer"
    >
      <div class="logo-section">
        <img :src="pamsLogo" alt="PAMS Logo" class="logo-image" />
      </div>

      <v-list nav class="menu-list">
        <v-list-item
          to="/admin"
          prepend-icon="dashboard"
          title="Dashboard"
          exact
          class="menu-item"
        />

        <v-list-item
          to="/admin/services"
          prepend-icon="inventory_2"
          title="Services"
          class="menu-item"
        />

        <v-list-item
          to="/admin/applications"
          prepend-icon="description"
          title="Applications"
          class="menu-item"
        />

        <v-list-item
          to="/admin/announcements"
          prepend-icon="campaign"
          title="Announcements"
          class="menu-item"
        />

        <v-list-item
          to="/admin/activity-logs"
          prepend-icon="bar_chart"
          title="Activity Logs"
          class="menu-item"
        />

        <v-list-item
          to="/admin/appointments"
          prepend-icon="event"
          title="Appointments & Schedule"
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
      <v-app-bar flat title="PAMS">
        <template #append>
          <label
            style="font-size: small; font-weight: 600; font-family: Inter, sans-serif"
            v-if="displayName"
            class="user-display"
            >Logged in: {{ displayName }}</label
          >
        </template>
      </v-app-bar>

      <v-dialog v-if="isAuthenticated" v-model="logoutDialog" max-width="420" persistent>
        <v-card class="logout-card">
          <v-card-title class="logout-title">Confirm Logout</v-card-title>
          <v-card-text class="logout-text"> Are you sure you want to log out? </v-card-text>

          <v-card-actions class="logout-actions">
            <div class="logout-btn-wrapper">
              <v-btn class="btn-no" @click="logoutDialog = false">NO</v-btn>
              <v-btn class="btn-yes" @click="handleLogout">YES</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <RouterView />
    </v-main>
  </v-layout>
</template>

<style scoped>
.admin-drawer {
  background: #0a1551;
  font-family: 'Inter', sans-serif;
}

.logo-section {
  display: flex;
  justify-content: center;
  padding: 22px 20px;
}

.logo-image {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.menu-list {
  padding-top: 6px;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 10px;
  color: #ffffff;
}

:deep(.menu-item .v-icon) {
  color: #ffffff;
}

:deep(.menu-item.v-list-item--active) {
  background: rgba(255, 255, 255, 0.12);
}

:deep(.v-navigation-drawer--rail .v-icon) {
  transform: translateX(-5px);
}

.logout-item {
  color: #ffffff;
}

.logout-card {
  border-radius: 14px;
  padding: 18px 12px;
}

.logout-title {
  text-align: center;
  font-weight: 700;
  font-size: 18px;
}

.logout-text {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.logout-actions {
  justify-content: center !important;
  padding-bottom: 18px;
}

.logout-btn-wrapper {
  display: flex;
  gap: 16px;
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

.user-display {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}
</style>
