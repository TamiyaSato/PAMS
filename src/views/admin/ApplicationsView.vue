<script lang="ts" setup>
import api from '@/api/axios'
import TableLoading from '@/components/TableLoading.vue'
import type { applicationResponse } from '@/models/serviceResponse'
import { ref, computed, onMounted } from 'vue'
import { logActivity } from '@/utils/activityLogger'

const loading = ref(false)

const searchQuery = ref('')

const tabs = [
  { name: 'All', status: 0 },
  { name: 'Approved', status: 2 },
  { name: 'Denied', status: 3 },
]

const activeTab = ref({ name: 'All', status: 0 })
const activeTabName = computed(() => activeTab.value.name)

type applicationWithActions = applicationResponse & { showActions: boolean }

const applications = ref<applicationWithActions[]>([])

async function fetchApplications() {
  loading.value = true
  try {
    const res = await api.get<applicationResponse[]>('/api/v1/transactions')
    applications.value = res.data.map((app) => ({
      ...app,
      showActions: false,
    }))
  } catch (e) {
    console.error('Error fetching applications:', e)
  } finally {
    loading.value = false
  }
}

const filteredApplications = computed(() => {
  if (activeTab.value.status === 0) {
    return applications.value
  }
  return applications.value.filter((app) => app.status === activeTab.value.status)
})

const searchedApplications = computed(() => {
  if (!searchQuery.value) return filteredApplications.value

  const q = searchQuery.value.toLowerCase()

  return filteredApplications.value.filter(
    (app) => app.applicant_name?.toLowerCase().includes(q) || String(app.id).includes(q),
  )
})

async function updateStatus(id: number, status: number) {
  try {
    const app = applications.value.find((a) => a.id === id)
    const actionLabel = status === 2 ? 'approve' : 'deny'
    await api.patch(`/api/v1/transactions/${id}/status`, { status })
    await logActivity({
      action: actionLabel,
      entity_type: 'application',
      entity_id: id,
      description: `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}d application #${id} – ${app?.applicant_name}`,
    })
    await fetchApplications()
  } catch (e) {
    console.error('Failed to update status:', e)
  }
}

function statusLabel(status: number) {
  switch (status) {
    case 2:
      return 'Approved'
    case 3:
      return 'Denied'
    default:
      return 'Pending'
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <div class="applications-view">
    <div class="top-header">
      <h2>Applications</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search by name or queue number" v-model="searchQuery" />
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-top">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            class="tab"
            :class="{ active: activeTabName === tab.name }"
            @click="activeTab = tab"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <TableLoading :loading="loading" message="Loading services..." height="620px">
        <v-table fixed-header height="620px" class="services-table">
          <thead>
            <tr>
              <th></th>
              <th>Queue No.</th>
              <th>Applicant Name</th>
              <th>Service</th>
              <th>Category</th>
              <th>Date Applied</th>
              <th>Files</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in searchedApplications" :key="row.id">
              <td><input type="checkbox" /></td>
              <td>{{ row.id }}</td>
              <td>{{ row.applicant_name }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.category }}</td>
              <td>{{ row.date_created }}</td>
              <td>
                <span class="material-symbols-outlined file-icon">folder</span>
              </td>
              <td>
                <v-menu v-model="row.showActions" offset-y>
                  <template v-slot:activator="{ props }">
                    <button class="actions-btn" v-bind="props">
                      {{ statusLabel(row.status) }}
                      <span class="material-symbols-outlined">expand_more</span>
                    </button>
                  </template>

                  <v-list>
                    <v-list-item @click="updateStatus(row.id!, 2)">
                      <v-list-item-title>Approve</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateStatus(row.id!, 3)">
                      <v-list-item-title>Deny</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>
      </TableLoading>
    </div>
  </div>
</template>

<style scoped>
/* === Wrapper === */
.applications-view {
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

/* === Search Box === */
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

/* === Pill Buttons === */
.pill {
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pill.dark {
  background: #0b1b5a;
  color: white;
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

/* === Applications Table === */
.services-table {
  width: 100%;
  border-collapse: collapse;
}

.services-table thead th {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.services-table tbody tr {
  background: #eef5f9;
}

.services-table tbody tr:hover {
  background: #e0e9f1;
}

.services-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #dbe5ee;
}

.services-table td {
  padding: 16px 12px;
  font-size: 14px;
}

/* === Actions Button === */
.actions-btn {
  background: #0b1b5a;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* === File Icon === */
.file-icon {
  color: #0d6efd;
}

/* === Material Icons === */
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}
</style>
