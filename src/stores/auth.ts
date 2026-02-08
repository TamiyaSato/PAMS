import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<{ oid: number; email: string; username: string; role: string } | null>(null)

  // Helper function to get token from either storage
  function getAuthToken(): string | null {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
  }

  // Helper function to remove token from both storages
  function removeAuthToken(): void {
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
  }

  // Check if user is logged in and token is still valid (not expired)
  function checkAuth() {
    const token = getAuthToken()
    if (!token) {
      isAuthenticated.value = false
      user.value = null
      return false
    }
    const decoded = decodeJwtManually(token)
    if (!decoded) {
      isAuthenticated.value = false
      removeAuthToken()
      return false
    }
    // Check JWT exp (seconds since epoch)
    if (decoded.exp != null && decoded.exp * 1000 < Date.now()) {
      isAuthenticated.value = false
      user.value = null
      removeAuthToken()
      return false
    }
    isAuthenticated.value = true
    user.value = decoded
    return true
  }

  function login(token: string) {
    isAuthenticated.value = true
    user.value = decodeJwtManually(token)
    // Token is already stored by the login page, so we don't need to store it here
  }

  function decodeJwtManually(token: string) {
    try {
      const base64Payload = token.split('.')[1] as string
      const payload = atob(base64Payload)
      return JSON.parse(payload)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    removeAuthToken()
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
