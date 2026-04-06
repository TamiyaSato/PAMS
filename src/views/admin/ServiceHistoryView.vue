<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

// ---- Types ----
interface ServiceHistoryEntry {
  id: number
  service_id: number
  service_name: string
  service_category: string
  service_description: string
  person_id: number
  person_name: string
  person_disability_type: string
  person_contact: string
  status: number
  applied_at: string
  approved_at: string | null
  completed_at: string | null
  notes: string | null
  documents: string[]
  thumbnail?: string
}

// ---- State ----
const loading = ref(false)
const historyEntries = ref<ServiceHistoryEntry[]>([])
const searchQuery = ref('')
const activeTab = ref('All')
const selectedEntry = ref<ServiceHistoryEntry | null>(null)
const detailDialog = ref(false)

const tabs = ['All', 'Completed', 'Approved', 'Pending', 'Denied']

// ---- Category color & icon maps ----
const categoryColors: Record<string, string> = {
  Financial: '#0b1b5a',
  Medical: '#e53935',
  Training: '#ffbf00',
  Mobility: '#1e8e3e',
  Counseling: '#1976d2',
  Education: '#7b1fa2',
}

const categoryIcons: Record<string, string> = {
  Financial: 'account_balance',
  Medical: 'medical_services',
  Training: 'school',
  Mobility: 'accessible',
  Counseling: 'support_agent',
  Education: 'menu_book',
}

const categoryImages: Record<string, string> = {
  Financial: '/src/assets/Rectangle 148.png',
  Medical: '/src/assets/wheelchair.jpg',
  Training: '/src/assets/blind.jpg',
  Mobility: '/src/assets/wheelchair.jpg',
  Counseling: '/src/assets/catto.jpg',
  Education: '/src/assets/Rectangle 148.png',
}

// ---- Computed ----
const filteredEntries = computed(() => {
  let list = historyEntries.value

  if (activeTab.value === 'Completed') list = list.filter((e) => e.status === 4)
  else if (activeTab.value === 'Approved') list = list.filter((e) => e.status === 2)
  else if (activeTab.value === 'Pending') list = list.filter((e) => e.status === 1)
  else if (activeTab.value === 'Denied') list = list.filter((e) => e.status === 3)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (e) =>
        e.service_name.toLowerCase().includes(q) ||
        e.person_name.toLowerCase().includes(q) ||
        e.service_category.toLowerCase().includes(q) ||
        e.person_disability_type.toLowerCase().includes(q),
    )
  }

  return list
})

const totalStats = computed(() => {
  const total = historyEntries.value.length
  const approved = historyEntries.value.filter((e) => e.status === 2).length
  const pending = historyEntries.value.filter((e) => e.status === 1).length
  const denied = historyEntries.value.filter((e) => e.status === 3).length
  const completed = historyEntries.value.filter((e) => e.status === 4).length
  return { total, approved, pending, denied, completed }
})

// ---- Helpers ----
function statusLabel(status: number): string {
  switch (status) {
    case 2:
      return 'Approved'
    case 3:
      return 'Denied'
    case 4:
      return 'Completed'
    default:
      return 'Pending'
  }
}

function statusColor(status: number): string {
  switch (status) {
    case 2:
      return 'success'
    case 3:
      return 'error'
    case 4:
      return 'info'
    default:
      return 'warning'
  }
}

function categoryColor(category: string): string {
  return categoryColors[category] || '#607d8b'
}

function categoryIcon(category: string): string {
  return categoryIcons[category] || 'inventory_2'
}

function categoryImage(category: string): string {
  return categoryImages[category] || ''
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
    const res = await api.get<ServiceHistoryEntry[]>('/api/v1/transactions/history?top=100')
    historyEntries.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Failed to fetch service history:', error)
    applyMockData()
  } finally {
    loading.value = false
  }
}

function applyMockData() {
  historyEntries.value = [
    {
      id: 1201,
      service_id: 1,
      service_name: 'Financial Assistance',
      service_category: 'Financial',
      service_description: 'Monthly financial aid for persons with disabilities',
      person_id: 101,
      person_name: 'Maria Santos',
      person_disability_type: 'Visual Impairment',
      person_contact: '0917-123-4567',
      status: 4,
      applied_at: '2025-01-05T08:00:00Z',
      approved_at: '2025-01-07T10:00:00Z',
      completed_at: '2025-01-15T08:30:00Z',
      notes: 'Received full amount of financial assistance.',
      documents: ['receipt_001.pdf', 'approval_letter.pdf'],
    },
    {
      id: 1202,
      service_id: 2,
      service_name: 'Medical Aid',
      service_category: 'Medical',
      service_description: 'Coverage for medical expenses and check-ups',
      person_id: 102,
      person_name: 'Juan dela Cruz',
      person_disability_type: 'Mobility Disability',
      person_contact: '0918-234-5678',
      status: 1,
      applied_at: '2025-01-10T14:00:00Z',
      approved_at: null,
      completed_at: null,
      notes: null,
      documents: ['medical_cert.pdf'],
    },
    {
      id: 1203,
      service_id: 3,
      service_name: 'Skills Training',
      service_category: 'Training',
      service_description: 'Vocational and livelihood skills development',
      person_id: 103,
      person_name: 'Ana Reyes',
      person_disability_type: 'Hearing Impairment',
      person_contact: '0919-345-6789',
      status: 2,
      applied_at: '2025-01-08T10:15:00Z',
      approved_at: '2025-01-10T09:00:00Z',
      completed_at: null,
      notes: 'Enrolled in next training batch.',
      documents: ['application_form.pdf', 'id_copy.pdf'],
    },
    {
      id: 1204,
      service_id: 4,
      service_name: 'Wheelchair Provision',
      service_category: 'Mobility',
      service_description: 'Free wheelchairs and mobility devices',
      person_id: 104,
      person_name: 'Pedro Garcia',
      person_disability_type: 'Mobility Disability',
      person_contact: '0920-456-7890',
      status: 3,
      applied_at: '2025-01-03T16:45:00Z',
      approved_at: null,
      completed_at: null,
      notes: 'Incomplete documentation provided.',
      documents: ['partial_form.pdf'],
    },
    {
      id: 1205,
      service_id: 5,
      service_name: 'Psychological Counseling',
      service_category: 'Counseling',
      service_description: 'Mental health support and counseling sessions',
      person_id: 105,
      person_name: 'Luz Villanueva',
      person_disability_type: 'Cognitive Disability',
      person_contact: '0921-567-8901',
      status: 1,
      applied_at: '2025-01-12T09:00:00Z',
      approved_at: null,
      completed_at: null,
      notes: null,
      documents: ['referral_letter.pdf'],
    },
    {
      id: 1206,
      service_id: 6,
      service_name: 'Scholarship Program',
      service_category: 'Education',
      service_description: 'Educational assistance for PWD students',
      person_id: 106,
      person_name: 'Carlos Mendoza',
      person_disability_type: 'Visual Impairment',
      person_contact: '0922-678-9012',
      status: 4,
      applied_at: '2024-12-20T11:30:00Z',
      approved_at: '2024-12-22T14:00:00Z',
      completed_at: '2025-01-10T08:00:00Z',
      notes: 'Scholarship granted for Spring 2025 semester.',
      documents: ['grades.pdf', 'enrollment_form.pdf'],
    },
    {
      id: 1207,
      service_id: 1,
      service_name: 'Financial Assistance',
      service_category: 'Financial',
      service_description: 'Monthly financial aid for persons with disabilities',
      person_id: 107,
      person_name: 'Rosa Fernandez',
      person_disability_type: 'Speech Impairment',
      person_contact: '0923-789-0123',
      status: 4,
      applied_at: '2024-12-15T07:30:00Z',
      approved_at: '2024-12-18T09:00:00Z',
      completed_at: '2025-01-05T10:00:00Z',
      notes: null,
      documents: ['application.pdf'],
    },
    {
      id: 1208,
      service_id: 2,
      service_name: 'Medical Aid',
      service_category: 'Medical',
      service_description: 'Coverage for medical expenses and check-ups',
      person_id: 108,
      person_name: 'Diego Ramos',
      person_disability_type: 'Mobility Disability',
      person_contact: '0924-890-1234',
      status: 2,
      applied_at: '2025-01-11T11:00:00Z',
      approved_at: '2025-01-13T14:30:00Z',
      completed_at: null,
      notes: 'Approved for physical therapy sessions.',
      documents: ['medical_cert.pdf', 'doctor_referral.pdf'],
    },
    {
      id: 1209,
      service_id: 3,
      service_name: 'Skills Training',
      service_category: 'Training',
      service_description: 'Vocational and livelihood skills development',
      person_id: 109,
      person_name: 'Elena Torres',
      person_disability_type: 'Hearing Impairment',
      person_contact: '0925-901-2345',
      status: 4,
      applied_at: '2024-11-20T08:45:00Z',
      approved_at: '2024-11-22T10:00:00Z',
      completed_at: '2024-12-28T16:00:00Z',
      notes: 'Completed sewing certification course.',
      documents: ['certificate.pdf', 'attendance.pdf'],
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
          <v-icon>history</v-icon>
          <span>Total Records</span>
        </div>
        <div class="count">{{ totalStats.total }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>check_circle</v-icon>
          <span>Approved</span>
        </div>
        <div class="count">{{ totalStats.approved }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>pending</v-icon>
          <span>Pending</span>
        </div>
        <div class="count">{{ totalStats.pending }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>cancel</v-icon>
          <span>Denied</span>
        </div>
        <div class="count">{{ totalStats.denied }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>task_alt</v-icon>
          <span>Completed</span>
        </div>
        <div class="count">{{ totalStats.completed }}</div>
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
              <span :class="['status-dot', statusColor(entry.status)]"></span>
              {{ statusLabel(entry.status) }}
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

            <div class="card-person-row">
              <v-avatar size="28" color="primary">
                <span class="text-white text-caption" style="font-size: 12px; font-weight: 600">
                  {{ entry.person_name.charAt(0) }}
                </span>
              </v-avatar>
              <span class="card-person-name">{{ entry.person_name }}</span>
              <span class="card-person-disability">{{ entry.person_disability_type }}</span>
            </div>

            <div class="card-dates-row">
              <div class="card-date-item">
                <span class="material-symbols-outlined date-icon">event</span>
                <span class="date-label">Applied</span>
                <span class="date-value">{{ formatDate(entry.applied_at) }}</span>
              </div>
              <div v-if="entry.completed_at" class="card-date-item">
                <span class="material-symbols-outlined date-icon">check_circle</span>
                <span class="date-label">Completed</span>
                <span class="date-value">{{ formatDate(entry.completed_at) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="card-docs">
                <span class="material-symbols-outlined doc-icon">description</span>
                <span>{{ entry.documents.length }} document{{ entry.documents.length !== 1 ? 's' : '' }}</span>
              </div>
              <span class="card-id">#{{ entry.id }}</span>
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
              :color="statusColor(selectedEntry.status)"
              size="small"
              variant="flat"
            >
              {{ statusLabel(selectedEntry.status) }}
            </v-chip>
            <span class="detail-id-label">Record #{{ selectedEntry.id }}</span>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-section-title">
                  <span class="material-symbols-outlined section-icon">person</span>
                  Applicant Information
                </h4>
                <div class="detail-field">
                  <span class="detail-label">Name</span>
                  <span class="detail-value">{{ selectedEntry.person_name }}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-label">Disability Type</span>
                  <span class="detail-value">{{ selectedEntry.person_disability_type }}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-label">Contact</span>
                  <span class="detail-value">{{ selectedEntry.person_contact }}</span>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-section-title">
                  <span class="material-symbols-outlined section-icon">event</span>
                  Service Timeline
                </h4>
                <div class="detail-field">
                  <span class="detail-label">Applied</span>
                  <span class="detail-value">{{ formatFullDate(selectedEntry.applied_at) }}</span>
                </div>
                <div v-if="selectedEntry.approved_at" class="detail-field">
                  <span class="detail-label">Approved</span>
                  <span class="detail-value">{{ formatFullDate(selectedEntry.approved_at) }}</span>
                </div>
                <div v-if="selectedEntry.completed_at" class="detail-field">
                  <span class="detail-label">Completed</span>
                  <span class="detail-value">{{ formatFullDate(selectedEntry.completed_at) }}</span>
                </div>
              </div>
            </v-col>
          </v-row>

          <div v-if="selectedEntry.notes" class="detail-section">
            <h4 class="detail-section-title">
              <span class="material-symbols-outlined section-icon">note</span>
              Notes
            </h4>
            <p class="detail-notes">{{ selectedEntry.notes }}</p>
          </div>

          <div v-if="selectedEntry.documents.length" class="detail-section">
            <h4 class="detail-section-title">
              <span class="material-symbols-outlined section-icon">description</span>
              Documents ({{ selectedEntry.documents.length }})
            </h4>
            <div class="document-list">
              <div v-for="doc in selectedEntry.documents" :key="doc" class="document-item">
                <span class="material-symbols-outlined doc-file-icon">description</span>
                <span class="doc-name">{{ doc }}</span>
              </div>
            </div>
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

.card-person-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.card-person-name {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.card-person-disability {
  font-size: 11px;
  color: #8a8a8a;
  margin-left: auto;
  background: #f0f4f8;
  padding: 3px 8px;
  border-radius: 999px;
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
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f4f8;
}

.card-docs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.doc-icon {
  font-size: 16px;
  color: #8a8a8a;
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
