<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import AdminPage from './pages/AdminPage.vue'

const authStore = useAuthStore()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <v-app>
    <v-container fluid v-if="isAuthenticated" class="pa-0">
      <AdminPage />
    </v-container>

    <RouterView v-else />
  </v-app>
</template>
