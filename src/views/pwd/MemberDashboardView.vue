<script setup lang="ts">
import api from '@/api/axios'
import { computed, onMounted, ref } from 'vue'
import type { applicationResponse } from '@/models/serviceResponse'

import { useRouter } from 'vue-router'
const router = useRouter()

const goToStatusPage = () => {
  router.push({ name: 'member-status' })
}

const goToActiveApplications = () => {
  router.push({
    name: 'member-status',
    query: { tab: 'progress' },
  })
}

const goToCompletedApplications = () => {
  router.push({
    name: 'member-status',
    query: { tab: 'completed' },
  })
}
const goToAppointments = () => {
  router.push({ name: 'member-appointments' })
}

interface AppointmentResponse {
  id: number
  preferred_date: string
  location: string | null
  service_name?: string
}

const applications = ref<applicationResponse[]>([])
const nextAppointment = ref<AppointmentResponse | null>(null)
const appointmentError = ref('')

function statusLabel(status: number) {
  switch (status) {
    case 1:
      return 'In Progress'
    case 2:
      return 'Approved'
    case 3:
      return 'Declined'
    default:
      return 'Cancelled'
  }
}

function statusClass(status: number) {
  switch (status) {
    case 1:
      return 'progress'
    case 2:
      return 'approved'
    case 3:
      return 'declined'
    default:
      return 'cancelled'
  }
}

function formatDateTime(iso?: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

async function fetchApplications() {
  try {
    const res = await api.get<applicationResponse[]>('/api/v1/transactions/me?top=3')
    applications.value = res.data
  } catch (e) {
    console.error('Error fetching applications:', e)
  }
}

async function fetchNextAppointment() {
  appointmentError.value = ''
  try {
    const { data } = await api.get<AppointmentResponse | AppointmentResponse[]>(
      '/api/v1/appointments/persons/me/next',
    )
    nextAppointment.value = Array.isArray(data) ? (data[0] ?? null) : data
  } catch (e) {
    appointmentError.value = 'Failed to load next appointment.'
    console.error('Error fetching appointment:', e)
  }
}

const appointmentDateTime = computed(() =>
  nextAppointment.value ? formatDateTime(nextAppointment.value.preferred_date) : '',
)

const appointmentLocation = computed(() => nextAppointment.value?.location || 'TBD')

const applyService = (service: string) => {
  console.log('Applying for:', service)
}

onMounted(() => {
  fetchApplications()
  fetchNextAppointment()
})
</script>

<template>
  <v-container fluid class="dashboard">
    <div class="top-bar">
      <h2>Dashboard</h2>

      <div class="right"></div>
    </div>

    <div class="stats">
      <div class="stat-pill">
        <v-icon class="stat-icon">description</v-icon>
        <span class="stat-title">Active Applications</span>
        <button class="stat-btn" @click="goToActiveApplications">View More</button>
      </div>

      <div class="stat-pill">
        <v-icon class="stat-icon">check_circle</v-icon>
        <span class="stat-title">Approved Services</span>
        <button class="stat-btn" @click="goToCompletedApplications">View More</button>
      </div>

      <div class="stat-pill">
        <v-icon class="stat-icon">event</v-icon>
        <span class="stat-title">Next Appointment</span>
        <button class="stat-btn" @click="goToAppointments">View More</button>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="card">
          <div class="card-header">
            <h3>Application Status</h3>
            <a href="#" @click.prevent="goToStatusPage">View full status page</a>
          </div>

          <div class="status-row" v-for="app in applications" :key="app.id">
            <v-avatar size="36" color="green">
              <v-icon color="white" size="18">accessible</v-icon>
            </v-avatar>

            <div class="status-info">
              <strong>Ref. #{{ app.id }}</strong>
              <small>Reference Number</small>
              <span>{{ app.name }}</span>
              <small>Service Name</small>
            </div>

            <span class="badge" :class="statusClass(app.status)">
              {{ statusLabel(app.status) }}
            </span>
          </div>
        </v-card>

        <v-card class="card mt">
          <h3>Available Services</h3>

          <div class="services">
            <div class="service">
              <v-icon>card_giftcard</v-icon>
              <strong>CHRISTMAS PACKAGE</strong>
              <button @click="applyService('Christmas Package')">Apply Here</button>
            </div>

            <div class="service">
              <v-icon>visibility</v-icon>
              <strong>EYEGLASSES</strong>
              <button @click="applyService('Eyeglasses')">Apply Here</button>
            </div>

            <div class="service">
              <v-icon>fitness_center</v-icon>
              <strong>PROSTHETIC</strong>
              <button @click="applyService('Prosthetic')">Apply Here</button>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="card mt">
          <h3>Appointments</h3>
          <p><strong>Next Appointment:</strong></p>
          <p v-if="appointmentError">{{ appointmentError }}</p>
          <ul v-else-if="nextAppointment">
            <li>Date/Time: {{ appointmentDateTime }}</li>
            <li>Location: {{ appointmentLocation }}</li>
          </ul>
          <p v-else>No upcoming appointment.</p>
        </v-card>

        <v-card class="card mt">
          <h3>History & Help</h3>
          <ul class="links">
            <li><a href="#">Recent Application History</a></li>
            <li><a href="#">Pending documents to upload</a></li>
            <li><a href="#">Accessibility Settings</a></li>
          </ul>
          <button class="primary">View More Here</button>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dashboard {
  background: #f4f7fb;
  padding: 24px;
  min-height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.sub {
  font-size: 13px;
  color: #6b7280;
}

.right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.search {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  gap: 6px;
}

.search input {
  border: none;
  outline: none;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #0b1b5a;
  color: white;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  gap: 12px;
}

.stat-card button {
  background: #fbbf24;
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  margin-top: 8px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.mt {
  margin-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.status-row:last-child {
  border-bottom: none;
}

.status-info {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.status-info small {
  color: #6b7280;
  font-size: 11px;
}

.badge {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
}

.progress,
.approved,
.declined,
.cancelled {
  color: #2563eb;
}

.badge {
  margin-left: auto;
  font-weight: 600;
}

.services {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.service {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.service button {
  background: #fbbf24;
  border: none;
  border-radius: 999px;
  padding: 6px 18px;
  margin-top: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.center {
  text-align: center;
}

.queue {
  font-size: 32px;
  font-weight: 700;
  color: #0b1b5a;
}

.links li {
  margin: 6px 0;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-pill {
  background: #0b1b5a;
  color: #ffffff;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  font-size: 22px;
}

.stat-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.stat-btn {
  background: #fbbf24;
  color: #0b1b5a;
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.queue-oval {
  background: #0b1b5a;
  color: #ffffff;
  padding: 14px 28px;
  border-radius: 999px;
  font-size: 26px;
  font-weight: 700;
  display: inline-block;
  margin: 14px 0;
}

.queue-desc {
  font-size: 13px;
  line-height: 1.4;
}
</style>
