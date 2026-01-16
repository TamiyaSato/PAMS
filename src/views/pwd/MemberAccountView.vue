<script setup lang="ts">
import catto from '../../assets/catto.jpg'
</script>

<template>
  <div class="account-wrapper">
    <div class="breadcrumb">Dashboard > Profile</div>

    <div class="account-grid">
      <v-card class="sidebar">
        <div class="avatar-section">
          <v-avatar size="100">
            <img :src="catto" alt="Avatar" />
          </v-avatar>
          <p class="id-text">BRGY-PWD-1001<br />ID No.</p>
        </div>

        <v-list nav>
          <v-list-item to="/member/account" prepend-icon="person" title="User Profile" />
          <v-list-item to="/member/account/edit" prepend-icon="edit" title="Edit Profile" />
          <v-list-item to="/member/account/password" prepend-icon="key" title="Change Password" />
        </v-list>
      </v-card>

      <v-card class="content">
        <RouterView />
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.account-wrapper {
  padding: 150px;
  background: #eef5ff;
  min-height: 100vh;
}

.breadcrumb {
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.account-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
}

.sidebar {
  padding: 20px;
  border-radius: 14px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 16px;
}

.id-text {
  font-size: 13px;
  margin-top: 6px;
}

.content {
  padding: 24px;
  border-radius: 14px;
}
</style>
