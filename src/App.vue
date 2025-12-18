<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <v-container v-if="isAuthenticated">
    <v-card>
      <v-layout class="rounded rounded-md border">
        <v-navigation-drawer expand-on-hover permanent rail>
          <v-list>
            <v-list-item
              prepend-avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRUcux_QhsmbgtdjMe3q2djMPS2oKtPYUAEw&s"
              subtitle="Administrator"
              title="Bongo Cat"
            ></v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list density="compact" nav>
            <v-list-item
              prepend-icon="dashboard"
              title="Dashboard"
              value="dashboard"
              to="/"
            ></v-list-item>
            <v-list-item
              prepend-icon="inventory_2"
              title="Services"
              value="services"
              to="/about"
            ></v-list-item>
            <v-list-item
              prepend-icon="description"
              title="Applications"
              value="applications"
              to="/tami"
            ></v-list-item>
            <v-list-item
              prepend-icon="campaign"
              title="Annoucements"
              value="annoucements"
            ></v-list-item>
            <v-list-item
              prepend-icon="bar_chart"
              title="Activity Logs"
              value="activity_logs"
            ></v-list-item>
            <v-list-item
              prepend-icon="event"
              title="Appointments"
              value="appointments"
            ></v-list-item>
            <v-list-item prepend-icon="folder" title="History" value="history"></v-list-item>
            <v-list-item prepend-icon="settings" title="Settings" value="settings"></v-list-item>
          </v-list>
        </v-navigation-drawer>

        <v-app-bar title="PAMS"></v-app-bar>

        <v-main class="d-flex align-center justify-center" height="300">
          <v-container>
            <RouterView />
          </v-container>
        </v-main>
      </v-layout>
    </v-card>
  </v-container>
  <RouterView v-else />
</template>

<style>
:root{
  --bg:#eef5f9;
  --card:#ffffff;
  --primary:#0a1551;
  --accent:#0d6efd;
  --muted:#8a8a8a;
  --border:#e5eaf0;
  --success:#1e8e3e;
  --warning:#f4b400;
}


/* SIDEBAR */
.sidebar{
  background:#0a1551;
  color:#fff;
  padding:20px;
}

/* HEADER */
.overview-header{
  background:var(--card);
  border-bottom:1px solid var(--border);
}

/* PROFILE */
.profile-pic{
  width:38px;
  height:38px;
  border-radius:50%;
  object-fit:cover;
}


</style>
