<script setup lang="ts">
import { useRoute } from 'vue-router'
import catto from '../../assets/catto.jpg'

const route = useRoute()

const isActive = (name: string) => route.name === name
</script>

<template>
  <div class="account-wrapper">
    <div class="breadcrumb">Profile</div>

    <div class="account-grid">
      <v-card class="sidebar">
        <div class="avatar-section">
          <v-avatar size="100">
            <img :src="catto" alt="Avatar" />
          </v-avatar>
          <p class="id-text">BRGY-PWD-1001<br />ID No.</p>
        </div>

        <v-list nav>
          <v-list-item
            :to="{ name: 'member-profile' }"
            prepend-icon="person"
            title="User Profile"
            :active="isActive('member-profile')"
          />

          <v-list-item
            :to="{ name: 'member-edit-profile' }"
            prepend-icon="edit"
            title="Edit Profile"
            :active="isActive('member-edit-profile')"
          />

          <v-list-item
            :to="{ name: 'member-change-password' }"
            prepend-icon="key"
            title="Change Password"
            :active="isActive('member-change-password')"
          />
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
