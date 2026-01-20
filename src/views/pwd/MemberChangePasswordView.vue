<script setup lang="ts">
import { ref } from 'vue'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const error = ref('')
const success = ref('')

const changePassword = async () => {
  error.value = ''
  success.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'All fields are required'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'New password must be at least 6 characters'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    success.value = 'Password changed successfully'
  } catch {
    error.value = 'Failed to change password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-form>
    <v-text-field label="Current Password" type="password" v-model="currentPassword" required />

    <v-text-field label="New Password" type="password" v-model="newPassword" required />

    <v-text-field label="Confirm Password" type="password" v-model="confirmPassword" required />

    <v-alert v-if="error" type="error" class="mt-3">
      {{ error }}
    </v-alert>

    <v-alert v-if="success" type="success" class="mt-3">
      {{ success }}
    </v-alert>

    <v-btn color="primary" class="mt-4" rounded="xl" :loading="loading" @click="changePassword">
      Change Password
    </v-btn>
  </v-form>
</template>
