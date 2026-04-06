<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useActivityLogStore } from '@/stores/activityLog'
import TableLoading from '@/components/TableLoading.vue'

const store = useActivityLogStore()

const searchInput = ref('')
const dateFromInput = ref('')
const dateToInput = ref('')
const selectedRole = ref('')
const selectedAction = ref('')
const showFilters = ref(false)

const roleOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
]

const actionOptions = [
  { label: 'All Actions', value: '' },
  { label: 'Login', value: 'login' },
  { label: 'Logout', value: 'logout' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
  { label: 'Approve', value: 'approve' },
  { label: 'Deny', value: 'deny' },
  { label: 'Schedule', value: 'schedule' },
]

const currentPage = computed(() => store.page)
const totalPages = computed(() => Math.max(1, Math.ceil(store.total / store.perPage)))

const paginatedLogs = computed(() => store.logs)

function applySearch() {
  store.applyFilters({ search: searchInput.value })
}

function applyDateFilter() {
  store.applyFilters({
    dateFrom: dateFromInput.value,
    dateTo: dateToInput.value,
  })
}

function applyRoleFilter() {
  store.applyFilters({ userRole: selectedRole.value })
}

function applyActionFilter() {
  store.applyFilters({ actionType: selectedAction.value })
}

function resetAll() {
  searchInput.value = ''
  dateFromInput.value = ''
  dateToInput.value = ''
  selectedRole.value = ''
  selectedAction.value = ''
  store.resetFilters()
}

function formatTimestamp(iso: string) {
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

function actionColor(action: string) {
  const a = action.toLowerCase()
  if (['login'].includes(a)) return 'success'
  if (['logout'].includes(a)) return 'grey'
  if (['create', 'schedule'].includes(a)) return 'info'
  if (['update', 'approve'].includes(a)) return 'warning'
  if (['delete', 'deny'].includes(a)) return 'error'
  return 'primary'
}

function actionIcon(action: string) {
  const a = action.toLowerCase()
  if (a === 'login') return 'login'
  if (a === 'logout') return 'logout'
  if (a === 'create') return 'add_circle'
  if (a === 'update') return 'edit'
  if (a === 'delete') return 'delete'
  if (a === 'approve') return 'check_circle'
  if (a === 'deny') return 'cancel'
  if (a === 'schedule') return 'event'
  return 'info'
}

function entityTypeIcon(type: string) {
  const t = type?.toLowerCase()
  if (t?.includes('service')) return 'inventory_2'
  if (t?.includes('appointment')) return 'event'
  if (t?.includes('application') || t?.includes('transaction')) return 'assignment'
  if (t?.includes('announcement')) return 'campaign'
  if (t?.includes('user') || t?.includes('person')) return 'person'
  if (t?.includes('profile')) return 'badge'
  return 'description'
}

watch(searchInput, (val) => {
  if (!val) store.applyFilters({ search: '' })
})

onMounted(() => {
  store.fetchLogs()
})
</script>

<template>
  <v-container fluid class="admin-container">
    <div class="top-header">
      <h2>Activity Logs</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search logs..."
            v-model="searchInput"
            @keyup.enter="applySearch"
          />
        </div>

        <button class="pill dark" @click="showFilters = !showFilters">
          <span class="material-symbols-outlined">filter_list</span>
          Filters
        </button>

        <button class="pill yellow" @click="store.fetchLogs()">
          <span class="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Filter Panel -->
    <v-expand-transition>
      <v-card v-if="showFilters" class="filter-card mb-4">
        <v-card-title class="d-flex align-center">
          <span class="material-symbols-outlined mr-2">tune</span>
          Filter Activity Logs
          <v-spacer />
          <v-btn variant="text" size="small" @click="resetAll"> Reset All </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="dateFromInput"
                label="Date From"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                @change="applyDateFilter"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="dateToInput"
                label="Date To"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                @change="applyDateFilter"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedRole"
                :items="roleOptions"
                item-title="label"
                item-value="value"
                label="User Role"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="applyRoleFilter"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedAction"
                :items="actionOptions"
                item-title="label"
                item-value="value"
                label="Action Type"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="applyActionFilter"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- Active Filters Display -->
    <div v-if="store.filters.search || store.filters.dateFrom || store.filters.userRole || store.filters.actionType" class="active-filters mb-4">
      <v-chip
        v-if="store.filters.search"
        size="small"
        closable
        @click:close="searchInput = ''; store.applyFilters({ search: '' })"
        class="mr-2 mb-2"
      >
        Search: {{ store.filters.search }}
      </v-chip>
      <v-chip
        v-if="store.filters.dateFrom"
        size="small"
        closable
        @click:close="dateFromInput = ''; store.applyFilters({ dateFrom: '' })"
        class="mr-2 mb-2"
      >
        From: {{ store.filters.dateFrom }}
      </v-chip>
      <v-chip
        v-if="store.filters.dateTo"
        size="small"
        closable
        @click:close="dateToInput = ''; store.applyFilters({ dateTo: '' })"
        class="mr-2 mb-2"
      >
        To: {{ store.filters.dateTo }}
      </v-chip>
      <v-chip
        v-if="store.filters.userRole"
        size="small"
        closable
        @click:close="selectedRole = ''; store.applyFilters({ userRole: '' })"
        class="mr-2 mb-2"
      >
        Role: {{ store.filters.userRole }}
      </v-chip>
      <v-chip
        v-if="store.filters.actionType"
        size="small"
        closable
        @click:close="selectedAction = ''; store.applyFilters({ actionType: '' })"
        class="mr-2 mb-2"
      >
        Action: {{ store.filters.actionType }}
      </v-chip>
    </div>

    <!-- Stats Summary -->
    <div class="stats mb-4">
      <div class="stat-card">
        <div class="stat-left">
          <v-icon>format_list_bulleted</v-icon>
          <span>Total Entries</span>
        </div>
        <div class="count">{{ store.total }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>admin_panel_settings</v-icon>
          <span>Admin Actions</span>
        </div>
        <div class="count">{{ store.logs.filter((l) => l.user_role === 'admin').length }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>person</v-icon>
          <span>Member Actions</span>
        </div>
        <div class="count">{{ store.logs.filter((l) => l.user_role === 'member').length }}</div>
      </div>
    </div>

    <!-- Activity Log Table -->
    <div class="table-card">
      <TableLoading :loading="store.loading" message="Loading activity logs...">
        <v-table v-if="paginatedLogs.length" class="activity-table" fixed-header height="500">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th style="width: 50px">ID</th>
              <th style="width: 140px">Timestamp</th>
              <th style="width: 120px">User</th>
              <th style="width: 80px">Role</th>
              <th style="width: 100px">Action</th>
              <th style="width: 100px">Entity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.id">
              <td>
                <v-icon :color="actionColor(log.action)" size="20">
                  {{ actionIcon(log.action) }}
                </v-icon>
              </td>
              <td class="log-id">#{{ log.id }}</td>
              <td class="timestamp">{{ formatTimestamp(log.created_at) }}</td>
              <td>
                <div class="user-cell">
                  <v-avatar size="32" color="primary" class="mr-2">
                    <span class="text-white text-caption">{{ log.user_name.charAt(0) }}</span>
                  </v-avatar>
                  <span class="user-name">{{ log.user_name }}</span>
                </div>
              </td>
              <td>
                <v-chip
                  :color="log.user_role === 'admin' ? 'error' : 'primary'"
                  size="x-small"
                  variant="flat"
                >
                  {{ log.user_role }}
                </v-chip>
              </td>
              <td>
                <v-chip
                  :color="actionColor(log.action)"
                  size="x-small"
                  variant="flat"
                  class="text-capitalize"
                >
                  {{ log.action }}
                </v-chip>
              </td>
              <td>
                <div class="entity-cell">
                  <v-icon size="16" color="grey-darken-1" class="mr-1">
                    {{ entityTypeIcon(log.entity_type) }}
                  </v-icon>
                  <span class="entity-type">{{ log.entity_type }}</span>
                </div>
              </td>
              <td class="description-cell" :title="log.description">
                {{ log.description }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-else class="empty-state">
          <v-icon size="64" color="grey-lighten-1">history</v-icon>
          <p class="mt-4 text-h6 text-grey">No activity logs found</p>
          <p class="text-body-2 text-grey">Activity will appear here as users interact with the system.</p>
        </div>
      </TableLoading>

      <!-- Pagination -->
      <div v-if="store.total > store.perPage" class="table-footer">
        <span class="text-body-2 text-grey">
          Showing {{ (currentPage - 1) * store.perPage + 1 }}–{{
            Math.min(currentPage * store.perPage, store.total)
          }} of {{ store.total }}
        </span>
        <div class="pagination-btns">
          <v-btn
            variant="outlined"
            size="small"
            :disabled="currentPage <= 1"
            @click="store.setPage(currentPage - 1)"
          >
            Previous
          </v-btn>
          <v-btn
            variant="outlined"
            size="small"
            :disabled="currentPage >= totalPages"
            @click="store.setPage(currentPage + 1)"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.filter-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
}

.activity-table thead th {
  padding: 14px 12px;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.activity-table tbody tr {
  background: white;
  transition: background 0.15s;
}

.activity-table tbody tr:hover {
  background: #f0f4f8;
}

.activity-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.activity-table td {
  padding: 14px 12px;
  font-size: 14px;
  vertical-align: middle;
}

.log-id {
  color: #9ca3af;
  font-size: 12px;
  font-family: monospace;
}

.timestamp {
  font-size: 13px;
  color: #4b5563;
  white-space: nowrap;
}

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
  max-width: 120px;
}

.entity-cell {
  display: flex;
  align-items: center;
}

.entity-type {
  font-size: 12px;
  color: #6b7280;
  text-transform: capitalize;
}

.description-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 12px 8px;
  border-top: 1px solid #e5e7eb;
}

.pagination-btns {
  display: flex;
  gap: 8px;
}

/* Keep consistent with existing admin styles */
.pill.dark {
  background: #0b1b5a;
  color: white;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.pill.yellow {
  background: #ffbf00;
  color: #1f2a44;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}
</style>
