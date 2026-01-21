<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import type { LoginResponse } from '@/models/LoginResponse'
import bgLogin from '@/assets/wmremove-transformed.png'

const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const form = ref(false)
const username = ref(null)
const password = ref(null)

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  if (!form.value) return

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const response = await api.post<LoginResponse>('/api/v1/users/login', {
      username: username.value,
      password: password.value,
    })

    const data = response.data

    if (data.token) {
      successMessage.value = 'Login successful!'

      // Store token and user data
      localStorage.setItem('authToken', data.token)

      // Update auth store
      authStore.login(data.token)

      // Redirect to home
      router.push('/admin')
    } else {
      errorMessage.value = 'Login failed. Please try again.'
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response) {
      errorMessage.value = error.response.data?.message || 'Login failed. Please try again.'
    } else if (error.request) {
      errorMessage.value = 'Network error. Please check your connection and try again.'
    } else {
      errorMessage.value = 'An error occurred. Please try again.'
    }
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

function required(v: string) {
  return !!v || 'Field is required'
}
</script>

<template>
  <div
    class="login-page"
    :style="{
      background: `linear-gradient(rgba(10, 20, 60, 0.75), rgba(10, 20, 60, 1)), url(${bgLogin}) no-repeat center center / cover`,
    }"
  >
    <div class="login-container">
      <h1>Login</h1>

      <div v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-message" role="alert">{{ successMessage }}</div>

      <v-form v-model="form" @submit.prevent="handleSubmit">
        <v-text-field
          clearable
          prepend-inner-icon="account_box"
          label="Username"
          variant="outlined"
          :rules="[required]"
          v-model="username"
        ></v-text-field>

        <v-text-field
          clearable
          prepend-inner-icon="domain"
          label="Password"
          type="password"
          variant="outlined"
          :rules="[required]"
          v-model="password"
        ></v-text-field>

        <div class="form-footer">
          <label class="remember">
            <input type="checkbox" id="remember" name="remember" value="1" />
            Remember me
          </label>
        </div>

        <button type="submit" id="submitBtn" :disabled="!form" :loading="isLoading">
          <span class="button-text">{{ isLoading ? 'Logging in...' : 'Login' }}</span>
          <span v-if="isLoading" class="spinner"></span>
        </button>
      </v-form>
    </div>
  </div>

  <div id="timestamp" class="bottom-left-timestamp"></div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.login-container {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  padding: 40px 45px;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.login-container h1 {
  text-align: center;
  margin-bottom: 25px;
  font-weight: 700;
}

.login-container label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  opacity: 0.9;
}

.login-container input[type='input'],
.login-container input[type='password'] {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 18px;
  border-radius: 6px;
  border: none;
  outline: none;
  font-size: 14px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 20px;
}

.form-footer a {
  color: #f5c400;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

button {
  width: 100%;
  padding: 13px;
  background: #f5c400;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover {
  background: #e0b000;
}

.error-message {
  color: #e00000;
  text-align: center;
  margin-bottom: 15px;
  font-size: 15px;
}

.success-message {
  color: #00e000;
  text-align: center;
  margin-bottom: 15px;
  font-size: 15px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bottom-left-timestamp {
  position: fixed;
  bottom: 15px;
  left: 20px;
  font-size: 12px;
  opacity: 0.7;
}
</style>
