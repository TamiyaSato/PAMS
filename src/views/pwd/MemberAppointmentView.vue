<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.checkAuth()

interface AppointmentResponse {
  id: number
  person_id: number
  service_id: number
  preferred_date: string
  status: number
  user_id: number
  location: string | null
  notes: string | null
  person_name?: string
  person_contact?: string
  service_name?: string
  service_description?: string
  service_category?: string
}

const appointment = ref<AppointmentResponse | null>(null)
const loading = ref(false)
const error = ref('')
const confirmLoading = ref(false)

const selectedDate = ref<string | null>(null)
const bookedDate = ref<string | null>(null)

const STATUS_TEXT: Record<number, string> = {
  1: 'Confirmed',
  2: 'Pending Confirmation',
  3: 'Reschedule Requested',
}

function formatFullDateTime(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  const dateStr = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const timeStr = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${dateStr} · ${timeStr}`
}

function toLocalDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const hasAppointment = computed(() => !!appointment.value)

const statusText = computed(() =>
  appointment.value ? (STATUS_TEXT[appointment.value.status] ?? 'Pending Confirmation') : '',
)

const headerTitle = computed(() => appointment.value?.service_name || 'Scheduled Appointment')

const headerDateTime = computed(() =>
  appointment.value ? formatFullDateTime(appointment.value.preferred_date) : '',
)

const headerWithStaff = computed(() => {
  if (!appointment.value) return ''
  if (appointment.value.location) return `Location: ${appointment.value.location}`
  return appointment.value.person_name ? `For: ${appointment.value.person_name}` : ''
})

const detailDate = computed(() =>
  appointment.value ? formatDate(appointment.value.preferred_date) : '',
)

const detailTime = computed(() =>
  appointment.value ? formatTime(appointment.value.preferred_date) : '',
)

const detailService = computed(() => appointment.value?.service_name || '—')

async function confirmAttendance() {
  if (!appointment.value) return

  confirmLoading.value = true
  try {
    await api.put(`/api/v1/appointments/${appointment.value.id}`, {
      status: 1,
    })

    appointment.value = {
      ...appointment.value,
      status: 1,
    }
  } catch (e) {
    console.error('Failed to confirm appointment', e)
  } finally {
    confirmLoading.value = false
    location.reload()
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get<AppointmentResponse[]>('/api/v1/appointments/persons/me', {
      params: { top: 1 },
    })

    const first = Array.isArray(data) ? data[0] : null
    appointment.value = first ?? null

    if (first?.preferred_date) {
      // Use date-only (YYYY-MM-DD) for date picker binding
      bookedDate.value = toLocalDateString(new Date(first.preferred_date))
    }
  } catch (e) {
    console.error('Failed to fetch latest appointment', e)
    error.value = 'Failed to load your latest appointment.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-layout style="min-height: 100vh">
    <v-main>
      <v-app-bar flat title="Appointments" />

      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-card class="pending-card">
              <h3 class="section-title">
                <span v-if="hasAppointment">{{ statusText || 'Pending Confirmation' }}</span>
                <span v-else>No Pending Confirmation</span>
              </h3>
              <p class="section-subtitle" v-if="hasAppointment">
                An administrator has scheduled the following visit for you. Please confirm your
                attendance.
              </p>

              <v-row v-if="hasAppointment" class="align-start mt-4">
                <v-col cols="12" md="8">
                  <div class="highlight">
                    <strong>{{ headerTitle }}</strong>
                    <div>{{ headerDateTime }}</div>
                    <div v-if="headerWithStaff">{{ headerWithStaff }}</div>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <v-btn
                    color="#028a5c"
                    block
                    class="mb-2 btn-confirm"
                    :loading="confirmLoading"
                    :disabled="confirmLoading"
                    @click="confirmAttendance"
                  >
                    Confirm Attendance
                  </v-btn>
                  <v-btn color="#8f8f91" block class="btn-reschedule"> Request Reschedule </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-6" v-if="hasAppointment">
          <v-col cols="12" md="6">
            <v-card class="calendar-card">
              <v-date-picker
                v-model="selectedDate"
                color="primary"
                show-adjacent-months
                hide-header
                :events="[bookedDate!]"
                event-color="yellow"
              />
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="details-card">
              <div class="details-title">Appointment Details</div>

              <div class="details-row">
                <span class="label">Date</span>
                <span class="value">{{ detailDate }}</span>
              </div>

              <div class="details-row">
                <span class="label">Time</span>
                <span class="value">{{ detailTime }}</span>
              </div>

              <div class="details-row">
                <span class="label">Service</span>
                <span class="value">{{ detailService }}</span>
              </div>

              <v-divider class="my-4" />

              <div class="details-subtitle">Required Documents</div>
              <ul class="documents">
                <li>PWD ID</li>
                <li>Medical Certificate</li>
              </ul>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-6">
          <v-col cols="12">
            <v-card class="history-card">
              <h3 class="section-title">Appointments History</h3>

              <v-table density="compact">
                <thead>
                  <tr>
                    <th></th>
                    <th>Appointment ID</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Assigned Staff</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <v-avatar color="#F59E0B" size="32">
                        <v-icon>mdi-wheelchair</v-icon>
                      </v-avatar>
                    </td>
                    <td>#001</td>
                    <td>Wheelchair Fitting</td>
                    <td>February 25, 2026 10:00 AM</td>
                    <td>Liza Ramos</td>
                    <td>
                      <v-chip color="#10B981" size="small">Approved</v-chip>
                    </td>
                    <td>
                      <v-btn size="small" color="#F59E0B" variant="flat"> View Details </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<style scoped>
.member-drawer {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  font-family: 'Inter', sans-serif;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px;
}

.logo-image {
  height: 130px;
  width: auto;
  object-fit: contain;
}

.pending-card {
  padding: 24px 32px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.section-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}
.highlight {
  background: #fde68a;
  padding: 16px;
  border-radius: 10px;
}
.highlight strong {
  font-size: 16px;
}
.highlight div {
  font-size: 14px;
  color: #111827;
  margin-top: 4px;
}
.btn-confirm {
  background-color: #028a5c;
  color: #ffffff;
  font-weight: 600;
}
.btn-reschedule {
  background-color: #8f8f91;
  color: #111827;
  font-weight: 600;
}

.calendar-card {
  padding: 24px 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.calendar-header {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.day {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #6b7280;
}
.date {
  padding: 12px;
  text-align: center;
  border-radius: 50%;
  font-size: 14px;
}
.date.selected {
  background-color: #fde68a;
  font-weight: 700;
}
.date.muted {
  background-color: #eff6ff;
}

.details-card {
  padding: 24px 32px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.details-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}

.details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.v-divider.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

.details-subtitle {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.documents {
  padding-left: 20px;
  margin: 0;
}

.documents li {
  font-size: 14px;
  margin-bottom: 8px;
  color: #111827;
}

.history-card {
  padding: 24px 32px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.history-card th {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-align: left;
  padding: 12px 8px;
}

.history-card td {
  font-size: 14px;
  color: #111827;
  padding: 12px 8px;
}

.history-card .v-chip {
  font-weight: 600;
}

.history-card .v-btn {
  border-radius: 8px;
  text-transform: none;
}

.logout-card {
  border-radius: 14px;
  padding: 18px 12px;
}
.logout-title {
  text-align: center;
  font-weight: 700;
  font-size: 18px;
  padding-bottom: 6px;
}
.logout-text {
  text-align: center;
  font-size: 14px;
  color: #0e0d0d;
  margin-top: 4px;
}
.logout-actions {
  justify-content: center !important;
  padding-bottom: 18px;
}
.logout-btn-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
}
.btn-no {
  background-color: #e0e0e0;
  color: #333;
  border-radius: 999px;
  min-width: 90px;
  height: 36px;
  font-weight: 600;
}
.btn-yes {
  background-color: #f5c400;
  color: #000;
  border-radius: 999px;
  min-width: 90px;
  height: 36px;
  font-weight: 600;
}

.highlight {
  background: #f59e0b;
  padding: 16px;
  border-radius: 10px;
  color: #111827;
}

.highlight strong {
  font-size: 16px;
}

.highlight div {
  font-size: 14px;
  color: #111827;
  margin-top: 4px;
}
</style>
