import { defineStore } from 'pinia'
import { ref } from 'vue'

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

export const useActivityLogStore = defineStore('activityLog', () => {
  const localLogs = ref<ActivityLogEntry[]>([])
  let nextId = 1

  function addLog(entry: Omit<ActivityLogEntry, 'id' | 'created_at'>) {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: nextId++,
      created_at: new Date().toISOString(),
    }
    localLogs.value.unshift(newEntry)
  }

  function getLocalLogs() {
    return [...localLogs.value]
  }

  return {
    localLogs,
    addLog,
    getLocalLogs,
  }
})
