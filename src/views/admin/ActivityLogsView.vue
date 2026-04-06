<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import TableLoading from '@/components/TableLoading.vue'
import { useActivityLogStore } from '@/stores/activityLog'

// ---- Types ----
interface ActivityLogEntry {
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

// ---- State ----
const logs = ref<ActivityLogEntry[]>([])
const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('All')
const activityStore = useActivityLogStore()

const tabs = ['All', 'Login', 'Create', 'Update', 'Delete', 'Approve', 'Deny']

// ---- Computed ----
const filteredLogs = computed(() => {
  let list = logs.value

  if (activeTab.value !== 'All') {
    list = list.filter((l) => l.action.toLowerCase() === activeTab.value.toLowerCase())
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (l) =>
        l.user_name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.entity_type.toLowerCase().includes(q) ||
        String(l.id).includes(q),
    )
  }

  return list
})

const totalStats = computed(() => {
  const total = logs.value.length
  const logins = logs.value.filter((l) => l.action.toLowerCase() === 'login').length
  const creates = logs.value.filter((l) => l.action.toLowerCase() === 'create').length
  const updates = logs.value.filter((l) => l.action.toLowerCase() === 'update').length
  const deletes = logs.value.filter((l) => l.action.toLowerCase() === 'delete').length
  return { total, logins, creates, updates, deletes }
})

// ---- Helpers ----
function formatTimestamp(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function actionLabel(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1)
}

function actionBadgeClass(action: string): string {
  const a = action.toLowerCase()
  if (a === 'login') return 'badge-login'
  if (a === 'logout') return 'badge-logout'
  if (a === 'create') return 'badge-create'
  if (a === 'update') return 'badge-update'
  if (a === 'delete') return 'badge-delete'
  if (a === 'approve') return 'badge-approve'
  if (a === 'deny') return 'badge-deny'
  if (a === 'schedule') return 'badge-schedule'
  return 'badge-default'
}

function roleBadgeClass(role: string): string {
  return role.toLowerCase() === 'admin' ? 'badge-role-admin' : 'badge-role-member'
}

function entityTypeIcon(type: string): string {
  const t = type?.toLowerCase()
  if (t?.includes('service')) return 'inventory_2'
  if (t?.includes('appointment')) return 'event'
  if (t?.includes('application') || t?.includes('transaction')) return 'assignment'
  if (t?.includes('announcement')) return 'campaign'
  if (t?.includes('user') || t?.includes('person')) return 'person'
  if (t?.includes('profile')) return 'badge'
  return 'description'
}

function getInitial(name: string): string {
  return name ? name.charAt(0).toUpperCase() : '?'
}

// ---- Fetch ----
async function fetchLogs() {
  loading.value = true
  try {
    const res = await api.get<ActivityLogEntry[]>('/api/v1/activity-logs')
    const apiLogs = Array.isArray(res.data) ? res.data : []
    const localLogs = activityStore.getLocalLogs()
    // Merge: local logs first (most recent), then API logs
    logs.value = [...localLogs, ...apiLogs]
  } catch (error) {
    console.error('Failed to fetch activity logs:', error)
    // Merge local with mock data on failure
    const localLogs = activityStore.getLocalLogs()
    logs.value = [...localLogs, ...getMockData()]
  } finally {
    loading.value = false
  }
}

function getMockData(): ActivityLogEntry[] {
  return [
    {
      id: 1,
      user_id: 10,
      user_name: 'Admin John',
      user_role: 'admin',
      action: 'login',
      entity_type: 'user',
      entity_id: 10,
      description: 'Logged in from 192.168.1.100',
      ip_address: '192.168.1.100',
      created_at: '2025-01-15T08:30:00Z',
    },
    {
      id: 2,
      user_id: 10,
      user_name: 'Admin John',
      user_role: 'admin',
      action: 'create',
      entity_type: 'service',
      entity_id: 5,
      description: 'Created new service: Financial Assistance Program',
      ip_address: '192.168.1.100',
      created_at: '2025-01-15T09:00:00Z',
    },
    {
      id: 3,
      user_id: 11,
      user_name: 'Maria Santos',
      user_role: 'member',
      action: 'create',
      entity_type: 'application',
      entity_id: 101,
      description: 'Submitted application for Financial Assistance',
      ip_address: '192.168.1.50',
      created_at: '2025-01-15T10:15:00Z',
    },
    {
      id: 4,
      user_id: 10,
      user_name: 'Admin John',
      user_role: 'admin',
      action: 'approve',
      entity_type: 'application',
      entity_id: 101,
      description: 'Approved application #101 for Maria Santos',
      ip_address: '192.168.1.100',
      created_at: '2025-01-15T11:00:00Z',
    },
    {
      id: 5,
      user_id: 12,
      user_name: 'Juan dela Cruz',
      user_role: 'member',
      action: 'create',
      entity_type: 'appointment',
      entity_id: 201,
      description: 'Scheduled appointment for Medical Aid service',
      ip_address: '192.168.1.55',
      created_at: '2025-01-15T13:30:00Z',
    },
    {
      id: 6,
      user_id: 10,
      user_name: 'Admin John',
      user_role: 'admin',
      action: 'update',
      entity_type: 'announcement',
      entity_id: 15,
      description: 'Updated announcement: Holiday Schedule Notice',
      ip_address: '192.168.1.100',
      created_at: '2025-01-15T14:00:00Z',
    },
    {
      id: 7,
      user_id: 13,
      user_name: 'Ana Reyes',
      user_role: 'member',
      action: 'login',
      entity_type: 'user',
      entity_id: 13,
      description: 'Logged in from 192.168.1.60',
      ip_address: '192.168.1.60',
      created_at: '2025-01-15T14:30:00Z',
    },
    {
      id: 8,
      user_id: 10,
      user_name: 'Admin John',
      user_role: 'admin',
      action: 'deny',
      entity_type: 'application',
      entity_id: 99,
      description: 'Denied application #99 – incomplete documentation',
      ip_address: '192.168.1.100',
      created_at: '2025-01-15T15:00:00Z',
    },
    {
      id: 9,
      user_id: 14,
      user_name: 'Pedro Garcia',
      user_role: 'member',
      action: 'update',
      entity_type: 'profile',
      entity_id: 14,
      description: 'Updated personal profile information',
      ip_address: '192.168.1.70',
      created_at: '2025-01-15T15:30:00Z',
    },
    {
      id: 10,
      user_id: 10,
      user_name: 'Admin John',
      user_role: 'admin',
      action: 'delete',
      entity_type: 'announcement',
      entity_id: 12,
      description: 'Deleted expired announcement: Old Event Notice',
      ip_address: '192.168.1.100',
      created_at: '2025-01-15T16:00:00Z',
    },
    {
      id: 11,
      user_id: 15,
      user_name: 'Luz Villanueva',
      user_role: 'member',
      action: 'create',
      entity_type: 'application',
      entity_id: 102,
      description: 'Submitted application for Counseling service',
      ip_address: '192.168.1.75',
      created_at: '2025-01-16T08:00:00Z',
    },
    {
      id: 12,
      user_id: 11,
      user_name: 'Maria Santos',
      user_role: 'member',
      action: 'logout',
      entity_type: 'user',
      entity_id: 11,
      description: 'Logged out',
      ip_address: '192.168.1.50',
      created_at: '2025-01-16T08:30:00Z',
    },
  ]
}

onMounted(() => {
  // Pre-populate with mock data if API fails
  const localLogs = activityStore.getLocalLogs()
  if (localLogs.length === 0) {
    logs.value = getMockData()
  }
  fetchLogs()
})
</script>

<template>
  <div class="activity-logs-view">
    <div class="top-header">
      <h2>Activity Logs</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search logs..." v-model="searchQuery" />
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-left">
          <v-icon>format_list_bulleted</v-icon>
          <span>Total Entries</span>
        </div>
        <div class="count">{{ totalStats.total }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>login</v-icon>
          <span>Logins</span>
        </div>
        <div class="count">{{ totalStats.logins }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>add_circle</v-icon>
          <span>Created</span>
        </div>
        <div class="count">{{ totalStats.creates }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>edit</v-icon>
          <span>Updated</span>
        </div>
        <div class="count">{{ totalStats.updates }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>delete</v-icon>
          <span>Deleted</span>
        </div>
        <div class="count">{{ totalStats.deletes }}</div>
      </div>
    </div>

    <!-- Table Card with Tabs -->
    <div class="table-card">
      <div class="table-top">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <TableLoading :loading="loading" message="Loading activity logs..." height="600px">
        <v-table v-if="filteredLogs.length" class="activity-table" fixed-header height="600px">
          <thead>
            <tr>
              <th></th>
              <th>Log ID</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td>
                <span class="material-symbols-outlined action-icon" :class="actionBadgeClass(log.action)">
                  {{ log.action.toLowerCase() === 'login' ? 'login' : log.action.toLowerCase() === 'logout' ? 'logout' : log.action.toLowerCase() === 'create' ? 'add_circle' : log.action.toLowerCase() === 'update' ? 'edit' : log.action.toLowerCase() === 'delete' ? 'delete' : log.action.toLowerCase() === 'approve' ? 'check_circle' : log.action.toLowerCase() === 'deny' ? 'cancel' : 'info' }}
                </span>
              </td>
              <td class="log-id">#{{ log.id }}</td>
              <td class="timestamp">{{ formatTimestamp(log.created_at) }}</td>
              <td>
                <div class="user-cell">
                  <v-avatar size="32" color="primary">
                    <span class="text-white" style="font-size: 12px; font-weight: 600">{{ getInitial(log.user_name) }}</span>
                  </v-avatar>
                  <span class="user-name">{{ log.user_name }}</span>
                </div>
              </td>
              <td>
                <span class="role-badge" :class="roleBadgeClass(log.user_role)">{{ log.user_role }}</span>
              </td>
              <td>
                <span class="action-badge" :class="actionBadgeClass(log.action)">{{ actionLabel(log.action) }}</span>
              </td>
              <td>
                <div class="entity-cell">
                  <span class="material-symbols-outlined entity-icon">{{ entityTypeIcon(log.entity_type) }}</span>
                  <span class="entity-type">{{ log.entity_type }}</span>
                </div>
              </td>
              <td class="description-cell">{{ log.description }}</td>
            </tr>
          </tbody>
        </v-table>

        <div v-else class="empty-state">
          <v-icon size="64" color="grey-lighten-1">history</v-icon>
          <p class="mt-4 text-h6 text-grey">No activity logs found</p>
          <p class="text-body-2 text-grey">Activity will appear here as users interact with the system.</p>
        </div>
      </TableLoading>
    </div>
  </div>
</template>

<style scoped>
/* === Wrapper === */
.activity-logs-view {
  background: #eef5f9;
  padding: 24px;
  min-height: 100vh;
  font-family: Inter, sans-serif;
}

/* === Top Header === */
.top-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.top-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  background: white;
  padding: 10px 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}

/* === Stats === */
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #0b1b5a;
  color: white;
  padding: 18px;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  background: #ffbf00;
  color: black;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 18px;
}

/* === Table Card & Tabs === */
.table-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
}

.table-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tabs {
  display: flex;
  gap: 36px;
}

.tab {
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 15px;
  color: #8b8b8b;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: #0d6efd;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #0d6efd;
}

/* === Activity Table === */
.activity-table {
  width: 100%;
  border-collapse: collapse;
}

.activity-table thead th {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.activity-table tbody tr {
  background: #eef5f9;
}

.activity-table tbody tr:hover {
  background: #e0e9f1;
}

.activity-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #dbe5ee;
}

.activity-table td {
  padding: 14px 12px;
  font-size: 14px;
  vertical-align: middle;
}

/* Action Icon Column */
.action-icon {
  font-size: 20px;
}

.action-icon.badge-login {
  color: #1e8e3e;
}

.action-icon.badge-logout {
  color: #9e9e9e;
}

.action-icon.badge-create {
  color: #1976d2;
}

.action-icon.badge-update {
  color: #ffbf00;
}

.action-icon.badge-delete {
  color: #e53935;
}

.action-icon.badge-approve {
  color: #1e8e3e;
}

.action-icon.badge-deny {
  color: #e53935;
}

.action-icon.badge-schedule {
  color: #7b1fa2;
}

.action-icon.badge-default {
  color: #607d8b;
}

/* Log ID */
.log-id {
  font-family: monospace;
  font-size: 12px;
  color: #9ca3af;
}

/* Timestamp */
.timestamp {
  font-size: 13px;
  color: #4b5563;
  white-space: nowrap;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

/* Role Badge */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.badge-role-admin {
  background: #fee2e2;
  color: #b91c1c;
}

.role-badge.badge-role-member {
  background: #dbeafe;
  color: #1e40af;
}

/* Action Badge */
.action-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.action-badge.badge-login {
  background: #dcfce7;
  color: #166534;
}

.action-badge.badge-logout {
  background: #f5f5f5;
  color: #616161;
}

.action-badge.badge-create {
  background: #dbeafe;
  color: #1e40af;
}

.action-badge.badge-update {
  background: #fef3c7;
  color: #b45309;
}

.action-badge.badge-delete {
  background: #fee2e2;
  color: #b91c1c;
}

.action-badge.badge-approve {
  background: #dcfce7;
  color: #166534;
}

.action-badge.badge-deny {
  background: #fee2e2;
  color: #b91c1c;
}

.action-badge.badge-schedule {
  background: #ede7f6;
  color: #6a1b9a;
}

.action-badge.badge-default {
  background: #e0e0e0;
  color: #616161;
}

/* Entity Cell */
.entity-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.entity-cell .entity-icon {
  font-size: 18px;
  color: #8a8a8a;
}

.entity-type {
  font-size: 12px;
  color: #6b7280;
  text-transform: capitalize;
}

/* Description */
.description-cell {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

/* Material Icons */
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}

.mt-4 {
  margin-top: 16px;
}
</style>
