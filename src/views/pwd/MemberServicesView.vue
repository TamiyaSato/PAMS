<script setup lang="ts">
import api from '@/api/axios'
import { onMounted, ref, computed } from 'vue'
import type { applicationResponse, serviceResponse } from '@/models/serviceResponse'
import TableLoading from '@/components/TableLoading.vue'
import catto from '../../assets/catto.jpg'

const activeTab = ref('Active')

const showPopup = ref(false)
const popupMessage = ref('')

const loadingServices = ref(false)
const services = ref<serviceResponse[]>([])
const appliedServices = ref<applicationResponse[]>([])
const cancelledServices = ref<applicationResponse[]>([])
const loading = ref(false)

async function fetchServices() {
  loadingServices.value = true
  try {
    const res = await api.get<serviceResponse[]>('/api/v1/service-types')
    services.value = res.data
    console.log('Services loaded:', services.value)
  } catch (e) {
    console.error('Error fetching services:', e)
  } finally {
    loadingServices.value = false
  }
}

async function fetchAppliedServices() {
  loadingServices.value = true
  try {
    const res = await api.get<applicationResponse[]>('/api/v1/transactions/me?status=1')
    appliedServices.value = res.data
    console.log('Applied services loaded:', appliedServices.value)
  } catch (e) {
    console.error('Error fetching applied services:', e)
  } finally {
    loadingServices.value = false
  }
}

async function fetchCancelledServices() {
  loadingServices.value = true
  try {
    const res = await api.get<applicationResponse[]>('/api/v1/transactions/me?status=3')
    cancelledServices.value = res.data
    console.log('Cancelled services loaded:', cancelledServices.value)
  } catch (e) {
    console.error('Error fetching cancelled services:', e)
  } finally {
    loadingServices.value = false
  }
}

function getStatus(s: serviceResponse) {
  return s.active ?? 0
}

const filteredServices = computed(() => {
  const all = services.value || []

  if (activeTab.value === 'Active') return all.filter((s) => getStatus(s) === 1)
  if (activeTab.value === 'Applied') return appliedServices.value
  if (activeTab.value === 'Cancelled') return cancelledServices.value

  return all
})

async function applyForService(serviceResponse: serviceResponse) {
  loading.value = true
  try {
    if (!serviceResponse.id) {
      throw new Error('service_id is required to apply for a service')
    }

    await api.post(`/api/v1/transactions`, {
      service_id: serviceResponse.id,
    })

    fetchAppliedServices()

    popupMessage.value = `Successfully applied for ${serviceResponse.name}!`
    showPopup.value = true
  } catch (error) {
    popupMessage.value = `Failed to apply for ${serviceResponse.name}`
    showPopup.value = true
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchServices()
  fetchAppliedServices()
  fetchCancelledServices()
})
</script>

<template>
  <v-container fluid class="member-container">
    <div class="top-bar">
      <h2>Apply for Services</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search for something" />
        </div>

        <span class="material-symbols-outlined icon-btn">settings</span>
        <span class="material-symbols-outlined icon-btn">notifications</span>

        <v-avatar size="30">
          <img :src="catto" alt="Avatar" />
        </v-avatar>
      </div>
    </div>

    <div class="table-card">
      <div class="table-top">
        <div class="tabs">
          <button
            v-for="tab in ['Active', 'Applied', 'Cancelled']"
            :key="tab"
            class="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
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

      <TableLoading :loading="loading" message="Loading services..." height="620px">
        <v-table fixed-header height="620px" class="services-table">
          <thead>
            <tr>
              <th></th>
              <th>ID No</th>
              <th>Service Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Open Slots</th>
              <th>Cut-Off Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="service in filteredServices" :key="service.id">
              <td>
                <div class="service-icon">
                  <span class="material-symbols-outlined">accessible</span>
                </div>
              </td>

              <td>#{{ service.id }}</td>
              <td>{{ service.name }}</td>
              <td class="muted">{{ service.description }}</td>
              <td>{{ service.category }}</td>
              <td>08 / 15</td>
              <td>{{ service.date_created }}</td>

              <td>
                <button
                  v-if="getStatus(service) === 1"
                  class="apply-btn"
                  :disabled="loading"
                  @click="applyForService(service)"
                >
                  Apply Here
                </button>

                <span v-else-if="getStatus(service) === 2" class="status-pill applied">
                  Edit/Cancel
                </span>

                <span v-else-if="getStatus(service) === 3" class="status-pill cancelled">
                  Cancelled
                </span>
              </td>
            </tr>
          </tbody>
        </v-table>
      </TableLoading>
    </div>
    <v-dialog v-model="showPopup" max-width="400">
      <v-card class="pa-4 text-center">
        <v-card-title class="text-h6"> Application Status </v-card-title>

        <v-card-text>
          {{ popupMessage }}
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="showPopup = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  align-items: center;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #eef3f7;
  padding: 6px 12px;
  border-radius: 999px;
  gap: 6px;
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
  cursor: pointer;
}

.avatar {
  border-radius: 50%;
  width: 36px;
}

.table-card {
  background: white;
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
}

.tab {
  background: none;
  border: none;
  padding: 12px 0;
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
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #0d6efd;
}

.services-table tbody tr {
  background: #eef5f9;
}

.services-table td {
  padding: 14px 12px;
}

.muted {
  color: #8b8b8b;
}

.service-icon {
  background: #1e8f5a;
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.apply-btn {
  background: #ffc107;
  border: none;
  border-radius: 999px;
  padding: 6px 16px;
  font-weight: 600;
  cursor: pointer;
}

.export-btn {
  background: #1e8f5a;
  color: white;
  border-radius: 999px;
  padding: 8px 16px;
  border: none;
  display: flex;
  gap: 6px;
  align-items: center;
}

.status-pill {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: default;
}

.status-pill.cancelled {
  background: #fde8e8;
  color: #dc2626;
}

.status-pill.applied {
  background: transparent;
  border: 1px solid #ffc107;
  color: #ffc107;
}
</style>
