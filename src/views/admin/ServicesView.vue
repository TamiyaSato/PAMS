<script setup lang="ts">
import api from '@/api/axios'
import { onMounted, ref, computed } from 'vue'
import type { serviceResponse } from '@/models/serviceResponse'

const dialog = ref(false)
const tabs = ['All', 'Active', 'Drafts', 'Archived']
const activeTab = ref('All')
const services = ref<serviceResponse[]>([])

function getStatus(s: serviceResponse) {
  return s.active ?? 0
}

const filteredServices = computed(() => {
  const all = services.value || []
  const tab = activeTab.value

  if (tab === 'All') return all
  if (tab === 'Active') return all.filter((s) => getStatus(s) === 1)
  if (tab === 'Drafts') return all.filter((s) => getStatus(s) === 2)
  if (tab === 'Archived') return all.filter((s) => getStatus(s) === 3)

  return all
})

async function fetchServices() {
  try {
    const response = await api.get<serviceResponse[]>('/api/v1/service-types')
    services.value = response.data
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

onMounted(() => {
  fetchServices()
})
</script>

<template>
  <v-container fluid class="admin-container">
    <div class="top-header">
      <div class="welcome">
        <h2>Hi, Admin!</h2>
        <p>
          <a href="#">Logged in as: [Admin] [Role]</a><br />
          <a href="#">Last login: [date, time]</a>
        </p>
      </div>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search services" />
        </div>

        <button class="pill dark">
          Category
          <span class="material-symbols-outlined">expand_more</span>
        </button>

        <button class="pill dark">
          Year
          <span class="material-symbols-outlined">calendar_month</span>
        </button>

        <v-dialog v-model="dialog" max-width="600">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn class="pill yellow text-none font-weight-regular" v-bind="activatorProps">
              <span class="material-symbols-outlined">add</span>
              New Service
            </v-btn>
          </template>

          <v-card prepend-icon="mdi-account" title="Service Details">
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field label="Service Name*" required />
                </v-col>

                <v-col cols="12">
                  <v-text-field label=" Description*" required />
                </v-col>

                <v-col cols="12">
                  <v-number-input
                    :max="55"
                    :min="1"
                    :model-value="1"
                    label="Open Slots*"
                    required
                  ></v-number-input>
                </v-col>

                <v-col cols="12">
                  <v-date-input label="Date input"></v-date-input>
                </v-col>

                <v-col cols="12">
                  <v-autocomplete
                    :items="['House-to-House', ' PWD Application']"
                    label="Category"
                    auto-select-first
                  />
                </v-col>
              </v-row>

              <small class="text-caption text-medium-emphasis">*indicates required field</small>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-spacer />

              <v-btn variant="plain" @click="dialog = false"> Close </v-btn>

              <v-btn color="primary" variant="tonal" @click="dialog = false"> Save </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-left">
          <span class="material-symbols-outlined">check_circle</span>
          <span>Active Services</span>
        </div>
        <div class="count">04</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <span class="material-symbols-outlined">monitoring</span>
          <span>Total Remaining Slots</span>
        </div>
        <div class="count">16</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <span class="material-symbols-outlined">hourglass_top</span>
          <span>Closing soon</span>
        </div>
        <div class="count">02</div>
      </div>
    </div>

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

        <button class="export-btn">
          <span class="material-symbols-outlined">ios_share</span>
          Export
        </button>
      </div>

      <v-divider></v-divider>

      <v-table class="services-table" height="480px" fixed-header>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Service Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Requirements</th>
            <th>Cut-Off Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="service in filteredServices" :key="service.id">
            <td><input type="checkbox" /></td>
            <td>{{ service.id }}</td>
            <td>{{ service.name }}</td>
            <td>{{ service.description }}</td>
            <td>{{ service.category }}</td>
            <td>{{ service.requirements }}</td>
            <td>{{ service.date_created }}</td>
            <td>
              <button class="actions-btn">
                Actions
                <span class="material-symbols-outlined">expand_more</span>
              </button>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-container>
</template>

<style scoped>
.pill.yellow {
  background: #ffbf00;
}

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

.services-table {
  width: 100%;
  border-collapse: collapse;
}

.services-table thead th {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.services-table tbody tr {
  background: #eef5f9;
}

.services-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #dbe5ee;
}

.services-table td {
  padding: 16px 12px;
}

.actions-btn {
  background: #0b1b5a;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.export-btn {
  background: #02833c;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}
</style>
