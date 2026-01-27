<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/axios'

interface Appointment {
  id: number
  person_id: number
  service_id: number
  user_id: number
  applicant_name?: string
  service_name?: string
  assigned_staff?: string
  preferred_date: string
  time_start?: string
  time_end?: string
  status: number
  created_at?: string
}

interface NormalizedAppointment extends Appointment {
  status_text: 'Scheduled' | 'Completed' | 'Cancelled'
  date_only: string
}

const dialog = ref(false)
const viewMode = ref<'week' | 'month'>('week')

const newAppointment = reactive({
  person_id: '',
  service_id: '',
  preferred_date: null as Date | null,
  user_id: '',
  status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled',
})

const STATUS_MAP: Record<number, 'Scheduled' | 'Completed' | 'Cancelled'> = {
  0: 'Cancelled',
  1: 'Completed',
  2: 'Scheduled',
}

const appointments = ref<Appointment[]>([])
const loading = ref(false)
const selectedDate = ref<Date>(new Date())

function formatDateTime(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(a: NormalizedAppointment) {
  if (!a.time_start || !a.time_end) return '—'
  return `${a.time_start} – ${a.time_end}`
}

function resetForm() {
  newAppointment.person_id = ''
  newAppointment.service_id = ''
  newAppointment.preferred_date = null
  newAppointment.user_id = ''
  newAppointment.status = 'Scheduled'
}

async function fetchAppointments() {
  loading.value = true
  try {
    const res = await api.get<Appointment[]>('/api/v1/appointments')
    appointments.value = res.data
  } finally {
    loading.value = false
  }
}

async function saveAppointment() {
  if (
    !newAppointment.person_id ||
    !newAppointment.service_id ||
    !newAppointment.preferred_date ||
    !newAppointment.user_id
  )
    return

  try {
    const statusNum = Number(
      Object.entries(STATUS_MAP).find(([, v]) => v === newAppointment.status)?.[0] ?? 2,
    )

    await api.post('/api/v1/appointments', {
      person_id: Number(newAppointment.person_id),
      service_id: Number(newAppointment.service_id),
      preferred_date: newAppointment.preferred_date.toISOString().split('T')[0],
      user_id: Number(newAppointment.user_id),
      status: statusNum,
    })

    dialog.value = false
    resetForm()
    await fetchAppointments()
  } catch (err) {
    console.error('Failed to create appointment', err)
  }
}

const selectedDateISO = computed(() => selectedDate.value.toISOString().split('T')[0])

const normalizedAppointments = computed<NormalizedAppointment[]>(() =>
  appointments.value.map((a) => ({
    ...a,
    status_text: STATUS_MAP[a.status] ?? 'Scheduled',
    date_only: a.preferred_date?.split('T')[0] ?? '',
  })),
)

const todaysAppointments = computed(() =>
  normalizedAppointments.value.filter((a) => a.date_only === selectedDateISO.value),
)

const upcomingAppointments = computed(() =>
  normalizedAppointments.value.filter((a) => new Date(a.preferred_date) > selectedDate.value),
)

const completedAppointments = computed(() =>
  normalizedAppointments.value.filter((a) => a.status_text === 'Completed'),
)

const cancelledAppointments = computed(() =>
  normalizedAppointments.value.filter((a) => a.status_text === 'Cancelled'),
)

onMounted(fetchAppointments)
</script>

<template>
  <div class="page">
    <div class="header">
      <div>
        <h2>Hi, Admin!</h2>
        <p class="meta">
          Logged in as: <span class="link">[Admin]</span> <span class="link">[Role]</span><br />
          Last login: [date, time]
        </p>
      </div>

      <div class="header-actions">
        <div class="search">
          <span class="material-symbols-outlined">search</span>
          <input placeholder="Search by name or ID number" />
        </div>

        <div class="toggle">
          <button :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">WEEK</button>
          <button :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">
            MONTH
          </button>
        </div>

        <v-dialog v-model="dialog" max-width="600">
          <template #activator="{ props }">
            <button class="pill yellow" v-bind="props">+ New Appointment</button>
          </template>

          <v-card title="New Appointment">
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    label="Person ID"
                    v-model.number="newAppointment.person_id"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    label="Service ID"
                    v-model.number="newAppointment.service_id"
                    required
                  />
                </v-col>

                <v-col cols="6">
                  <v-date-picker v-model="newAppointment.preferred_date" title="Select date" />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    label="Assigned User ID"
                    v-model.number="newAppointment.user_id"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-select
                    label="Status"
                    :items="['Scheduled', 'Completed', 'Cancelled']"
                    v-model="newAppointment.status"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-spacer />
              <v-btn variant="plain" @click="dialog = false">Cancel</v-btn>
              <v-btn color="primary" variant="tonal" @click="saveAppointment">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <span>Today's Appointments</span>
        <b>{{ todaysAppointments.length }}</b>
      </div>
      <div class="stat">
        <span>Upcoming Visits</span>
        <b>{{ upcomingAppointments.length }}</b>
      </div>
      <div class="stat">
        <span>Completed</span>
        <b>{{ completedAppointments.length }}</b>
      </div>
      <div class="stat">
        <span>Cancelled</span>
        <b>{{ cancelledAppointments.length }}</b>
      </div>
    </div>

    <div class="schedule">
      <div class="calendar">
        <h4>Select Date</h4>
        <v-date-picker v-model="selectedDate" />
      </div>

      <div class="details">
        <h4>Appointments for {{ selectedDateISO }}</h4>

        <div v-for="a in todaysAppointments" :key="a.id" class="appointment">
          <b>Applicant {{ a.person_id }}</b>
          <p>Service: Service {{ a.service_id }}</p>
          <p>Time: {{ formatTime(a) }}</p>
          <p>Assigned Staff: Staff {{ a.user_id }}</p>
          <span class="status">{{ a.status_text }}</span>
        </div>

        <p v-if="!todaysAppointments.length">No appointments for this date.</p>
      </div>
    </div>

    <table class="appointments-table">
      <thead>
        <tr>
          <th class="col-check"></th>
          <th class="col-id">Appointment ID</th>
          <th class="col-applicant">Applicant</th>
          <th class="col-service">Service</th>
          <th class="col-datetime">Date & Time</th>
          <th class="col-staff">Assigned Staff</th>
          <th class="col-status">Status</th>
          <th class="col-action"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="a in normalizedAppointments" :key="a.id">
          <td class="col-check"><input type="checkbox" /></td>
          <td class="col-id">{{ a.id }}</td>
          <td class="col-applicant">Applicant {{ a.person_id }}</td>
          <td class="col-service">Service {{ a.service_id }}</td>
          <td class="col-datetime">{{ formatDateTime(a.preferred_date) }}</td>
          <td class="col-staff">Staff {{ a.user_id }}</td>
          <td class="col-status">
            <span class="status-pill">{{ a.status_text }}</span>
          </td>
          <td class="col-action">
            <button class="pill blue small">View</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.page {
  background: #eef5f9;
  padding: 24px;
  font-family: Inter, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search {
  background: white;
  border-radius: 999px;
  padding: 8px 14px;
  display: flex;
  gap: 6px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat {
  background: #0b1b5a;
  color: white;
  padding: 16px;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
}

.schedule {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 16px;
  margin-bottom: 24px;
}

.calendar,
.details {
  background: white;
  border-radius: 14px;
  padding: 16px;
}

.appointment {
  background: #eef5f9;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 12px;
}
.appointments-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  table-layout: fixed;
}

.appointments-table th,
.appointments-table td {
  padding: 14px;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.col-check {
  width: 40px;
  text-align: center;
}
.col-id {
  width: 140px;
}
.col-applicant {
  width: 220px;
}
.col-service {
  width: 260px;
}
.col-datetime {
  width: 220px;
}
.col-staff {
  width: 180px;
}
.col-status {
  width: 140px;
}
.col-action {
  width: 100px;
}

.appointments-table tbody tr {
  background: #eef5f9;
  border-radius: 12px;
}

.appointments-table tbody tr td:first-child {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.appointments-table tbody tr td:last-child {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.status-pill {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;
}

.table-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
}

tbody tr {
  background: #eef5f9;
}
.toggle {
  display: flex;
  background: #e5e7eb;
  border-radius: 999px;
  padding: 4px;
}

.toggle button {
  border: none;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  background: transparent;
  font-weight: 600;
}

.toggle .active {
  background: #0b1b5a;
  color: white;
}

.pill {
  border-radius: 999px;
  padding: 10px 18px;
  border: none;
  cursor: pointer;
}

.pill.yellow {
  background: #ffbf00;
}
.pill {
  border-radius: 999px;
  padding: 10px 18px;
  border: none;
  cursor: pointer;
}

.pill.yellow {
  background: #ffbf00;
}
.pill.blue.small {
  background-color: #0b1b5a;
  color: white;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
}

.pill.blue.small:hover {
  background-color: #1e40af;
}
</style>
