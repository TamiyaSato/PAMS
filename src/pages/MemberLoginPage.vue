<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import type { LoginResponse } from '@/models/LoginResponse'
import pamsLogo from '@/assets/PAMS.png'
import type { AxiosError } from 'axios'

import slide1 from '@/assets/rectangle.png'
import slide2 from '@/assets/wheelchair.jpg'
import slide3 from '@/assets/blind.jpg'

const slides = [slide1, slide2, slide3]
const currentSlide = ref(0)
let interval: number

onMounted(() => {
  interval = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 3500)
})
onUnmounted(() => clearInterval(interval))

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const remember = ref(false)
const form = ref(false)

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

function required(v: string) {
  return !!v || 'Field is required'
}

const handleSubmit = async () => {
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
      successMessage.value = 'Login successful! Redirecting...'

      if (remember.value) {
        localStorage.setItem('authToken', data.token)
      } else {
        sessionStorage.setItem('authToken', data.token)
      }

      authStore.login(data.token)

      setTimeout(() => {
        router.push('/member')
      }, 1200)
    } else {
      errorMessage.value = 'Invalid login credentials.'
    }
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>

    if (err.response) {
      errorMessage.value = err.response.data?.message || 'Login failed.'
    } else if (err.request) {
      errorMessage.value = 'Network error. Please try again.'
    } else {
      errorMessage.value = 'Unexpected error occurred.'
    }

    console.error('Login error:', err)
  }
  {
  }
}
</script>

<template>
  <div class="login-page">
    <div class="left">
      <div class="content">
        <div class="logo-row">
          <img :src="pamsLogo" alt="PAMS Logo" class="logo-image" />
        </div>

        <h1 class="title">Welcome Back!</h1>
        <p class="subtitle">Log in to your PAMS account</p>

        <div v-if="errorMessage" class="toast error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="toast success">{{ successMessage }}</div>

        <v-form v-model="form" @submit.prevent="handleSubmit">
          <div class="field">
            <label>Email Address</label>
            <v-text-field
              v-model="username"
              variant="outlined"
              density="comfortable"
              hide-details
              :rules="[required]"
            />
          </div>

          <div class="field">
            <label>Password</label>
            <v-text-field
              v-model="password"
              type="password"
              variant="outlined"
              density="comfortable"
              hide-details
              :rules="[required]"
            />
          </div>

          <div class="options">
            <label class="remember">
              <input type="checkbox" v-model="remember" />
              <span>Remember me</span>
            </label>
            <RouterLink class="reset" to="/forgot-password">Forgot Password?</RouterLink>
          </div>

          <button class="login-btn" :disabled="!form || isLoading">
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </button>
        </v-form>

        <p class="register">
          Don’t have an account yet?
          <RouterLink to="/register">Register with PAMS today.</RouterLink>
        </p>

        <RouterLink to="/admin/login" class="admin-btn"> Are you an Admin? Login here. </RouterLink>
      </div>
    </div>

    <div class="right">
      <img
        v-for="(slide, index) in slides"
        :key="slide"
        :src="slide"
        class="slide-image"
        :class="{ active: index === currentSlide }"
      />

      <div class="overlay"></div>

      <div class="dots">
        <span
          v-for="(_, index) in slides"
          :key="index"
          class="dot"
          :class="{ active: index === currentSlide }"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Inter', sans-serif;
  background: #fff;
}

.left {
  width: 42%;
  min-width: 440px;
  padding: 48px 56px;
  display: flex;
  align-items: center;
}

.content {
  max-width: 420px;
}

.logo-row {
  margin-bottom: 20px;
}

.logo-image {
  height: 170px;
  width: auto;
  object-fit: contain;
  margin-bottom: 20px;
}

.title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 28px;
}

.field {
  margin-bottom: 18px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #111827;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 0 26px;
  font-size: 13px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: #0b1b5a;
  color: #fff;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.register {
  margin-top: 28px;
  font-size: 14px;
}

.register a {
  color: #2563eb;
  font-weight: 500;
}

.toast {
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 14px;
  font-size: 14px;
}
.toast.error {
  background: #fee2e2;
  color: #991b1b;
}
.toast.success {
  background: #dcfce7;
  color: #166534;
}

.right {
  width: 58%;
  position: relative;
}

.slide-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}
.slide-image.active {
  opacity: 1;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 25, 80, 0.78);
}

.dots {
  position: absolute;
  bottom: 28px;
  right: 48px;
  display: flex;
  gap: 10px;
}

.dot {
  width: 26px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.dot.active {
  background: #facc15;
}
.admin-btn {
  display: block;
  margin-top: 14px;
  width: 100%;
  text-align: center;
  padding: 12px 0;
  border-radius: 6px;
  border: 1px solid #0b1b5a;
  color: #0b1b5a;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.admin-btn:hover {
  background: #0b1b5a;
  color: #fff;
}
</style>
