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

    <div class="all-appointments">
      <div class="all-appointments-header">
        <h3>All Appointments</h3>

        <div class="header-actions">
          <button class="pill dark">
            Action
            <span class="material-symbols-outlined">expand_more</span>
          </button>

          <button class="pill green">
            <span class="material-symbols-outlined">upload</span>
            Export
          </button>
        </div>
      </div>

      <div class="appointments-columns">
        <div></div>
        <div>Appointment ID</div>
        <div>Applicant/s</div>
        <div>Service</div>
        <div>Date</div>
        <div>Assigned Staff</div>
        <div>Status</div>
        <div></div>
      </div>

      <div v-for="a in normalizedAppointments" :key="a.id" class="appointment-row">
        <div class="cell check">
          <input type="checkbox" />
        </div>

        <div class="cell id">{{ a.id }}</div>

        <div class="cell applicant">
          {{ a.applicant_name ?? `Applicant ${a.person_id}` }}
        </div>

        <div class="cell service">
          {{ a.service_name ?? `Service ${a.service_id}` }}
        </div>

        <div class="cell datetime">
          {{ formatDateTime(a.preferred_date) }}
          <div class="time">{{ formatTime(a) }}</div>
        </div>

        <div class="cell staff">
          {{ a.assigned_staff ?? `Staff ${a.user_id}` }}
        </div>

        <div class="cell status">
          <span class="status-pill" :class="a.status_text.toLowerCase()">
            {{ a.status_text }}
          </span>
        </div>

        <div class="cell action">
          <button class="pill blue small">View</button>
        </div>
      </div>
    </div>
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
}

.pill.blue.small:hover {
  background-color: #1e40af;
}

.pill.dark {
  background: #0b1b5a;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pill.green {
  background: #1f8f4a;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
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

.all-appointments {
  background: white;
  border-radius: 16px;
  padding: 16px;
}

.all-appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.all-appointments-header h3 {
  margin: 0;
  font-weight: 700;
}

.appointments-columns {
  display: grid;
  grid-template-columns:
    32px
    100px
    220px
    260px
    220px
    180px
    140px
    100px;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.appointment-row {
  display: grid;
  grid-template-columns:
    32px
    100px
    220px
    260px
    220px
    180px
    140px
    100px;
  align-items: center;
  background: #eef5f9;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
}

.cell {
  font-size: 0.95rem;
}

.cell.check {
  display: flex;
  justify-content: flex-start;
}

.cell.id {
  margin-left: -6px;
  font-variant-numeric: tabular-nums;
}

.cell.datetime .time {
  font-size: 0.85rem;
  color: #6b7280;
}

.status-pill {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-pill.scheduled {
  background: #dbeafe;
  color: #1e40af;
}

.status-pill.completed {
  background: #dcfce7;
  color: #166534;
}

.status-pill.cancelled {
  background: #fee2e2;
  color: #991b1b;
}
</style>
