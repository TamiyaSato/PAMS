<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import api from '@/api/axios'
import pamsLogo from '@/assets/PAMS.png'
import bgImage from '@/assets/Rectangle 148.png'
import type { AxiosError } from 'axios'

const router = useRouter()

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreed = ref(false)
const newsletter = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!firstName.value || !lastName.value || !email.value || !phone.value || !password.value) {
    errorMessage.value = 'Please complete all required fields.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (!agreed.value) {
    errorMessage.value = 'You must agree to the Terms and Privacy Policy.'
    return
  }

  isLoading.value = true

  try {
    await api.post('/api/v1/persons', {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
    })

    successMessage.value = 'Account created successfully! Redirecting to login...'

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error: unknown) {
    const err = error as AxiosError<{ message?: string }>

    if (err.response) {
      errorMessage.value = err.response.data?.message || 'Registration failed.'
    } else if (err.request) {
      errorMessage.value = 'Network error. Please try again.'
    } else {
      errorMessage.value = 'Unexpected error occurred.'
    }

    console.error('Register error:', err)
  }
}
</script>

<template>
  <div class="register-page">
    <div class="left" :style="{ backgroundImage: `url(${bgImage})` }">
      <div class="left-overlay">
        <div class="left-content">
          <img :src="pamsLogo" class="logo" />

          <h2>PWD Assistance<br />Management System (PAMS)</h2>
          <p>
            Register to apply for PWD assistance, track applications, and receive barangay
            announcements.
          </p>

          <div class="left-actions">
            <button class="btn primary">Learn More</button>
            <button class="btn outline">Our Features</button>
          </div>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="form-container">
        <h1>Welcome to PAMS!</h1>
        <p class="subtitle">Register your account</p>

        <div v-if="errorMessage" class="toast error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="toast success">{{ successMessage }}</div>

        <div class="grid">
          <div>
            <label>First Name</label>
            <input v-model="firstName" type="text" />
          </div>
          <div>
            <label>Last Name</label>
            <input v-model="lastName" type="text" />
          </div>

          <div>
            <label>E-mail Address</label>
            <input v-model="email" type="email" />
          </div>
          <div>
            <label>Phone Number</label>
            <input v-model="phone" type="text" />
          </div>

          <div>
            <label>Password</label>
            <input v-model="password" type="password" />
          </div>
          <div>
            <label>Confirm Password</label>
            <input v-model="confirmPassword" type="password" />
          </div>
        </div>

        <div class="checkbox-group">
          <label class="checkbox-row">
            <input type="checkbox" v-model="newsletter" />
            <span>Yes, I want to receive PAMS newsletters</span>
          </label>

          <label class="checkbox-row">
            <input type="checkbox" v-model="agreed" />
            <span>
              I agree to all the
              <a href="#">Terms</a>, <a href="#">Privacy Policy</a>
            </span>
          </label>
        </div>

        <button class="submit" :disabled="isLoading" @click="handleRegister">
          {{ isLoading ? 'Creating account...' : 'Create My Account' }}
        </button>

        <p class="login-link">
          Already have an account?
          <RouterLink to="/login">Log In</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Inter', sans-serif;
}

.left {
  width: 40%;
  background-size: cover;
  background-position: center;
}
.left-overlay {
  background: rgba(10, 25, 80, 0.75);
  height: 100%;
  padding: 50px;
  display: flex;
  align-items: center;
}
.left-content {
  color: white;
  max-width: 400px;
}
.logo {
  height: 100px;
  margin-bottom: 30px;
}
.left-content h2 {
  font-size: 28px;
  margin-bottom: 16px;
}
.left-content p {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}
.left-actions {
  display: flex;
  gap: 12px;
}
.btn {
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn.primary {
  background: #facc15;
  color: #1e293b;
}
.btn.outline {
  background: transparent;
  border: 2px solid white;
  color: white;
}

.right {
  width: 60%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.form-container {
  width: 500px;
}
h1 {
  font-size: 30px;
}
.subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
label {
  font-size: 13px;
  font-weight: 600;
}
input {
  width: 100%;
  padding: 10px;
  border: 1.5px solid #3b82f6;
  border-radius: 5px;
}
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 18px 0 24px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  cursor: pointer;
}

.checkbox-row input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #0b1b5a;
  cursor: pointer;
}

.checkbox-row a {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
}

.checkbox-row a:hover {
  text-decoration: underline;
}

.submit {
  background: #020f4a;
  color: white;
  padding: 12px;
  width: 100%;
  border-radius: 6px;
  border: none;
  font-weight: 600;
}
.login-link {
  margin-top: 14px;
  font-size: 14px;
}
.login-link a {
  color: #2563eb;
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
</style>
