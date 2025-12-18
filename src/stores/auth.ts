import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)

  // Check if user is logged in (e.g., check for token in localStorage)
  function checkAuth() {
    const token = localStorage.getItem('authToken')
    isAuthenticated.value = !!token

    // Redirect to login if not authenticated
    if (!isAuthenticated.value && router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }

    return isAuthenticated.value
  }

  function login(token: string) {
    isAuthenticated.value = true
    user.value = null
    // Store token if needed
    localStorage.setItem('authToken', token)
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('authToken')
  }

  // Initialize auth state
  checkAuth()

  return {
    isAuthenticated,
    user,
    checkAuth,
    login,
    logout,
  }
})
