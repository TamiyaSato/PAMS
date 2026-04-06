import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export interface ActivityLogEntry {
  id: number
  user_id: number
  user_name: string
  user_role: string
  action: string
  entity_type: string
  entity_id: number | null
  description: string
  ip_address: string | null
  created_at: string
}

export interface ActivityLogFilters {
  search: string
  userRole: string
  actionType: string
  dateFrom: string
  dateTo: string
}

export const useActivityLogStore = defineStore('activityLog', () => {
  const logs = ref<ActivityLogEntry[]>([])
  const loading = ref(false)
  const error = ref('')
  const total = ref(0)
  const page = ref(1)
  const perPage = ref(15)

  const filters = ref<ActivityLogFilters>({
    search: '',
    userRole: '',
    actionType: '',
    dateFrom: '',
    dateTo: '',
  })

  async function fetchLogs() {
    loading.value = true
    error.value = ''
    try {
      const params: Record<string, string | number> = {
        page: page.value,
        per_page: perPage.value,
      }

      if (filters.value.search) params.search = filters.value.search
      if (filters.value.userRole) params.role = filters.value.userRole
      if (filters.value.actionType) params.action = filters.value.actionType
      if (filters.value.dateFrom) params.date_from = filters.value.dateFrom
      if (filters.value.dateTo) params.date_to = filters.value.dateTo

      const { data } = await api.get<{ logs: ActivityLogEntry[]; total: number }>(
        '/api/v1/activity-logs',
        { params },
      )

      if (Array.isArray(data)) {
        logs.value = data
        total.value = data.length
      } else {
        logs.value = data.logs ?? []
        total.value = data.total ?? data.logs?.length ?? 0
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Failed to fetch activity logs'
      }
      console.error('Failed to fetch activity logs:', err)
    } finally {
      loading.value = false
    }
  }

  function setPage(newPage: number) {
    page.value = newPage
    fetchLogs()
  }

  function applyFilters(newFilters: Partial<ActivityLogFilters>) {
    Object.assign(filters.value, newFilters)
    page.value = 1
    fetchLogs()
  }

  function resetFilters() {
    filters.value = {
      search: '',
      userRole: '',
      actionType: '',
      dateFrom: '',
      dateTo: '',
    }
    page.value = 1
    fetchLogs()
  }

  return {
    logs,
    loading,
    error,
    total,
    page,
    perPage,
    filters,
    fetchLogs,
    setPage,
    applyFilters,
    resetFilters,
  }
})
