<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const logoutDialog = ref(false)

const handleLogout = () => {
  logoutDialog.value = false
  localStorage.removeItem('authToken')
  authStore.logout()
  router.push('/admin/login')
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
    <v-navigation-drawer expand-on-hover permanent rail color="#0a1551">
      <v-list>
        <v-list-item
          prepend-avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRUcux_QhsmbgtdjMe3q2djMPS2oKtPYUAEw&s"
          subtitle="Administrator"
          title="Bongo Cat"
        />
      </v-list>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item prepend-icon="dashboard" title="Dashboard" to="/dashboard" />
        <v-list-item prepend-icon="inventory_2" title="Services" to="/services" />
        <v-list-item prepend-icon="description" title="Applications" to="/applications" />
        <v-list-item prepend-icon="campaign" title="Announcements" to="/announcements" />
        <v-list-item prepend-icon="bar_chart" title="Activity Logs" to="/activity-logs" />
        <v-list-item prepend-icon="event" title="Appointments" to="/appointments" />

        <v-spacer />
      </v-list>

      <v-list class="pb-2">
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          class="logout-item"
          @click="logoutDialog = true"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-app-bar flat title="PAMS" />

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
:deep(.v-navigation-drawer) {
  font-family: 'Inter', sans-serif;
}

:deep(.v-list-item-title),
:deep(.v-list-item-subtitle),
:deep(.v-icon) {
  color: #ffffff !important;
}

:deep(.v-list-item-title) {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

:deep(.v-list-item .v-icon) {
  font-size: 20px;
}

:deep(.v-list-item) {
  margin: 6px 10px;
  padding: 10px;
}

:deep(.v-navigation-drawer--rail .v-list-item) {
  justify-content: flex-start;
  padding-left: 14px !important;
}

:deep(.v-navigation-drawer--rail .v-icon) {
  transform: translateX(-11px);
}

.logout-item {
  color: #cfd8dc;
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
  color: #666;
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
</style>
