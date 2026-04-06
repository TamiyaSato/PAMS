<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import type { serviceResponse } from '@/models/serviceResponse'

// ---- Types ----
interface ServiceHistoryEntry {
  id: number
  service_name: string
  service_category: string
  service_description: string
  service_requirements: string
  status: string
  date_created: string
  thumbnail?: string
}

// ---- State ----
const loading = ref(false)
const historyEntries = ref<ServiceHistoryEntry[]>([])
const searchQuery = ref('')
const activeTab = ref('All')
const selectedEntry = ref<ServiceHistoryEntry | null>(null)
const detailDialog = ref(false)

const tabs = ['All', 'Active', 'Draft', 'Archived']

// ---- Category color & icon maps ----
const categoryColors: Record<string, string> = {
  Financial: '#0b1b5a',
  Medical: '#e53935',
  Training: '#ffbf00',
  Mobility: '#1e8e3e',
  Counseling: '#1976d2',
  Education: '#7b1fa2',
  'Device Distribution': '#e53935',
  'Mobility Aid': '#1e8e3e',
  'Food Pack': '#0b1b5a',
  'Counseling Services': '#1976d2',
  'Mental Health': '#1976d2',
}

const categoryIcons: Record<string, string> = {
  Financial: 'account_balance',
  Medical: 'medical_services',
  Training: 'school',
  Mobility: 'accessible',
  Counseling: 'support_agent',
  Education: 'menu_book',
  'Device Distribution': 'devices',
  'Mobility Aid': 'accessible',
  'Food Pack': 'lunch_dining',
  'Counseling Services': 'support_agent',
  'Mental Health': 'support_agent',
}

const categoryImages: Record<string, string> = {
  Financial: '/dswd-10.jpg',
  Medical: '/eyeglass1-1024x683.jpg',
  Training: '/Livelihood-1-1024x576.jpg',
  Mobility: '/wheelchair.jpg',
  Counseling: '/counseling.jpg',
  Education: '/ffps-5.jpg',
  'Device Distribution': '/eyeglass1-1024x683.jpg',
  'Mobility Aid': '/wheelchair.jpg',
  'Food Pack': '/ffps-5.jpg',
  'Counseling Services': '/counseling.jpg',
  'Mental Health': '/counseling.jpg',
}

// ---- Computed ----
const filteredEntries = computed(() => {
  let list = historyEntries.value

  if (activeTab.value === 'Active') list = list.filter((e) => e.status === 'Active')
  else if (activeTab.value === 'Draft') list = list.filter((e) => e.status === 'Draft')
  else if (activeTab.value === 'Archived') list = list.filter((e) => e.status === 'Archived')

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (e) =>
        e.service_name.toLowerCase().includes(q) ||
        e.service_category.toLowerCase().includes(q) ||
        e.service_description.toLowerCase().includes(q),
    )
  }

  // Sort: Active services first when on "All" tab
  if (activeTab.value === 'All') {
    const statusOrder: Record<string, number> = { Active: 0, Draft: 1, Archived: 2 }
    list = [...list].sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99))
  }

  return list
})

const totalStats = computed(() => {
  const total = historyEntries.value.length
  const active = historyEntries.value.filter((e) => e.status === 'Active').length
  const draft = historyEntries.value.filter((e) => e.status === 'Draft').length
  const archived = historyEntries.value.filter((e) => e.status === 'Archived').length
  return { total, active, draft, archived }
})

// ---- Helpers ----
function statusLabel(active: number): string {
  switch (active) {
    case 1:
      return 'Active'
    case 2:
      return 'Draft'
    case 3:
      return 'Archived'
    default:
      return 'Unknown'
  }
}

function statusColor(active: number): string {
  switch (active) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'grey'
    default:
      return 'grey'
  }
}

function categoryColor(category: string): string {
  // Try exact match first
  if (categoryColors[category]) return categoryColors[category]
  // Try case-insensitive match
  const lower = category.toLowerCase()
  for (const [key, value] of Object.entries(categoryColors)) {
    if (key.toLowerCase() === lower) return value
  }
  return '#607d8b'
}

function categoryIcon(category: string): string {
  // Try exact match first
  if (categoryIcons[category]) return categoryIcons[category]
  // Try case-insensitive match
  const lower = category.toLowerCase()
  for (const [key, value] of Object.entries(categoryIcons)) {
    if (key.toLowerCase() === lower) return value
  }
  return 'inventory_2'
}

function categoryImage(category: string): string {
  // Try exact match first
  if (categoryImages[category]) return categoryImages[category]
  // Try case-insensitive match
  const lower = category.toLowerCase()
  for (const [key, value] of Object.entries(categoryImages)) {
    if (key.toLowerCase() === lower) return value
  }
  return ''
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatFullDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function openDetail(entry: ServiceHistoryEntry | null) {
  if (!entry) return
  selectedEntry.value = entry
  detailDialog.value = true
}

// ---- Fetch ----
async function fetchServiceHistory() {
  loading.value = true
  try {
    const res = await api.get<serviceResponse[]>('/api/v1/service-types')
    const data = Array.isArray(res.data) ? res.data : []

    if (data.length === 0) {
      historyEntries.value = getMockServiceData()
    } else {
      historyEntries.value = data.map((item) => {
        const rawDate = item.date_created ?? ''
        let formattedDate = ''
        if (rawDate) {
          const d = new Date(rawDate)
          if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString().split('T')[0] ?? ''
          } else {
            formattedDate = String(rawDate).split('T')[0] ?? ''
          }
        }

        return {
          id: Number(item.id) || 0,
          service_name: String(item.name ?? ''),
          service_category: String(item.category ?? ''),
          service_description: String(item.description ?? ''),
          service_requirements: String(item.requirements ?? ''),
          status: item.active === 1 ? 'Active' : item.active === 2 ? 'Draft' : 'Archived',
          date_created: formattedDate,
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch service history:', error)
    historyEntries.value = getMockServiceData()
  } finally {
    loading.value = false
  }
}

function getMockServiceData(): ServiceHistoryEntry[] {
  return [
    {
      id: 1,
      service_name: 'Financial Assistance',
      service_category: 'Financial',
      service_description: 'Monthly financial aid for persons with disabilities',
      service_requirements: 'Valid PWD ID, Barangay Certificate, Income Statement',
      status: 'Active',
      date_created: '2025-01-05',
    },
    {
      id: 2,
      service_name: 'Medical Aid',
      service_category: 'Medical',
      service_description: 'Coverage for medical expenses and check-ups',
      service_requirements: 'Medical Certificate, PWD ID, Referral Letter',
      status: 'Active',
      date_created: '2025-01-10',
    },
    {
      id: 3,
      service_name: 'Skills Training',
      service_category: 'Training',
      service_description: 'Vocational and livelihood skills development',
      service_requirements: 'PWD ID, Training Application Form',
      status: 'Active',
      date_created: '2025-01-08',
    },
    {
      id: 4,
      service_name: 'Wheelchair Provision',
      service_category: 'Mobility',
      service_description: 'Free wheelchairs and mobility devices',
      service_requirements: 'Medical Certificate, PWD ID, Assessment Form',
      status: 'Draft',
      date_created: '2025-01-03',
    },
    {
      id: 5,
      service_name: 'Psychological Counseling',
      service_category: 'Mental Health',
      service_description: 'Mental health support and counseling sessions',
      service_requirements: 'Referral Form, PWD ID, Medical Abstract',
      status: 'Active',
      date_created: '2025-01-12',
    },
    {
      id: 6,
      service_name: 'Scholarship Program',
      service_category: 'Education',
      service_description: 'Educational assistance for PWD students',
      service_requirements: 'School ID, Grades, PWD ID, Application Form',
      status: 'Active',
      date_created: '2024-12-20',
    },
    {
      id: 7,
      service_name: 'Food Pack Assistance',
      service_category: 'Food Pack',
      service_description: 'Food assistance program for PWD families',
      service_requirements: 'PWD ID, Barangay Certification, Family List',
      status: 'Archived',
      date_created: '2024-12-15',
    },
    {
      id: 8,
      service_name: 'Eyeglass Distribution',
      service_category: 'Device Distribution',
      service_description: 'Free eyeglasses for visually impaired persons',
      service_requirements: 'Eye Examination Report, PWD ID, Prescription',
      status: 'Active',
      date_created: '2025-01-11',
    },
    {
      id: 9,
      service_name: 'Livelihood Training',
      service_category: 'Training',
      service_description: 'Vocational and livelihood skills development',
      service_requirements: 'PWD ID, Livelihood Application Form',
      status: 'Active',
      date_created: '2024-11-20',
    },
  ]
}

onMounted(() => {
  fetchServiceHistory()
})
</script>

<template>
  <div class="service-history-view">
    <div class="top-header">
      <h2>Service History Gallery</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search history..." v-model="searchQuery" />
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-left">
          <v-icon>inventory_2</v-icon>
          <span>Total Services</span>
        </div>
        <div class="count">{{ totalStats.total }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>check_circle</v-icon>
          <span>Active</span>
        </div>
        <div class="count">{{ totalStats.active }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>draft</v-icon>
          <span>Draft</span>
        </div>
        <div class="count">{{ totalStats.draft }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>archive</v-icon>
          <span>Archived</span>
        </div>
        <div class="count">{{ totalStats.archived }}</div>
      </div>
    </div>

    <!-- Tabs -->
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

      <!-- Gallery Grid -->
      <div v-if="filteredEntries.length" class="gallery-grid">
        <div
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="gallery-card"
          @click="openDetail(entry)"
        >
          <!-- Card Image -->
          <div class="card-image" :style="{ background: categoryColor(entry.service_category) }">
            <img
              v-if="categoryImage(entry.service_category)"
              :src="categoryImage(entry.service_category)"
              :alt="entry.service_category"
            />
            <div class="card-image-overlay">
              <v-icon color="white" size="36">{{ categoryIcon(entry.service_category) }}</v-icon>
            </div>
            <div class="card-status-badge">
              <span :class="['status-dot', statusColor(entry.status === 'Active' ? 1 : entry.status === 'Draft' ? 2 : 3)]"></span>
              {{ statusLabel(entry.status === 'Active' ? 1 : entry.status === 'Draft' ? 2 : 3) }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="card-title-row">
              <h4 class="card-title">{{ entry.service_name }}</h4>
            </div>

            <div class="card-category">{{ entry.service_category }}</div>

            <p class="card-description">{{ entry.service_description }}</p>

            <div class="card-divider"></div>

            <div class="card-requirements-row">
              <span class="material-symbols-outlined requirements-icon">assignment</span>
              <span class="card-requirements-text">{{ entry.service_requirements }}</span>
            </div>

            <div class="card-dates-row">
              <div class="card-date-item">
                <span class="material-symbols-outlined date-icon">event</span>
                <span class="date-label">Cut Off</span>
                <span class="date-value">{{ formatDate(entry.date_created) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <span class="card-id">Service #{{ entry.id }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-gallery">
        <v-icon size="64" color="grey-lighten-1">inventory_2</v-icon>
        <p class="mt-4 text-h6 text-grey">No service history found</p>
        <p class="text-body-2 text-grey">Service records will appear here once transactions are processed.</p>
      </div>
    </div>

    <!-- Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="700">
      <v-card v-if="selectedEntry" class="detail-dialog-card">
        <v-card-title class="detail-dialog-header">
          <div class="detail-header-top">
            <div
              class="detail-header-icon"
              :style="{ background: categoryColor(selectedEntry.service_category) }"
            >
              <v-icon color="white" size="28">{{ categoryIcon(selectedEntry.service_category) }}</v-icon>
            </div>
            <div>
              <h3 class="detail-service-name">{{ selectedEntry.service_name }}</h3>
              <span class="detail-service-category">{{ selectedEntry.service_category }}</span>
            </div>
          </div>
          <v-btn icon variant="text" @click="detailDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="detail-dialog-body">
          <!-- Status Badge -->
          <div class="detail-status-row">
            <v-chip
              :color="statusColor(selectedEntry.status === 'Active' ? 1 : selectedEntry.status === 'Draft' ? 2 : 3)"
              size="small"
              variant="flat"
            >
              {{ statusLabel(selectedEntry.status === 'Active' ? 1 : selectedEntry.status === 'Draft' ? 2 : 3) }}
            </v-chip>
            <span class="detail-id-label">Service #{{ selectedEntry.id }}</span>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-section-title">
                  <span class="material-symbols-outlined section-icon">info</span>
                  Service Details
                </h4>
                <div class="detail-field">
                  <span class="detail-label">Service Name</span>
                  <span class="detail-value">{{ selectedEntry.service_name }}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-label">Category</span>
                  <span class="detail-value">{{ selectedEntry.service_category }}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">{{ selectedEntry.status }}</span>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-section-title">
                  <span class="material-symbols-outlined section-icon">event</span>
                  Service Information
                </h4>
                <div class="detail-field">
                  <span class="detail-label">Date Created</span>
                  <span class="detail-value">{{ formatDate(selectedEntry.date_created) }}</span>
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="detail-section">
            <h4 class="detail-section-title">
              <span class="material-symbols-outlined section-icon">assignment</span>
              Requirements
            </h4>
            <p class="detail-requirements">{{ selectedEntry.service_requirements }}</p>
          </div>

          <div class="detail-section">
            <h4 class="detail-section-title">
              <span class="material-symbols-outlined section-icon">info</span>
              Description
            </h4>
            <p class="detail-description-text">{{ selectedEntry.service_description }}</p>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="detail-dialog-actions">
          <v-spacer />
          <v-btn @click="detailDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
/* === Wrapper === */
.service-history-view {
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

/* === Gallery Grid === */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 8px 0;
}

.gallery-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e8edf3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Card Image */
.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
}

.card-image-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  color: white;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.success {
  background: #4caf50;
}

.status-dot.warning {
  background: #ffbf00;
}

.status-dot.error {
  background: #e53935;
}

.status-dot.info {
  background: #1976d2;
}

/* Card Body */
.card-body {
  padding: 16px;
}

.card-title-row {
  margin-bottom: 2px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2a44;
  margin: 0;
  line-height: 1.3;
}

.card-category {
  font-size: 12px;
  color: #8a8a8a;
  text-transform: capitalize;
  margin-bottom: 8px;
}

.card-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.45;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-divider {
  height: 1px;
  background: #e8edf3;
  margin: 0 0 12px;
}

.card-requirements-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.requirements-icon {
  font-size: 18px;
  color: #0b1b5a;
  margin-top: 2px;
}

.card-requirements-text {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  flex: 1;
}

.card-dates-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.card-date-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.date-icon {
  font-size: 16px;
  color: #8a8a8a;
}

.date-label {
  color: #8a8a8a;
  font-weight: 500;
}

.date-value {
  color: #374151;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f4f8;
}

.card-id {
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}

/* Empty State */
.empty-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

/* === Detail Dialog === */
.detail-dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.detail-dialog-header {
  padding: 20px 24px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.detail-header-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.detail-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-service-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2a44;
  margin: 0;
  line-height: 1.2;
}

.detail-service-category {
  font-size: 12px;
  color: #8a8a8a;
  text-transform: capitalize;
}

.detail-dialog-body {
  padding: 20px 24px;
}

.detail-status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-id-label {
  font-size: 13px;
  color: #9ca3af;
  font-family: monospace;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2a44;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-icon {
  font-size: 18px;
  color: #0b1b5a;
}

.detail-field {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  align-items: baseline;
}

.detail-label {
  min-width: 100px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #374151;
  font-weight: 400;
}

.detail-notes {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  background: #f0f4f8;
  border-radius: 10px;
  padding: 12px 16px;
  margin: 0;
}

.detail-description-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

.detail-requirements {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  background: #f0f4f8;
  border-radius: 10px;
  padding: 12px 16px;
  margin: 0;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 14px;
}

.doc-file-icon {
  font-size: 20px;
  color: #0b1b5a;
}

.doc-name {
  font-weight: 500;
}

.detail-dialog-actions {
  padding: 12px 24px;
}

/* Material Icons */
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}

/* Utility */
.mt-4 {
  margin-top: 16px;
}
</style>
