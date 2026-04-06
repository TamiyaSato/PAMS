import { useActivityLogStore } from '@/stores/activityLog'
import { useAuthStore } from '@/stores/auth'

interface ActivityLogPayload {
  action: string
  entity_type: string
  entity_id?: number | null
  description: string
}

export async function logActivity(payload: ActivityLogPayload): Promise<void> {
  try {
    const authStore = useAuthStore()
    const activityStore = useActivityLogStore()

    // Only log if admin is logged in
    if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') return

    activityStore.addLog({
      user_id: authStore.user?.oid ?? 0,
      user_name: authStore.user?.username ?? 'Admin',
      user_role: 'admin',
      action: payload.action.toLowerCase(),
      entity_type: payload.entity_type.toLowerCase(),
      entity_id: payload.entity_id ?? null,
      description: payload.description,
      ip_address: null,
    })
  } catch (error) {
    console.warn('Failed to log activity:', error)
  }
}
