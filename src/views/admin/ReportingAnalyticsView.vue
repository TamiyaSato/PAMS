<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  category: string
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

const selectedChartTab = ref('applications')

// ---- Chart colors (matching PAMS palette) ----
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

const maxMonthlyValue = computed(() => {
  if (selectedChartTab.value === 'applications') {
    return Math.max(...monthlyData.value.map((d) => Math.max(d.applications, d.approvals)), 1)
  }
  return Math.max(...monthlyData.value.map((d) => d.appointments), 1)
})

function totalServiceCount(): number {
  return serviceDistribution.value.reduce((sum, s) => sum + s.count, 0)
}

function totalDisabilityCount(): number {
  return disabilityBreakdown.value.reduce((sum, d) => sum + d.count, 0)
}

const disabilitySegments = computed(() => {
  const total = totalDisabilityCount()
  if (total === 0) return []
  let cumulative = 0
  return disabilityBreakdown.value.map((d) => {
    const pct = (d.count / total) * 100
    const start = cumulative
    cumulative += pct
    return { ...d, pct, start }
  })
})

// ---- Helpers ----
function formatNumber(n: number): string {
  return n.toLocaleString()
}

function statusLabel(status: number): string {
  switch (status) {
    case 2: return 'Approved'
    case 3: return 'Denied'
    default: return 'Pending'
  }
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function barHeight(count: number, max: number): number {
  if (max === 0) return 4
  return Math.max(4, (count / max) * 180)
}

function donutDasharray(pct: number): string {
  return `${pct} ${100 - pct}`
}

function donutDashoffset(startPct: number): string {
  return `${-startPct}`
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
    { name: 'Financial Assistance', count: 68 },
    { name: 'Medical Aid', count: 45 },
    { name: 'Skills Training', count: 38 },
    { name: 'Mobility Devices', count: 22 },
    { name: 'Counseling', count: 15 },
    { name: 'Education Support', count: 12 },
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
      category: 'Financial',
      status: 2,
      date_created: '2025-01-15T08:30:00Z',
    },
    {
      id: 1202,
      applicant_name: 'Juan dela Cruz',
      service_name: 'Medical Aid',
      disability_type: 'Mobility Disability',
      category: 'Medical',
      status: 1,
      date_created: '2025-01-14T14:00:00Z',
    },
    {
      id: 1203,
      applicant_name: 'Ana Reyes',
      service_name: 'Skills Training',
      disability_type: 'Hearing Impairment',
      category: 'Training',
      status: 2,
      date_created: '2025-01-14T10:15:00Z',
    },
    {
      id: 1204,
      applicant_name: 'Pedro Garcia',
      service_name: 'Mobility Devices',
      disability_type: 'Mobility Disability',
      category: 'Mobility',
      status: 3,
      date_created: '2025-01-13T16:45:00Z',
    },
    {
      id: 1205,
      applicant_name: 'Luz Villanueva',
      service_name: 'Counseling',
      disability_type: 'Cognitive Disability',
      category: 'Counseling',
      status: 1,
      date_created: '2025-01-13T09:00:00Z',
    },
  ]
}

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

    <!-- KPI Stat Cards -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-left">
          <v-icon>people</v-icon>
          <span>Total Members</span>
        </div>
        <div class="count">{{ formatNumber(stats.totalMembers) }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>assignment_turned_in</v-icon>
          <span>Applications</span>
        </div>
        <div class="count">{{ formatNumber(stats.totalApplications) }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>event_available</v-icon>
          <span>Appointments</span>
        </div>
        <div class="count">{{ formatNumber(stats.totalAppointments) }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>inventory_2</v-icon>
          <span>Active Services</span>
        </div>
        <div class="count">{{ formatNumber(stats.totalServices) }}</div>
      </div>
    </div>

    <!-- Application & Appointment Status + Disability Breakdown -->
    <v-row>
      <!-- Application Status -->
      <v-col cols="12" md="4">
        <v-card class="content-card status-card">
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

          <div class="progress-bar">
            <div class="progress-fill approved" :style="{ width: approvalRate + '%' }"></div>
          </div>
          <p class="progress-label">Approval Rate: <strong>{{ approvalRate }}%</strong></p>
        </v-card>
      </v-col>

      <!-- Appointment Status -->
      <v-col cols="12" md="4">
        <v-card class="content-card status-card">
          <h3>Appointment Status</h3>

          <div class="status-breakdown">
            <div class="status-item">
              <div class="status-dot active-apt"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.activeAppointments) }}</span>
                <span class="status-text">Active</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-dot completed-apt"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.completedAppointments) }}</span>
                <span class="status-text">Completed</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-dot cancelled-apt"></div>
              <div class="status-info">
                <span class="status-count">{{ formatNumber(stats.cancelledAppointments) }}</span>
                <span class="status-text">Cancelled</span>
              </div>
            </div>
          </div>

          <div class="progress-bar">
            <div class="progress-fill completed" :style="{ width: completionRate + '%' }"></div>
          </div>
          <p class="progress-label">Completion Rate: <strong>{{ completionRate }}%</strong></p>
        </v-card>
      </v-col>

      <!-- Disability Breakdown -->
      <v-col cols="12" md="4">
        <v-card class="content-card disability-card">
          <h3>Disability Breakdown</h3>

          <div class="donut-wrapper">
            <svg viewBox="0 0 36 36" class="donut-svg">
              <circle
                v-for="(seg, idx) in disabilitySegments"
                :key="seg.type"
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                :stroke="chartColors[idx % chartColors.length]"
                stroke-width="3"
                :stroke-dasharray="donutDasharray(seg.pct)"
                :stroke-dashoffset="donutDashoffset(seg.start)"
                class="donut-segment"
              />
            </svg>
            <div class="donut-center">
              <span class="donut-total">{{ totalDisabilityCount() }}</span>
              <span class="donut-label">Total</span>
            </div>
          </div>

          <div class="disability-list">
            <div v-for="(item, idx) in disabilityBreakdown" :key="item.type" class="disability-item">
              <div class="disability-dot" :style="{ background: chartColors[idx % chartColors.length] }"></div>
              <span class="disability-name">{{ item.type }}</span>
              <span class="disability-count">{{ item.count }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Monthly Trends Chart + Service Distribution -->
    <v-row>
      <!-- Chart -->
      <v-col cols="12" md="8">
        <v-card class="content-card chart-card">
          <div class="chart-header">
            <h3>Monthly Trends</h3>
            <div class="chart-tabs">
              <button
                class="chart-tab"
                :class="{ active: selectedChartTab === 'applications' }"
                @click="selectedChartTab = 'applications'"
              >
                Applications
              </button>
              <button
                class="chart-tab"
                :class="{ active: selectedChartTab === 'appointments' }"
                @click="selectedChartTab = 'appointments'"
              >
                Appointments
              </button>
            </div>
          </div>

          <!-- Applications Bar Chart -->
          <div v-if="selectedChartTab === 'applications' && monthlyData.length" class="chart-area">
            <div class="bar-chart">
              <div v-for="d in monthlyData" :key="d.month" class="bar-group">
                <div class="bar-wrapper">
                  <div
                    class="bar bar-applications"
                    :style="{ height: barHeight(d.applications, maxMonthlyValue) + 'px' }"
                  ></div>
                  <div
                    class="bar bar-approvals"
                    :style="{ height: barHeight(d.approvals, maxMonthlyValue) + 'px' }"
                  ></div>
                </div>
                <span class="bar-label">{{ d.month }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot legend-applications"></span>
                Applications
              </span>
              <span class="legend-item">
                <span class="legend-dot legend-approvals"></span>
                Approvals
              </span>
            </div>
          </div>

          <!-- Appointments Bar Chart -->
          <div v-else-if="selectedChartTab === 'appointments' && monthlyData.length" class="chart-area">
            <div class="bar-chart">
              <div v-for="d in monthlyData" :key="d.month" class="bar-group">
                <div class="bar-wrapper">
                  <div
                    class="bar bar-appointments"
                    :style="{ height: barHeight(d.appointments, maxMonthlyValue) + 'px' }"
                  ></div>
                </div>
                <span class="bar-label">{{ d.month }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot legend-appointments"></span>
                Appointments
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
        <v-card class="content-card distribution-card">
          <h3>Service Distribution</h3>

          <div v-if="serviceDistribution.length" class="service-list">
            <div v-for="(service, idx) in serviceDistribution" :key="service.name" class="service-item">
              <div class="service-info">
                <div class="service-dot" :style="{ background: chartColors[idx % chartColors.length] }"></div>
                <span class="service-name">{{ service.name }}</span>
              </div>
              <div class="service-stats-right">
                <span class="service-count">{{ service.count }}</span>
                <span class="service-pct">{{ Math.round((service.count / totalServiceCount()) * 100) }}%</span>
              </div>
              <div class="service-bar-bg">
                <div
                  class="service-bar-fill"
                  :style="{
                    width: totalServiceCount() > 0 ? (service.count / totalServiceCount()) * 100 + '%' : '0%',
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
    <v-card class="content-card table-card">
      <h3>Recent Applications</h3>

      <v-table class="recent-table" fixed-header height="300">
        <thead>
          <tr>
            <th>Queue No.</th>
            <th>Applicant Name</th>
            <th>Service</th>
            <th>Disability Type</th>
            <th>Status</th>
            <th>Date Applied</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in recentTransactions" :key="tx.id">
            <td class="queue-no">#{{ tx.id }}</td>
            <td>
              <div class="applicant-cell">
                <v-avatar size="32" color="primary" class="mr-2">
                  <span class="text-white" style="font-size: 12px; font-weight: 600">{{ tx.applicant_name.charAt(0) }}</span>
                </v-avatar>
                {{ tx.applicant_name }}
              </div>
            </td>
            <td>{{ tx.service_name }}</td>
            <td>{{ tx.disability_type }}</td>
            <td>
              <span class="status-pill" :class="statusLabel(tx.status).toLowerCase()">
                {{ statusLabel(tx.status) }}
              </span>
            </td>
            <td class="timestamp">{{ formatDate(tx.date_created) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<style scoped>
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

/* === Stats (from main.css / DashboardView) === */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

/* === Content Card === */
.content-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.content-card h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2a44;
}

/* === Status Cards === */
.status-card {
  min-height: 200px;
}

.status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
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

.status-dot.active-apt {
  background: #1976d2;
}

.status-dot.completed-apt {
  background: #1e8e3e;
}

.status-dot.cancelled-apt {
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
  color: #1f2a44;
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

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.progress-fill.approved {
  background: #1e8e3e;
}

.progress-fill.completed {
  background: #1e8e3e;
}

.progress-label {
  text-align: center;
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 13px;
  color: #8a8a8a;
}

.progress-label strong {
  color: #1f2a44;
}

/* === Disability Card === */
.disability-card {
  min-height: 200px;
}

.donut-wrapper {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 16px;
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
  letter-spacing: 0.5px;
}

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

.disability-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
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

/* === Chart Card === */
.chart-card {
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

.bar-applications {
  background: #0b1b5a;
}

.bar-approvals {
  background: #1e8e3e;
}

.bar-appointments {
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

.legend-applications {
  background: #0b1b5a;
}

.legend-approvals {
  background: #1e8e3e;
}

.legend-appointments {
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

/* === Distribution Card === */
.distribution-card {
  min-height: 380px;
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

.service-stats-right {
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

/* === Recent Table === */
.table-card {
  margin-top: 24px;
}

.recent-table {
  width: 100%;
  border-collapse: collapse;
}

.recent-table thead th {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.recent-table tbody tr {
  background: #eef5f9;
}

.recent-table tbody tr:hover {
  background: #e0e9f1;
}

.recent-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #dbe5ee;
}

.recent-table td {
  padding: 14px 12px;
  font-size: 14px;
}

.queue-no {
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

.status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill.approved {
  background: #dcfce7;
  color: #166534;
}

.status-pill.pending {
  background: #fef3c7;
  color: #b45309;
}

.status-pill.denied {
  background: #fee2e2;
  color: #b91c1c;
}

/* === Material Icons === */
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}

.mt-2 {
  margin-top: 8px;
}
</style>
