import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)

  // Check if user is logged in (e.g., check for token in localStorage)
  function checkAuth() {
    const token = localStorage.getItem('authToken')
    isAuthenticated.value = !!token

    return isAuthenticated.value
  }

  function login(token: string) {
    isAuthenticated.value = true
    user.value = decodeJwtManually(token)
    console.log(user.value.role)
    // Store token if needed
    localStorage.setItem('authToken', token)
  }

  function decodeJwtManually(token: string) {
    try {
      const base64Payload = token.split('.')[1]
      const payload = atob(base64Payload)
      return JSON.parse(payload)
    } catch (e) {
      return null
    }
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
