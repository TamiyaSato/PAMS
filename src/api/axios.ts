import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper function to get token from either storage
function getAuthToken(): string | null {
  return sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
}

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth from both storages and redirect to login
      localStorage.removeItem('authToken')
      sessionStorage.removeItem('authToken')
      window.location.href = '/member/login'
    }
    return Promise.reject(error)
  },
)

export default api
