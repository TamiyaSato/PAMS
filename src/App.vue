<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <v-app>
    <v-container fluid v-if="isAuthenticated" class="pa-0">
      <v-layout>


        <v-navigation-drawer
          expand-on-hover
          permanent
          rail
          color="#0a1551"
        >
          <v-list>
            <v-list-item
              prepend-avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRUcux_QhsmbgtdjMe3q2djMPS2oKtPYUAEw&s"
              subtitle="Administrator"
              title="Bongo Cat"
            />
          </v-list>

          <v-divider />

          <v-list density="compact" nav>
            <v-list-item prepend-icon="dashboard" title="Dashboard" to="/" />
            <v-list-item prepend-icon="inventory_2" title="Services" to="/services" />
            <v-list-item prepend-icon="description" title="Applications" to="/applications" />
            <v-list-item prepend-icon="campaign" title="Announcements" to="/announcements" />
            <v-list-item prepend-icon="bar_chart" title="Activity Logs" to="/activity-logs" />
            <v-list-item prepend-icon="event" title="Appointments" to="/appointments" />
            <v-list-item prepend-icon="folder" title="History" to="/history" />
            <v-list-item prepend-icon="settings" title="Settings" to="/settings" />
          </v-list>
        </v-navigation-drawer>


        <v-main>
          <v-app-bar flat title="PAMS" />

          <RouterView />
        </v-main>

      </v-layout>
    </v-container>

    <RouterView v-else />
  </v-app>
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

</style>
