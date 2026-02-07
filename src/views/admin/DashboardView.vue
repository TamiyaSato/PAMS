<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

interface DashboardStats {
  transactionsCreatedToday: number
  transactionsWithStatusOne: number
  activeServiceTypes: number
}

interface ServiceType {
  id: number
  name: string
  description: string
  requirements: string
  category: string
  active: number
  date_created: string
}

interface Transaction {
  id: number
  name: string
  description: string
  disability_type: string
  category: string
  status: number
  date_created: string
  applicant_name: string
}

const lastLogin = ref(new Date().toLocaleString())
const years = [2023, 2024, 2025]
const categories = ['Financial', 'Medical', 'Training', 'Goods']

const selectedYear = ref<number | null>(null)
const selectedCategory = ref<string | null>(null)

const yearMenu = ref(false)
const categoryMenu = ref(false)

const services = ref<ServiceType[]>([])

const applications = ref<Transaction[]>([])

const openServiceActionId = ref<number | null>(null)
const openApplicationActionId = ref<number | null>(null)

const editDialog = ref(false)
const editServiceData = ref<Partial<ServiceType>>({})

// Dashboard stats from API
const applicationsToday = ref<number>(0)
const activeServices = ref<number>(0)
const pendingApprovals = ref<number>(0)

async function fetchDashboardStats() {
  try {
    const { data } = await api.get<DashboardStats>('/api/v1/dashboard')
    applicationsToday.value = data.transactionsCreatedToday
    activeServices.value = data.activeServiceTypes
    pendingApprovals.value = data.transactionsWithStatusOne
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  }
}

async function fetchServiceTypes() {
  try {
    const { data } = await api.get<ServiceType[]>('/api/v1/service-types', {
      params: { status: 1, top: 3 },
    })
    services.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch service types:', error)
  }
}

async function fetchTransactions() {
  try {
    const { data } = await api.get<Transaction[]>('/api/v1/transactions', {
      params: { status: 1, top: 3 },
    })
    applications.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  }
}

onMounted(() => {
  fetchDashboardStats()
  fetchServiceTypes()
  fetchTransactions()
})

function toggleServiceActions(id: number) {
  openServiceActionId.value = openServiceActionId.value === id ? null : id
}

function toggleApplicationActions(id: number) {
  openApplicationActionId.value = openApplicationActionId.value === id ? null : id
}

function editServiceAction(service: ServiceType) {
  editServiceData.value = {
    ...service,
    date_created: service.date_created ? service.date_created.split('T')[0] : '',
  }
  editDialog.value = true
  openServiceActionId.value = null
}

async function saveEditService() {
  if (!editServiceData.value.id) return
  try {
    const payload = {
      name: editServiceData.value.name,
      description: editServiceData.value.description,
      requirements: editServiceData.value.requirements,
      category: editServiceData.value.category,
      active: editServiceData.value.active,
      date_created: editServiceData.value.date_created
        ? new Date(editServiceData.value.date_created).toISOString().split('T')[0]
        : '',
    }
    await api.put(`/api/v1/service-types/${editServiceData.value.id}`, payload)
    editDialog.value = false
    await fetchServiceTypes()
    await fetchDashboardStats()
  } catch (error) {
    console.error('Error editing service:', error)
  }
}

async function updateServiceStatus(id: number, status: number) {
  try {
    await api.patch(`/api/v1/service-types/${id}/status`, { status })
    openServiceActionId.value = null
    await fetchServiceTypes()
    await fetchDashboardStats()
  } catch (error) {
    console.error('Error updating service status:', error)
  }
}

function applicationStatusLabel(status: number) {
  switch (status) {
    case 2:
      return 'Approved'
    case 3:
      return 'Denied'
    default:
      return 'Pending'
  }
}

async function updateApplicationStatus(id: number, status: number) {
  try {
    await api.patch(`/api/v1/transactions/${id}/status`, { status })
    openApplicationActionId.value = null
    await fetchTransactions()
    await fetchDashboardStats()
  } catch (error) {
    console.error('Failed to update application status:', error)
  }
}
</script>

<template>
  <v-container fluid class="admin-container">
    <div class="top-header">
      <div class="welcome">
        <h2>Hi, Admin!</h2>
        <p>
          <a href="#">Logged in as: [Admin] [Role]</a><br />
          <a href="#">Last login: {{ lastLogin }}</a>
        </p>
      </div>

      <div class="top-actions">
        <div class="search-box">
          <v-icon size="18">search</v-icon>
          <input type="text" placeholder="Search dashboard" />
        </div>

        <v-menu v-model="yearMenu" max-width="200">
          <template v-slot:activator="{ props }">
            <button class="pill dark" v-bind="props">
              {{ selectedYear ?? 'Year' }}
              <v-icon size="18">expand_more</v-icon>
            </button>
          </template>
          <v-list>
            <v-list-item
              v-for="y in years"
              :key="y"
              @click="
                () => {
                  selectedYear = y
                  yearMenu = false
                }
              "
            >
              <v-list-item-title>{{ y }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="
                () => {
                  selectedYear = null
                  yearMenu = false
                }
              "
            >
              <v-list-item-title>All Years</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu v-model="categoryMenu" max-width="200">
          <template v-slot:activator="{ props }">
            <button class="pill dark" v-bind="props">
              {{ selectedCategory ?? 'Category' }}
              <v-icon size="18">expand_more</v-icon>
            </button>
          </template>
          <v-list>
            <v-list-item
              v-for="cat in categories"
              :key="cat"
              @click="
                () => {
                  selectedCategory = cat
                  categoryMenu = false
                }
              "
            >
              <v-list-item-title>{{ cat }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="
                () => {
                  selectedCategory = null
                  categoryMenu = false
                }
              "
            >
              <v-list-item-title>All Categories</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-left">
          <v-icon>assignment</v-icon>
          <span>Applications Today</span>
        </div>
        <div class="count">{{ applicationsToday }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>inventory</v-icon>
          <span>Active Services</span>
        </div>
        <div class="count">{{ activeServices }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>warning</v-icon>
          <span>Pending Approvals</span>
        </div>
        <div class="count">{{ pendingApprovals }}</div>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="content-card">
          <h3>Service Management</h3>
          <div v-for="service in services" :key="service.id" class="service-row">
            <v-avatar color="green" size="40">
              <v-icon color="white">accessible</v-icon>
            </v-avatar>

            <div class="service-info">
              <strong>{{ service.name }}</strong>
              <span>Service Name</span>
            </div>

            <div class="service-info">
              <strong>{{ service.category }}</strong>
              <span>Category</span>
            </div>

            <div class="service-info">
              <strong>{{ service.description }}</strong>
              <span>Description</span>
            </div>

            <div style="position: relative" class="service-actions-wrapper">
              <button class="actions-btn" @click="toggleServiceActions(service.id)">
                Actions
                <v-icon end>expand_more</v-icon>
              </button>

              <div v-if="openServiceActionId === service.id" class="actions-menu">
                <button @click="editServiceAction(service)">Edit</button>
                <button @click="updateServiceStatus(service.id, 3)">Archive</button>
                <button @click="updateServiceStatus(service.id, 2)">Draft</button>
              </div>
            </div>
          </div>
        </v-card>

        <v-card class="content-card mt-4">
          <h3>Application Review</h3>
          <div v-for="app in applications" :key="app.id" class="review-row">
            <div class="review-cell applicant">
              <v-avatar size="40">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRUcux_QhsmbgtdjMe3q2djMPS2oKtPYUAEw&s"
                />
              </v-avatar>
              <div>
                <div class="value">{{ app.applicant_name }}</div>
                <div class="label">Applicant</div>
              </div>
            </div>

            <div class="review-cell">
              <div class="value">{{ app.disability_type }}</div>
              <div class="label">Disability</div>
            </div>

            <div class="review-cell">
              <div class="value">{{ app.name }}</div>
              <div class="label">Service</div>
            </div>

            <div class="review-cell">
              <div class="value">{{ app.date_created ? app.date_created.split('T')[0] : '' }}</div>
              <div class="label">Date</div>
            </div>

            <div class="review-actions">
              <div class="service-actions-wrapper">
                <button class="actions-btn" @click="toggleApplicationActions(app.id)">
                  {{ applicationStatusLabel(app.status) }}
                  <v-icon end>expand_more</v-icon>
                </button>

                <div v-if="openApplicationActionId === app.id" class="actions-menu">
                  <button @click="updateApplicationStatus(app.id, 2)">Approve</button>
                  <button @click="updateApplicationStatus(app.id, 3)">Deny</button>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="content-card">
          <h3>Appointments</h3>
          <div class="appointment">
            <v-avatar color="green" size="40">
              <v-icon color="white">accessible</v-icon>
            </v-avatar>
            <div>
              <strong>Thu, Dec 18 – J. Dela Cruz</strong>
              <p>11:30 AM – 12:00 PM</p>
            </div>
          </div>
        </v-card>

        <v-card class="content-card mt-4">
          <h3>Activity Logs</h3>
          <p>
            Admin John sent a scheduled appointment.
            <span class="link">View</span>
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editDialog" max-width="600">
      <v-card title="Edit Service">
        <v-card-text>
          <v-text-field v-model="editServiceData.name" label="Service Name*" required />
          <v-text-field v-model="editServiceData.description" label="Description*" required />
          <v-autocomplete
            v-model="editServiceData.category"
            :items="['Financial', 'Goods', 'Training', 'Medical']"
            label="Category"
          />
          <v-text-field v-model="editServiceData.requirements" label="Requirements*" required />
          <v-date-input v-model="editServiceData.date_created" label="Cut-Off Date" />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="editDialog = false">Close</v-btn>
          <v-btn color="primary" @click="saveEditService">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.content-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}
.content-card h3 {
  margin-bottom: 16px;
}
.service-row {
  display: grid;
  grid-template-columns: auto 1.6fr 1.6fr 1fr auto auto;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}
.service-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}
.status.active {
  color: #1e8e3e;
  font-weight: 600;
}
.link-btn {
  background: none;
  border: none;
  color: #0d6efd;
  cursor: pointer;
}
.review-row {
  display: grid;
  grid-template-columns: 2.4fr 1.4fr 1.6fr 1.2fr auto;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
}
.review-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.review-cell.applicant {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.review-actions,
.service-actions-wrapper {
  position: relative;
  justify-content: flex-end;
  align-items: center;
}

.actions-menu {
  position: absolute;
  top: 42px;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: visible;
  z-index: 999;
  min-width: 120px;
  display: flex;
  flex-direction: column;
}

.actions-menu button {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
}
.actions-menu button:hover {
  background: #eef5f9;
}

.value {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}
.label {
  font-size: 12px;
  color: #8a8a8a;
  line-height: 1.2;
}
.actions-btn {
  background: #0b1b5a;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 6px 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  cursor: pointer;
}
.pill {
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pill.dark {
  background: #0b1b5a;
  color: white;
}
</style>
