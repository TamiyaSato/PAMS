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
    <v-container fluid class="pa-0">
      <RouterView />
    </v-container>
  </v-app>
</template>
