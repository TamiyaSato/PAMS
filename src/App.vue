<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <v-container v-if="isAuthenticated" fluid>
    <v-card>
      <v-layout class="rounded rounded-md border">
        <!-- SIDEBAR -->
        <v-navigation-drawer expand-on-hover permanent rail class="sidebar">



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
            <v-list-item prepend-icon="inventory_2" title="Services" to="/about" />
            <v-list-item prepend-icon="description" title="Applications" to="/tami" />
            <v-list-item prepend-icon="campaign" title="Announcements" />
            <v-list-item prepend-icon="bar_chart" title="Activity Logs" />
            <v-list-item prepend-icon="event" title="Appointments" />
            <v-list-item prepend-icon="folder" title="History" />
            <v-list-item prepend-icon="settings" title="Settings" />
          </v-list>
        </v-navigation-drawer>

        <!-- HEADER -->
        <v-app-bar title="PAMS" class="overview-header" />

        <!-- MAIN CONTENT -->
        <v-main class="main-content">
          <RouterView />
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

*{box-sizing:border-box}
body{
  margin:0;
  font-family:Inter, Nunito, sans-serif;
  background:var(--bg)
}

.material-symbols-outlined{font-size:22px;vertical-align:middle}

/* LAYOUT */
.main-content{margin-left:260px;padding:24px}
.two-columns{display:grid;grid-template-columns:2.2fr 1fr;gap:24px}

/* SIDEBAR */
.sidebar{
  background:#0a1551;
  color:#fff;
  padding:20px;
}

.logo{
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:700;
  font-size:18px;
  margin-bottom:24px;
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

/* MODAL */
.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:none;
  align-items:center;
  justify-content:center;
  z-index:9999;
}

.modal{
  background:#fff;
  padding:24px;
  border-radius:14px;
  width:320px;
  text-align:center;
}
</style>
