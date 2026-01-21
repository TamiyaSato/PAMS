<script setup lang="ts">
import api from '@/api/axios'
import { ref, computed, onMounted } from 'vue'
import TableLoading from '@/components/TableLoading.vue'
import catto from '../../assets/catto.jpg'
import type { serviceResponse } from '@/models/serviceResponse'

interface ApplicationResponse {
  id: number
  service_name: string
  date_filed: string
  current_stage: string
  status: number
}

type AppTab = 'In Progress' | 'Completed' | 'Declined'

const activeTab = ref<AppTab>('In Progress')
const applications = ref<ApplicationResponse[]>([])
const loading = ref(false)

const filteredApplications = computed(() => {
  switch (activeTab.value) {
    case 'In Progress':
      return applications.value.filter((a) => a.status === 1)
    case 'Completed':
      return applications.value.filter((a) => a.status === 2)
    case 'Declined':
      return applications.value.filter((a) => a.status === 3)
    default:
      return applications.value
  }
})

async function fetchApplications() {
  loading.value = true
  try {
    const res = await api.get<serviceResponse[]>('/api/v1/service-types')

    applications.value = res.data.map((s) => ({
      id: s.id,
      service_name: s.name,
      date_filed: s.date_created?.split('T')[0] ?? '',
      current_stage: 'Submitted', // default stage
      status: Number(s.active), // make sure active is number
    }))
    console.log('Applications loaded:', applications.value)
  } catch (e) {
    console.error('Error fetching applications:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchApplications)
</script>

<template>
  <v-container fluid class="member-container">
    <div class="top-bar">
      <h2>Application Status</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search for something" />
        </div>

        <span class="material-symbols-outlined icon-btn">settings</span>
        <span class="material-symbols-outlined icon-btn">notifications</span>

        <v-avatar size="30">
          <img :src="catto" />
        </v-avatar>
      </div>
    </div>

    <div class="table-card">
      <div class="table-top">
        <div class="tabs">
          <button
            v-for="tab in ['In Progress', 'Completed', 'Declined']"
            :key="tab"
            class="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab as AppTab"
          >
            {{ tab }}
          </button>
        </div>

        <button class="export-btn">
          <span class="material-symbols-outlined">filter_alt</span>
          Export
        </button>
      </div>

      <v-divider />

      <TableLoading :loading="loading" message="Loading applications..." height="620px">
        <v-table fixed-header height="620px" class="services-table">
          <thead>
            <tr>
              <th></th>
              <th>ID No</th>
              <th>Service Name</th>
              <th>Date Filed</th>
              <th>Current Stage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="app in filteredApplications" :key="app.id">
              <td>
                <div class="service-icon">
                  <span class="material-symbols-outlined">assignment</span>
                </div>
              </td>

              <td>#{{ app.id }}</td>
              <td>{{ app.service_name }}</td>
              <td>{{ app.date_filed }}</td>
              <td>{{ app.current_stage }}</td>

              <td>
                <span v-if="app.status === 1" class="status-pill progress">In Progress</span>
                <span v-else-if="app.status === 2" class="status-pill completed">Approved</span>
                <span v-else class="status-pill declined">Declined</span>
              </td>

              <td>
                <button class="view-btn">View Details</button>
              </td>
            </tr>
          </tbody>
        </v-table>
      </TableLoading>
    </div>
  </v-container>
</template>

<style scoped>
.member-container {
  background: #f4f8fb;
  min-height: 90vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: #eef3f7;
  padding: 6px 12px;
  border-radius: 999px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
}

.icon-btn {
  background: #eef3f7;
  padding: 8px;
  border-radius: 50%;
}

.table-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
}

.table-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 32px;
  align-items: flex-end;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  background: none;
  border: none;
  height: 44px;
  padding: 0;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
}

.tab.active {
  color: #2563eb;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2563eb;
}

.services-table tbody tr {
  background: #eef5f9;
}

.services-table td {
  padding: 14px 12px;
}

.service-icon {
  background: #1e8f5a;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-btn {
  background: #1e8f5a;
  color: white;
  border-radius: 999px;
  padding: 8px 16px;
  border: none;
  display: flex;
  gap: 6px;
}

.view-btn {
  background: #facc15;
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  font-weight: 600;
}

.status-pill {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.status-pill.progress {
  background: #e0f2fe;
  color: #0284c7;
}

.status-pill.completed {
  background: #dcfce7;
  color: #16a34a;
}

.status-pill.declined {
  background: #fee2e2;
  color: #dc2626;
}
</style>
