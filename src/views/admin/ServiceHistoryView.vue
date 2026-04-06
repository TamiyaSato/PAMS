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
}

interface ServiceSummary {
  service_name: string
  category: string
  total_count: number
  approved_count: number
  pending_count: number
  denied_count: number
  completed_count: number
  last_used: string
  description: string
}

// ---- State ----
const loading = ref(false)
const historyEntries = ref<ServiceHistoryEntry[]>([])
const serviceSummaries = ref<ServiceSummary[]>([])
const searchQuery = ref('')
const selectedCategory = ref('All')
const selectedStatus = ref('All')
const selectedEntry = ref<ServiceHistoryEntry | null>(null)
const detailDialog = ref(false)
const viewMode = ref<'gallery' | 'timeline'>('gallery')

const categoryOptions = computed(() => {
  const cats = new Set(serviceSummaries.value.map((s) => s.category))
  return ['All', ...Array.from(cats)]
})

const statusOptions = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Pending', value: '1' },
  { label: 'Approved', value: '2' },
  { label: 'Denied', value: '3' },
  { label: 'Completed', value: '4' },
]

const filteredSummaries = computed(() => {
  let list = serviceSummaries.value

  if (selectedCategory.value !== 'All') {
    list = list.filter((s) => s.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (s) =>
        s.service_name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    )
  }

  return list
})

const filteredEntries = computed(() => {
  let list = historyEntries.value

  if (selectedCategory.value !== 'All') {
    list = list.filter((e) => e.service_category === selectedCategory.value)
  }

  if (selectedStatus.value !== 'All') {
    list = list.filter((e) => e.status === Number(selectedStatus.value))
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (e) =>
        e.service_name.toLowerCase().includes(q) ||
        e.person_name.toLowerCase().includes(q) ||
        e.person_disability_type.toLowerCase().includes(q),
    )
  }

  return list
})

const totalStats = computed(() => {
  const total = historyEntries.value.length
  const approved = historyEntries.value.filter((e) => e.status === 2).length
  const pending = historyEntries.value.filter((e) => e.status === 1).length
  const completed = historyEntries.value.filter((e) => e.status === 4).length
  return { total, approved, pending, completed }
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

function categoryIcon(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('financial')) return 'account_balance'
  if (c.includes('medical') || c.includes('health')) return 'medical_services'
  if (c.includes('training') || c.includes('skill')) return 'school'
  if (c.includes('mobility')) return 'accessible'
  if (c.includes('counseling')) return 'support_agent'
  if (c.includes('education')) return 'menu_book'
  return 'inventory_2'
}

function categoryColor(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('financial')) return '#0b1b5a'
  if (c.includes('medical') || c.includes('health')) return '#e53935'
  if (c.includes('training') || c.includes('skill')) return '#ffbf00'
  if (c.includes('mobility')) return '#1e8e3e'
  if (c.includes('counseling')) return '#1976d2'
  if (c.includes('education')) return '#7b1fa2'
  return '#607d8b'
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

function approvalRate(): number {
  if (totalStats.value.total === 0) return 0
  return Math.round((totalStats.value.approved / totalStats.value.total) * 100)
}

// ---- Fetch ----
async function fetchServiceHistory() {
  loading.value = true
  try {
    const [entriesRes, summariesRes] = await Promise.all([
      api.get<ServiceHistoryEntry[]>('/api/v1/transactions/history?top=100'),
      api.get<ServiceSummary[]>('/api/v1/analytics/services/summary'),
    ])

    historyEntries.value = Array.isArray(entriesRes.data) ? entriesRes.data : []
    serviceSummaries.value = Array.isArray(summariesRes.data) ? summariesRes.data : []
  } catch (error) {
    console.error('Failed to fetch service history:', error)
    applyMockData()
  } finally {
    loading.value = false
  }
}

function applyMockData() {
  serviceSummaries.value = [
    {
      service_name: 'Financial Assistance',
      category: 'Financial',
      total_count: 68,
      approved_count: 45,
      pending_count: 15,
      denied_count: 5,
      completed_count: 40,
      last_used: '2025-01-15T08:30:00Z',
      description: 'Monthly financial aid for persons with disabilities.',
    },
    {
      service_name: 'Medical Aid',
      category: 'Medical',
      total_count: 45,
      approved_count: 32,
      pending_count: 8,
      denied_count: 3,
      completed_count: 28,
      last_used: '2025-01-14T14:00:00Z',
      description: 'Coverage for medical expenses and check-ups.',
    },
    {
      service_name: 'Skills Training',
      category: 'Training',
      total_count: 38,
      approved_count: 28,
      pending_count: 6,
      denied_count: 2,
      completed_count: 25,
      last_used: '2025-01-14T10:15:00Z',
      description: 'Vocational and livelihood skills development.',
    },
    {
      service_name: 'Wheelchair Provision',
      category: 'Mobility',
      total_count: 22,
      approved_count: 18,
      pending_count: 3,
      denied_count: 1,
      completed_count: 16,
      last_used: '2025-01-13T16:45:00Z',
      description: 'Free wheelchairs and mobility devices.',
    },
    {
      service_name: 'Psychological Counseling',
      category: 'Counseling',
      total_count: 15,
      approved_count: 12,
      pending_count: 2,
      denied_count: 1,
      completed_count: 10,
      last_used: '2025-01-13T09:00:00Z',
      description: 'Mental health support and counseling sessions.',
    },
    {
      service_name: 'Scholarship Program',
      category: 'Education',
      total_count: 12,
      approved_count: 9,
      pending_count: 2,
      denied_count: 1,
      completed_count: 7,
      last_used: '2025-01-12T11:30:00Z',
      description: 'Educational assistance for PWD students.',
    },
  ]

  historyEntries.value = [
    {
      id: 1201,
      service_id: 1,
      service_name: 'Financial Assistance',
      service_category: 'Financial',
      service_description: 'Monthly financial aid',
      person_id: 101,
      person_name: 'Maria Santos',
      person_disability_type: 'Visual Impairment',
      person_contact: '0917-123-4567',
      status: 4,
      applied_at: '2025-01-05T08:00:00Z',
      approved_at: '2025-01-07T10:00:00Z',
      completed_at: '2025-01-15T08:30:00Z',
      notes: 'Received full amount.',
      documents: ['receipt_001.pdf', 'approval_letter.pdf'],
    },
    {
      id: 1202,
      service_id: 2,
      service_name: 'Medical Aid',
      service_category: 'Medical',
      service_description: 'Medical coverage',
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
      service_description: 'Vocational training',
      person_id: 103,
      person_name: 'Ana Reyes',
      person_disability_type: 'Hearing Impairment',
      person_contact: '0919-345-6789',
      status: 2,
      applied_at: '2025-01-08T10:15:00Z',
      approved_at: '2025-01-10T09:00:00Z',
      completed_at: null,
      notes: 'Enrolled in next batch.',
      documents: ['application_form.pdf', 'id_copy.pdf'],
    },
    {
      id: 1204,
      service_id: 4,
      service_name: 'Wheelchair Provision',
      service_category: 'Mobility',
      service_description: 'Free wheelchair',
      person_id: 104,
      person_name: 'Pedro Garcia',
      person_disability_type: 'Mobility Disability',
      person_contact: '0920-456-7890',
      status: 3,
      applied_at: '2025-01-03T16:45:00Z',
      approved_at: null,
      completed_at: null,
      notes: 'Incomplete documentation.',
      documents: ['partial_form.pdf'],
    },
    {
      id: 1205,
      service_id: 5,
      service_name: 'Psychological Counseling',
      service_category: 'Counseling',
      service_description: 'Mental health support',
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
      service_description: 'Student assistance',
      person_id: 106,
      person_name: 'Carlos Mendoza',
      person_disability_type: 'Visual Impairment',
      person_contact: '0922-678-9012',
      status: 4,
      applied_at: '2024-12-20T11:30:00Z',
      approved_at: '2024-12-22T14:00:00Z',
      completed_at: '2025-01-10T08:00:00Z',
      notes: 'Scholarship granted for Spring 2025.',
      documents: ['grades.pdf', 'enrollment_form.pdf'],
    },
  ]
}

onMounted(() => {
  fetchServiceHistory()
})
</script>

<template>
  <v-container fluid class="admin-container">
    <div class="top-header">
      <h2>Service History Gallery</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search history..."
            v-model="searchQuery"
          />
        </div>

        <div class="view-toggle">
          <button
            class="view-btn"
            :class="{ active: viewMode === 'gallery' }"
            @click="viewMode = 'gallery'"
          >
            <span class="material-symbols-outlined">grid_view</span>
            Gallery
          </button>
          <button
            class="view-btn"
            :class="{ active: viewMode === 'timeline' }"
            @click="viewMode = 'timeline'"
          >
            <span class="material-symbols-outlined">timeline</span>
            Timeline
          </button>
        </div>

        <button class="pill yellow" @click="fetchServiceHistory()">
          <span class="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats mb-4">
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
          <v-icon>task_alt</v-icon>
          <span>Completed</span>
        </div>
        <div class="count">{{ totalStats.completed }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-row mb-4">
      <v-select
        v-model="selectedCategory"
        :items="categoryOptions"
        label="Category"
        variant="outlined"
        density="compact"
        hide-details
        class="filter-select"
      />
      <v-select
        v-model="selectedStatus"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        label="Status"
        variant="outlined"
        density="compact"
        hide-details
        class="filter-select"
      />
      <div class="approval-badge">
        <span class="approval-label">Approval Rate</span>
        <span class="approval-value">{{ approvalRate() }}%</span>
        <div class="approval-bar-bg">
          <div class="approval-bar-fill" :style="{ width: approvalRate() + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Gallery View -->
    <div v-if="viewMode === 'gallery'">
      <v-row>
        <v-col
          v-for="summary in filteredSummaries"
          :key="summary.service_name"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="gallery-card" @click="openDetail(historyEntries.find((e) => e.service_name === summary.service_name) ?? null)">
            <div class="card-header" :style="{ background: categoryColor(summary.category) }">
              <v-icon color="white" size="28">{{ categoryIcon(summary.category) }}</v-icon>
              <div class="card-title-area">
                <h4>{{ summary.service_name }}</h4>
                <span class="card-category">{{ summary.category }}</span>
              </div>
            </div>

            <v-card-text class="card-body">
              <p class="card-description">{{ summary.description }}</p>

              <div class="card-stats">
                <div class="mini-stat">
                  <span class="mini-label">Total</span>
                  <span class="mini-value">{{ summary.total_count }}</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-label">Approved</span>
                  <span class="mini-value approved">{{ summary.approved_count }}</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-label">Pending</span>
                  <span class="mini-value pending">{{ summary.pending_count }}</span>
                </div>
              </div>

              <div class="card-bar-bg">
                <div
                  class="card-bar-fill"
                  :style="{
                    width: summary.total_count > 0 ? (summary.approved_count / summary.total_count) * 100 + '%' : '0%',
                    background: categoryColor(summary.category),
                  }"
                ></div>
              </div>

              <div class="card-footer">
                <span class="last-used">
                  <span class="material-symbols-outlined" size="14">schedule</span>
                  Last used: {{ formatDate(summary.last_used) }}
                </span>
                <v-chip
                  :color="summary.total_count > 30 ? 'success' : summary.total_count > 15 ? 'warning' : 'info'"
                  size="x-small"
                  variant="flat"
                >
                  {{ summary.total_count }} records
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="filteredSummaries.length === 0 && !loading" class="empty-gallery">
        <v-icon size="64" color="grey-lighten-1">inventory_2</v-icon>
        <p class="mt-4 text-h6 text-grey">No service history found</p>
        <p class="text-body-2 text-grey">Service records will appear here once transactions are processed.</p>
      </div>
    </div>

    <!-- Timeline View -->
    <div v-else-if="viewMode === 'timeline'" class="timeline-container">
      <div v-if="filteredEntries.length" class="timeline">
        <div
          v-for="(entry, idx) in filteredEntries"
          :key="entry.id"
          class="timeline-item"
          :class="{ 'is-first': idx === 0 }"
        >
          <div class="timeline-marker">
            <div
              class="marker-dot"
              :style="{ background: categoryColor(entry.service_category) }"
            ></div>
            <div
              v-if="idx < filteredEntries.length - 1"
              class="timeline-line"
            ></div>
          </div>

          <div class="timeline-content">
            <v-card class="timeline-card" @click="openDetail(entry)">
              <div class="timeline-card-header">
                <v-icon :color="categoryColor(entry.service_category)" size="24">
                  {{ categoryIcon(entry.service_category) }}
                </v-icon>
                <div class="timeline-card-title">
                  <h5>{{ entry.service_name }}</h5>
                  <span class="timeline-person">{{ entry.person_name }}</span>
                </div>
                <v-chip
                  :color="statusColor(entry.status)"
                  size="small"
                  variant="flat"
                >
                  {{ statusLabel(entry.status) }}
                </v-chip>
              </div>

              <div class="timeline-card-body">
                <div class="timeline-detail-row">
                  <span class="detail-label">Disability:</span>
                  <span class="detail-value">{{ entry.person_disability_type }}</span>
                </div>
                <div class="timeline-detail-row">
                  <span class="detail-label">Applied:</span>
                  <span class="detail-value">{{ formatFullDate(entry.applied_at) }}</span>
                </div>
                <div v-if="entry.approved_at" class="timeline-detail-row">
                  <span class="detail-label">Approved:</span>
                  <span class="detail-value">{{ formatFullDate(entry.approved_at) }}</span>
                </div>
                <div v-if="entry.completed_at" class="timeline-detail-row">
                  <span class="detail-label">Completed:</span>
                  <span class="detail-value">{{ formatFullDate(entry.completed_at) }}</span>
                </div>
                <div v-if="entry.notes" class="timeline-notes">
                  <span class="material-symbols-outlined note-icon">note</span>
                  {{ entry.notes }}
                </div>
              </div>

              <div class="timeline-card-footer">
                <div class="document-chips">
                  <v-chip
                    v-for="doc in entry.documents"
                    :key="doc"
                    size="x-small"
                    variant="outlined"
                  >
                    <span class="material-symbols-outlined mr-1" style="font-size: 14px">description</span>
                    {{ doc }}
                  </v-chip>
                </div>
                <span class="timeline-id">ID: #{{ entry.id }}</span>
              </div>
            </v-card>
          </div>
        </div>
      </div>

      <div v-else class="empty-gallery">
        <v-icon size="64" color="grey-lighten-1">timeline</v-icon>
        <p class="mt-4 text-h6 text-grey">No timeline entries found</p>
        <p class="text-body-2 text-grey">Try adjusting your filters.</p>
      </div>
    </div>

    <!-- Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="700">
      <v-card v-if="selectedEntry" class="detail-dialog-card">
        <v-card-title class="detail-dialog-header d-flex align-center">
          <v-icon :color="categoryColor(selectedEntry.service_category)" size="32" class="mr-3">
            {{ categoryIcon(selectedEntry.service_category) }}
          </v-icon>
          <div>
            <h3 class="text-h6">{{ selectedEntry.service_name }}</h3>
            <span class="text-body-2 text-grey">{{ selectedEntry.service_category }}</span>
          </div>
          <v-spacer />
          <v-btn icon variant="text" @click="detailDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="detail-dialog-body">
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-section-title">Applicant Information</h4>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">{{ selectedEntry.person_name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Disability Type:</span>
                  <span class="detail-value">{{ selectedEntry.person_disability_type }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Contact:</span>
                  <span class="detail-value">{{ selectedEntry.person_contact }}</span>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="detail-section">
                <h4 class="detail-section-title">Service Status</h4>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <v-chip
                    :color="statusColor(selectedEntry.status)"
                    size="small"
                    variant="flat"
                  >
                    {{ statusLabel(selectedEntry.status) }}
                  </v-chip>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Applied:</span>
                  <span class="detail-value">{{ formatFullDate(selectedEntry.applied_at) }}</span>
                </div>
                <div v-if="selectedEntry.approved_at" class="detail-row">
                  <span class="detail-label">Approved:</span>
                  <span class="detail-value">{{ formatFullDate(selectedEntry.approved_at) }}</span>
                </div>
                <div v-if="selectedEntry.completed_at" class="detail-row">
                  <span class="detail-label">Completed:</span>
                  <span class="detail-value">{{ formatFullDate(selectedEntry.completed_at) }}</span>
                </div>
              </div>
            </v-col>
          </v-row>

          <div v-if="selectedEntry.notes" class="detail-section">
            <h4 class="detail-section-title">Notes</h4>
            <p class="detail-notes">{{ selectedEntry.notes }}</p>
          </div>

          <div v-if="selectedEntry.documents.length" class="detail-section">
            <h4 class="detail-section-title">Documents</h4>
            <div class="document-list">
              <div v-for="doc in selectedEntry.documents" :key="doc" class="document-item">
                <v-icon size="20" color="primary" class="mr-2">description</v-icon>
                <span>{{ doc }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="detail-section-title">Service Description</h4>
            <p>{{ selectedEntry.service_description }}</p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="detailDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* View Toggle */
.view-toggle {
  display: flex;
  background: white;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
.view-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.view-btn.active {
  background: #0b1b5a;
  color: white;
}
.view-btn .material-symbols-outlined {
  font-size: 18px;
}

/* Filters Row */
.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-select {
  min-width: 160px;
  flex: 1;
  max-width: 220px;
}
.approval-badge {
  background: white;
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
}
.approval-label {
  font-size: 11px;
  color: #8a8a8a;
  text-transform: uppercase;
}
.approval-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e8e3e;
}
.approval-bar-bg {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
  margin-top: 6px;
  overflow: hidden;
}
.approval-bar-fill {
  height: 100%;
  background: #1e8e3e;
  border-radius: 999px;
  transition: width 0.5s ease;
}

/* Gallery Cards */
.gallery-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
}
.gallery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.card-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-title-area h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}
.card-category {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: capitalize;
}
.card-body {
  padding: 16px;
}
.card-description {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
  line-height: 1.4;
}
.card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}
.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.mini-label {
  font-size: 11px;
  color: #8a8a8a;
}
.mini-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2a44;
}
.mini-value.approved {
  color: #1e8e3e;
}
.mini-value.pending {
  color: #ffbf00;
}
.card-bar-bg {
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
}
.card-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.last-used {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8a8a8a;
}
.last-used .material-symbols-outlined {
  font-size: 16px;
}
.empty-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

/* Timeline */
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
}
.timeline {
  position: relative;
  padding-left: 40px;
}
.timeline-item {
  position: relative;
  padding-bottom: 24px;
}
.timeline-item.is-first .marker-dot {
  width: 20px;
  height: 20px;
}
.timeline-marker {
  position: absolute;
  left: -40px;
  top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e5e7eb;
  z-index: 1;
}
.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 40px;
  background: #e5e7eb;
}
.timeline-content {
  flex: 1;
}
.timeline-card {
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.timeline-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.timeline-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.timeline-card-title {
  flex: 1;
}
.timeline-card-title h5 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.timeline-person {
  font-size: 12px;
  color: #8a8a8a;
}
.timeline-card-body {
  padding: 8px 0;
}
.timeline-detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}
.detail-label {
  color: #8a8a8a;
  min-width: 80px;
  font-weight: 500;
}
.detail-value {
  color: #374151;
}
.timeline-notes {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #f0f4f8;
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  font-size: 13px;
  color: #374151;
}
.note-icon {
  font-size: 16px;
  color: #ffbf00;
}
.timeline-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f4f8;
}
.document-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.timeline-id {
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}

/* Detail Dialog */
.detail-dialog-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.detail-dialog-body {
  padding: 24px;
}
.detail-section {
  margin-bottom: 20px;
}
.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  align-items: center;
}
.detail-row .detail-label {
  min-width: 100px;
  color: #6b7280;
  font-weight: 500;
}
.detail-notes {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  background: #f0f4f8;
  border-radius: 8px;
  padding: 12px;
}
.document-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.document-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 12px;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
