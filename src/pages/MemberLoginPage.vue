<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'
import type { loginResponse } from '@/models/loginResponse'
import pamsLogo from '@/assets/PAMS.png'

import slide1 from '@/assets/rectangle.png'
import slide2 from '@/assets/wheelchair.jpg'
import slide3 from '@/assets/blind.jpg'

const slides = [slide1, slide2, slide3]
const currentSlide = ref(0)

let interval: number

onMounted(() => {
  interval = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 3000)
})

onUnmounted(() => {
  clearInterval(interval)
})

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
    const response = await api.post<loginResponse>('/api/v1/users/login', {
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
      router.push('/member')
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
  <div class="login-page">
    <div class="left">
      <div class="content">
        <div class="logo-row">
          <img :src="pamsLogo" alt="PAMS Logo" class="logo-image" />
        </div>

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
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a class="reset" href="#">Reset Password?</a>
          </div>

          <button class="login-btn" :disabled="!form || isLoading">
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </button>
        </v-form>

        <p class="register">
          Don’t have an account yet?
          <a href="#">Register with PAMS today.</a>
        </p>
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
          v-for="(dot, index) in slides"
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
  flex-direction: column;
  justify-content: space-between;
}

.content {
  max-width: 420px;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
}

.logo-image {
  height: 200px;
  width: auto;
  object-fit: contain;
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
  color: #374151;
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
  color: #374151;
}

.register a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.footer-date {
  font-size: 12px;
  color: #2563eb;
}

.right {
  width: 58%;
  position: relative;
}

.right img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
</style>
