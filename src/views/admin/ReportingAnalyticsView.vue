<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api/axios'

// ---- Types ----
interface AnalyticsStats {
  totalMembers: number
  totalServices: number
  totalApplications: number
  totalAppointments: number
  approvedApplications: number
  pendingApplications: number
  deniedApplications: number
  activeAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  applicationGrowth: number
  memberGrowth: number
  appointmentGrowth: number
}

interface MonthlyData {
  month: string
  applications: number
  approvals: number
  appointments: number
}

interface ServiceDistribution {
  name: string
  count: number
  color: string
}

interface DisabilityBreakdown {
  type: string
  count: number
}

interface RecentTransaction {
  id: number
  applicant_name: string
  service_name: string
  disability_type: string
  status: number
  date_created: string
}

// ---- State ----
const loading = ref(false)
const dateRange = ref('30')
const stats = ref<AnalyticsStats>({
  totalMembers: 0,
  totalServices: 0,
  totalApplications: 0,
  totalAppointments: 0,
  approvedApplications: 0,
  pendingApplications: 0,
  deniedApplications: 0,
  activeAppointments: 0,
  completedAppointments: 0,
  cancelledAppointments: 0,
  applicationGrowth: 0,
  memberGrowth: 0,
  appointmentGrowth: 0,
})

const monthlyData = ref<MonthlyData[]>([])
const serviceDistribution = ref<ServiceDistribution[]>([])
const disabilityBreakdown = ref<DisabilityBreakdown[]>([])
const recentTransactions = ref<RecentTransaction[]>([])
const selectedChart = ref<'applications' | 'services' | 'appointments'>('applications')

// ---- Chart colors ----
const chartColors = ['#0b1b5a', '#1e8e3e', '#ffbf00', '#e53935', '#1976d2', '#7b1fa2', '#00897b', '#f4511e']

// ---- Computed ----
const approvalRate = computed(() => {
  const total = stats.value.approvedApplications + stats.value.deniedApplications + stats.value.pendingApplications
  if (total === 0) return 0
  return Math.round((stats.value.approvedApplications / total) * 100)
})

const completionRate = computed(() => {
  const total = stats.value.completedAppointments + stats.value.cancelledAppointments + stats.value.activeAppointments
  if (total === 0) return 0
  return Math.round((stats.value.completedAppointments / total) * 100)
})

const maxMonthlyApps = computed(() => {
  return Math.max(...monthlyData.value.map((d) => d.applications), 1)
})

const maxMonthlyAppointments = computed(() => {
  return Math.max(...monthlyData.value.map((d) => d.appointments), 1)
})

// ---- Helpers ----
function formatNumber(n: number): string {
  return n.toLocaleString()
}

function growthIcon(val: number): string {
  return val >= 0 ? 'trending_up' : 'trending_down'
}

function growthColor(val: number): string {
  return val >= 0 ? 'success' : 'error'
}

function statusLabel(status: number): string {
  switch (status) {
    case 2:
      return 'Approved'
    case 3:
      return 'Denied'
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
    default:
      return 'warning'
  }
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---- Bar height helpers ----
function barHeight(count: number, max: number): number {
  if (max === 0) return 4
  return Math.max(4, (count / max) * 180)
}

// ---- Fetch ----
async function fetchAnalytics() {
  loading.value = true
  try {
    const [statsRes, monthlyRes, serviceRes, disabilityRes, transactionsRes] = await Promise.all([
      api.get<AnalyticsStats>(`/api/v1/analytics/stats?days=${dateRange.value}`),
      api.get<MonthlyData[]>(`/api/v1/analytics/monthly?days=${dateRange.value}`),
      api.get<ServiceDistribution[]>('/api/v1/analytics/services/distribution'),
      api.get<DisabilityBreakdown[]>('/api/v1/analytics/disability-breakdown'),
      api.get<RecentTransaction[]>('/api/v1/transactions?top=10&order=desc'),
    ])

    stats.value = statsRes.data
    monthlyData.value = Array.isArray(monthlyRes.data) ? monthlyRes.data : []
    serviceDistribution.value = Array.isArray(serviceRes.data) ? serviceRes.data : []
    disabilityBreakdown.value = Array.isArray(disabilityRes.data) ? disabilityRes.data : []
    recentTransactions.value = Array.isArray(transactionsRes.data) ? transactionsRes.data : []
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    // Fallback mock data for development
    applyMockData()
  } finally {
    loading.value = false
  }
}

function applyMockData() {
  stats.value = {
    totalMembers: 248,
    totalServices: 12,
    totalApplications: 186,
    totalAppointments: 134,
    approvedApplications: 112,
    pendingApplications: 52,
    deniedApplications: 22,
    activeAppointments: 45,
    completedAppointments: 78,
    cancelledAppointments: 11,
    applicationGrowth: 12.5,
    memberGrowth: 8.3,
    appointmentGrowth: -3.2,
  }

  monthlyData.value = [
    { month: 'Jan', applications: 18, approvals: 12, appointments: 14 },
    { month: 'Feb', applications: 24, approvals: 19, appointments: 20 },
    { month: 'Mar', applications: 32, approvals: 25, appointments: 28 },
    { month: 'Apr', applications: 28, approvals: 22, appointments: 25 },
    { month: 'May', applications: 35, approvals: 30, appointments: 30 },
    { month: 'Jun', applications: 42, approvals: 35, appointments: 38 },
    { month: 'Jul', applications: 38, approvals: 28, appointments: 32 },
    { month: 'Aug', applications: 45, approvals: 38, appointments: 40 },
    { month: 'Sep', applications: 50, approvals: 42, appointments: 44 },
    { month: 'Oct', applications: 55, approvals: 48, appointments: 50 },
    { month: 'Nov', applications: 62, approvals: 52, appointments: 55 },
    { month: 'Dec', applications: 48, approvals: 40, appointments: 42 },
  ]

  serviceDistribution.value = [
    { name: 'Financial Assistance', count: 68, color: '#0b1b5a' },
    { name: 'Medical Aid', count: 45, color: '#1e8e3e' },
    { name: 'Skills Training', count: 38, color: '#ffbf00' },
    { name: 'Mobility Devices', count: 22, color: '#e53935' },
    { name: 'Counseling', count: 15, color: '#1976d2' },
    { name: 'Education Support', count: 12, color: '#7b1fa2' },
  ]

  disabilityBreakdown.value = [
    { type: 'Visual Impairment', count: 72 },
    { type: 'Hearing Impairment', count: 48 },
    { type: 'Mobility Disability', count: 65 },
    { type: 'Cognitive Disability', count: 38 },
    { type: 'Speech Impairment', count: 25 },
  ]

  recentTransactions.value = [
    {
      id: 1201,
      applicant_name: 'Maria Santos',
      service_name: 'Financial Assistance',
      disability_type: 'Visual Impairment',
      status: 2,
      date_created: '2025-01-15T08:30:00Z',
    },
    {
      id: 1202,
      applicant_name: 'Juan dela Cruz',
      service_name: 'Medical Aid',
      disability_type: 'Mobility Disability',
      status: 1,
      date_created: '2025-01-14T14:00:00Z',
    },
    {
      id: 1203,
      applicant_name: 'Ana Reyes',
      service_name: 'Skills Training',
      disability_type: 'Hearing Impairment',
      status: 2,
      date_created: '2025-01-14T10:15:00Z',
    },
    {
      id: 1204,
      applicant_name: 'Pedro Garcia',
      service_name: 'Mobility Devices',
      disability_type: 'Mobility Disability',
      status: 3,
      date_created: '2025-01-13T16:45:00Z',
    },
    {
      id: 1205,
      applicant_name: 'Luz Villanueva',
      service_name: 'Counseling',
      disability_type: 'Cognitive Disability',
      status: 1,
      date_created: '2025-01-13T09:00:00Z',
    },
  ]
}

function totalServiceCount(): number {
  return serviceDistribution.value.reduce((sum, s) => sum + s.count, 0)
}

function totalDisabilityCount(): number {
  return disabilityBreakdown.value.reduce((sum, d) => sum + d.count, 0)
}

function donutOffset(pct: number, idx: number): number {
  return pct * idx
}

watch(dateRange, () => {
  fetchAnalytics()
})

onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <v-container fluid class="admin-container">
    <div class="top-header">
      <h2>Reporting & Analytics</h2>

      <div class="top-actions">
        <v-select
          v-model="dateRange"
          :items="[
            { title: 'Last 7 Days', value: '7' },
            { title: 'Last 30 Days', value: '30' },
            { title: 'Last 90 Days', value: '90' },
            { title: 'This Year', value: '365' },
          ]"
          item-title="title"
          item-value="value"
          label="Period"
          variant="outlined"
          density="compact"
          hide-details
          class="period-select"
        />

        <button class="pill dark">
          <span class="material-symbols-outlined">download</span>
          Export Report
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <v-row>
      <v-col cols="12" md="3" sm="6">
        <v-card class="kpi-card blue">
          <div class="kpi-icon">
            <v-icon size="36">people</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatNumber(stats.totalMembers) }}</div>
            <div class="kpi-label">Total Members</div>
            <div class="kpi-growth" :class="growthColor(stats.memberGrowth)">
              <span class="material-symbols-outlined">{{ growthIcon(stats.memberGrowth) }}</span>
              {{ Math.abs(stats.memberGrowth) }}%
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="kpi-card green">
          <div class="kpi-icon">
            <v-icon size="36">assignment_turned_in</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatNumber(stats.totalApplications) }}</div>
            <div class="kpi-label">Total Applications</div>
            <div class="kpi-growth" :class="growthColor(stats.applicationGrowth)">
              <span class="material-symbols-outlined">{{ growthIcon(stats.applicationGrowth) }}</span>
              {{ Math.abs(stats.applicationGrowth) }}%
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="kpi-card yellow">
          <div class="kpi-icon">
            <v-icon size="36">event_available</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatNumber(stats.totalAppointments) }}</div>
            <div class="kpi-label">Total Appointments</div>
            <div class="kpi-growth" :class="growthColor(stats.appointmentGrowth)">
              <span class="material-symbols-outlined">{{ growthIcon(stats.appointmentGrowth) }}</span>
              {{ Math.abs(stats.appointmentGrowth) }}%
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" sm="6">
        <v-card class="kpi-card purple">
          <div class="kpi-icon">
            <v-icon size="36">inventory_2</v-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatNumber(stats.totalServices) }}</div>
            <div class="kpi-label">Active Services</div>
            <div class="kpi-growth text-grey">
              <span class="material-symbols-outlined">trending_flat</span>
              —
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Status Overview -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="status-card">
          <h3>Application Status</h3>
          <div class="status-breakdown">
            <div class="status-item">
              <div class="status-dot approved"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.approvedApplications) }}</span>
                <span class="status-text">Approved</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-dot pending"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.pendingApplications) }}</span>
                <span class="status-text">Pending</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-dot denied"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.deniedApplications) }}</span>
                <span class="status-text">Denied</span>
              </div>
            </div>
          </div>
          <div class="progress-bar mt-3">
            <div
              class="progress-segment approved"
              :style="{ width: approvalRate + '%' }"
            ></div>
          </div>
          <p class="text-center mt-2 text-body-2 text-grey">
            Approval Rate: <strong>{{ approvalRate }}%</strong>
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="status-card">
          <h3>Appointment Status</h3>
          <div class="status-breakdown">
            <div class="status-item">
              <div class="status-dot active"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.activeAppointments) }}</span>
                <span class="status-text">Active</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-dot completed"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.completedAppointments) }}</span>
                <span class="status-text">Completed</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-dot cancelled"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.cancelledAppointments) }}</span>
                <span class="status-text">Cancelled</span>
              </div>
            </div>
          </div>
          <div class="progress-bar mt-3">
            <div
              class="progress-segment completed"
              :style="{ width: completionRate + '%' }"
            ></div>
          </div>
          <p class="text-center mt-2 text-body-2 text-grey">
            Completion Rate: <strong>{{ completionRate }}%</strong>
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="status-card">
          <h3>Disability Breakdown</h3>
          <div v-if="disabilityBreakdown.length" class="disability-list">
            <div
              v-for="(item, idx) in disabilityBreakdown"
              :key="item.type"
              class="disability-item"
            >
              <div
                class="disability-color-bar"
                :style="{ background: chartColors[idx % chartColors.length] }"
              ></div>
              <span class="disability-name">{{ item.type }}</span>
              <span class="disability-count">{{ item.count }}</span>
            </div>
          </div>
          <div v-else class="empty-text">No data available</div>
          <!-- Donut Chart -->
          <div v-if="disabilityBreakdown.length" class="donut-chart mt-4">
            <svg viewBox="0 0 36 36" class="donut-svg">
              <circle
                v-for="(item, idx) in disabilityBreakdown"
                :key="item.type"
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                :stroke="chartColors[idx % chartColors.length]"
                stroke-width="3"
                :stroke-dasharray="`${(item.count / totalDisabilityCount()) * 100} ${100 - (item.count / totalDisabilityCount()) * 100}`"
                :stroke-dashoffset="-donutOffset((disabilityBreakdown.slice(0, idx).reduce((s, i) => s + i.count, 0) / totalDisabilityCount()) * 100, 1)"
                class="donut-segment"
              />
            </svg>
            <div class="donut-center">
              <span class="donut-total">{{ totalDisabilityCount() }}</span>
              <span class="donut-label">Total</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Chart Area -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="chart-card">
          <div class="chart-header">
            <h3>Monthly Trends</h3>
            <div class="chart-tabs">
              <button
                class="chart-tab"
                :class="{ active: selectedChart === 'applications' }"
                @click="selectedChart = 'applications'"
              >
                Applications
              </button>
              <button
                class="chart-tab"
                :class="{ active: selectedChart === 'appointments' }"
                @click="selectedChart = 'appointments'"
              >
                Appointments
              </button>
            </div>
          </div>

          <!-- Applications Bar Chart -->
          <div v-if="selectedChart === 'applications' && monthlyData.length" class="chart-area">
            <div class="bar-chart">
              <div
                v-for="d in monthlyData"
                :key="d.month"
                class="bar-group"
              >
                <div class="bar-wrapper">
                  <div
                    class="bar applications"
                    :style="{ height: barHeight(d.applications, maxMonthlyApps) + 'px' }"
                  ></div>
                  <div
                    class="bar approvals"
                    :style="{ height: barHeight(d.approvals, maxMonthlyApps) + 'px' }"
                  ></div>
                </div>
                <span class="bar-label">{{ d.month }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot applications"></span> Applications
              </span>
              <span class="legend-item">
                <span class="legend-dot approvals"></span> Approvals
              </span>
            </div>
          </div>

          <!-- Appointments Bar Chart -->
          <div v-else-if="selectedChart === 'appointments' && monthlyData.length" class="chart-area">
            <div class="bar-chart">
              <div
                v-for="d in monthlyData"
                :key="d.month"
                class="bar-group"
              >
                <div class="bar-wrapper">
                  <div
                    class="bar appointments"
                    :style="{ height: barHeight(d.appointments, maxMonthlyAppointments) + 'px' }"
                  ></div>
                </div>
                <span class="bar-label">{{ d.month }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot appointments"></span> Appointments
              </span>
            </div>
          </div>

          <div v-else class="chart-empty">
            <v-icon size="48" color="grey-lighten-1">bar_chart</v-icon>
            <p class="text-body-2 text-grey mt-2">No trend data available</p>
          </div>
        </v-card>
      </v-col>

      <!-- Service Distribution -->
      <v-col cols="12" md="4">
        <v-card class="distribution-card">
          <h3>Service Distribution</h3>
          <div v-if="serviceDistribution.length" class="service-list">
            <div
              v-for="(service, idx) in serviceDistribution"
              :key="service.name"
              class="service-item"
            >
              <div class="service-info">
                <div
                  class="service-dot"
                  :style="{ background: chartColors[idx % chartColors.length] }"
                ></div>
                <span class="service-name">{{ service.name }}</span>
              </div>
              <div class="service-stats">
                <span class="service-count">{{ service.count }}</span>
                <span class="service-pct">{{ Math.round((service.count / totalServiceCount()) * 100) }}%</span>
              </div>
              <div class="service-bar-bg">
                <div
                  class="service-bar-fill"
                  :style="{
                    width: (service.count / totalServiceCount()) * 100 + '%',
                    background: chartColors[idx % chartColors.length],
                  }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="empty-text">No service data available</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Applications Table -->
    <v-card class="table-card">
      <h3>Recent Applications</h3>
      <v-table class="recent-table" fixed-header height="300">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant</th>
            <th>Service</th>
            <th>Disability Type</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in recentTransactions" :key="tx.id">
            <td class="mono">#{{ tx.id }}</td>
            <td>
              <div class="applicant-cell">
                <v-avatar size="32" color="primary" class="mr-2">
                  <span class="text-white text-caption">{{ tx.applicant_name.charAt(0) }}</span>
                </v-avatar>
                {{ tx.applicant_name }}
              </div>
            </td>
            <td>{{ tx.service_name }}</td>
            <td>{{ tx.disability_type }}</td>
            <td>
              <v-chip :color="statusColor(tx.status)" size="x-small" variant="flat">
                {{ statusLabel(tx.status) }}
              </v-chip>
            </td>
            <td class="timestamp">{{ formatDate(tx.date_created) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<style scoped>
/* KPI Cards */
.kpi-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  color: white;
  min-height: 120px;
}
.kpi-card.blue {
  background: linear-gradient(135deg, #0b1b5a, #1a237e);
}
.kpi-card.green {
  background: linear-gradient(135deg, #1e8e3e, #2e7d32);
}
.kpi-card.yellow {
  background: linear-gradient(135deg, #ffbf00, #f9a825);
  color: #1f2a44;
}
.kpi-card.purple {
  background: linear-gradient(135deg, #7b1fa2, #6a1b9a);
}
.kpi-icon {
  opacity: 0.8;
  margin-right: 16px;
}
.kpi-body {
  flex: 1;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}
.kpi-label {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}
.kpi-growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 6px;
}
.kpi-growth .material-symbols-outlined {
  font-size: 16px;
}
.kpi-growth.success {
  color: #a5d6a7;
}
.kpi-growth.error {
  color: #ef9a9a;
}

/* Status Cards */
.status-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  min-height: 200px;
}
.status-card h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}
.status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.status-dot.approved {
  background: #1e8e3e;
}
.status-dot.pending {
  background: #ffbf00;
}
.status-dot.denied {
  background: #e53935;
}
.status-dot.active {
  background: #1976d2;
}
.status-dot.completed {
  background: #1e8e3e;
}
.status-dot.cancelled {
  background: #e53935;
}
.status-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.status-count {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
}
.status-text {
  font-size: 12px;
  color: #8a8a8a;
}
.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.progress-segment {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.progress-segment.approved {
  background: #1e8e3e;
}
.progress-segment.completed {
  background: #1e8e3e;
}

/* Disability List */
.disability-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.disability-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.disability-color-bar {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}
.disability-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
}
.disability-count {
  font-size: 14px;
  font-weight: 600;
  color: #1f2a44;
}

/* Donut Chart */
.donut-chart {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}
.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.donut-segment {
  transition: stroke-dasharray 0.5s ease;
}
.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.donut-total {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1f2a44;
  line-height: 1;
}
.donut-label {
  font-size: 10px;
  color: #8a8a8a;
  text-transform: uppercase;
}

/* Chart Area */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  min-height: 380px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.chart-tabs {
  display: flex;
  gap: 8px;
}
.chart-tab {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}
.chart-tab.active {
  background: #0b1b5a;
  color: white;
  border-color: #0b1b5a;
}
.chart-area {
  margin-top: 16px;
}
.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 0 12px;
  gap: 8px;
}
.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.bar-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 180px;
}
.bar {
  width: 14px;
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease;
}
.bar.applications {
  background: #0b1b5a;
}
.bar.approvals {
  background: #1e8e3e;
}
.bar.appointments {
  background: #ffbf00;
}
.bar-label {
  font-size: 11px;
  color: #8a8a8a;
}
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.legend-dot.applications {
  background: #0b1b5a;
}
.legend-dot.approvals {
  background: #1e8e3e;
}
.legend-dot.appointments {
  background: #ffbf00;
}
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
}

/* Distribution Card */
.distribution-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  min-height: 380px;
}
.distribution-card h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}
.service-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.service-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.service-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.service-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.service-name {
  font-size: 13px;
  color: #374151;
  flex: 1;
}
.service-stats {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  font-size: 12px;
}
.service-count {
  font-weight: 600;
  color: #1f2a44;
}
.service-pct {
  color: #8a8a8a;
}
.service-bar-bg {
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}
.service-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.empty-text {
  text-align: center;
  color: #8a8a8a;
  padding: 32px 0;
}

/* Recent Table */
.table-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
}
.table-card h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}
.recent-table {
  width: 100%;
  border-collapse: collapse;
}
.recent-table thead th {
  padding: 12px;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}
.recent-table tbody tr {
  background: white;
}
.recent-table tbody tr:hover {
  background: #f0f4f8;
}
.recent-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}
.recent-table td {
  padding: 12px;
  font-size: 14px;
}
.mono {
  font-family: monospace;
  color: #9ca3af;
}
.applicant-cell {
  display: flex;
  align-items: center;
}
.timestamp {
  font-size: 13px;
  color: #6b7280;
}

/* Top Actions */
.period-select {
  min-width: 160px;
}

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

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}

.mt-3 {
  margin-top: 12px;
}

.mt-2 {
  margin-top: 8px;
}
</style>
