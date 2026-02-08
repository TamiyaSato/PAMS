<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.checkAuth()

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
  location?: string
  notes?: string
  created_at?: string
}

interface NormalizedAppointment extends Appointment {
  status_text: 'Scheduled' | 'Completed' | 'Cancelled'
  date_only: string
}

interface Person {
  id: number
  full_name: string
  email: string
}

interface ServiceType {
  id: number
  name: string
}

const dialog = ref(false)
const viewMode = ref<'week' | 'month'>('week')

const newAppointment = reactive({
  person_id: '',
  service_id: '',
  preferred_date: null as Date | null,
  user_id: '',
  status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled',
  location: '',
  notes: '',
})

const STATUS_MAP: Record<number, 'Scheduled' | 'Completed' | 'Cancelled'> = {
  0: 'Cancelled',
  1: 'Completed',
  2: 'Scheduled',
}

const appointments = ref<Appointment[]>([])
const persons = ref<Person[]>([])
const serviceTypes = ref<ServiceType[]>([])
const loading = ref(false)
const selectedDate = ref<Date>(new Date())

const viewDialog = ref(false)
const selectedAppointment = ref<NormalizedAppointment | null>(null)

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
  newAppointment.location = ''
  newAppointment.notes = ''
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

async function fetchPersons() {
  try {
    const res = await api.get<Person[]>('/api/v1/persons', { params: { status: 1 } })
    persons.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Failed to fetch persons', err)
    persons.value = []
  }
}

async function fetchServiceTypes() {
  try {
    const res = await api.get<ServiceType[]>('/api/v1/service-types')
    serviceTypes.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Failed to fetch service types', err)
    serviceTypes.value = []
  }
}

async function saveAppointment() {
  if (!newAppointment.person_id || !newAppointment.service_id || !newAppointment.preferred_date)
    return

  try {
    await api.post('/api/v1/appointments', {
      person_id: Number(newAppointment.person_id),
      service_id: Number(newAppointment.service_id),
      preferred_date: newAppointment.preferred_date.toISOString().split('T')[0],
      user_id: Number(authStore.user?.oid),
      status: 1,
      location: newAppointment.location,
      notes: newAppointment.notes,
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
  appointments.value.map((a) => {
    const dateOnly = a.preferred_date ? a.preferred_date.split('T')[0] : ''
    return {
      ...a,
      status_text: STATUS_MAP[a.status] ?? 'Scheduled',
      date_only: dateOnly as string,
    }
  }),
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

onMounted(() => {
  fetchAppointments()
  fetchPersons()
  fetchServiceTypes()
})

function viewAppointment(a: NormalizedAppointment) {
  selectedAppointment.value = a
  viewDialog.value = true
}
</script>

<template>
  <div class="page">
    <v-dialog v-model="viewDialog" max-width="600">
      <v-card v-if="selectedAppointment">
        <v-card-title>Appointment Details</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                label="Appointment ID"
                :model-value="selectedAppointment.id"
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Applicant(s)"
                :model-value="
                  selectedAppointment.applicant_name ?? `Applicant ${selectedAppointment.person_id}`
                "
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Service Type"
                :model-value="
                  selectedAppointment.service_name ?? `Service ${selectedAppointment.service_id}`
                "
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                label="Date"
                :model-value="formatDateTime(selectedAppointment.preferred_date)"
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="6">
              <v-text-field label="Time" :value="formatTime(selectedAppointment)" readonly />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Assigned Staff"
                :model-value="
                  selectedAppointment.assigned_staff ?? `Staff ${selectedAppointment.user_id}`
                "
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-select
                label=""
                :items="['Scheduled', 'Completed', 'Cancelled']"
                :value="selectedAppointment.status_text"
                readonly
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Location / Venue"
                :model-value="selectedAppointment.location ?? ''"
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                label="Notes / Special Instructions"
                :value="selectedAppointment.notes ?? ''"
                readonly
                auto-grow
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn variant="plain" @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="header">
      <div>
        <h2>Hi, Admin!</h2>
        <p>
          <a href="#">Logged in as: [Admin] [Role]</a><br />
          <a href="#">Last login: [date, time]</a>
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
                  <v-select
                    label="Person"
                    v-model="newAppointment.person_id"
                    :items="persons"
                    item-title="full_name"
                    item-value="id"
                    variant="outlined"
                    clearable
                    :loading="!persons.length"
                  />
                </v-col>

                <v-col cols="12">
                  <v-select
                    label="Service Type"
                    v-model="newAppointment.service_id"
                    :items="serviceTypes"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    clearable
                    :loading="!serviceTypes.length"
                  />
                </v-col>

                <v-col cols="6">
                  <v-date-input v-model="newAppointment.preferred_date" label="Preferred Date" />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    label="Location / Venue"
                    v-model="newAppointment.location"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    label="Notes / Special Instructions"
                    v-model="newAppointment.notes"
                    auto-grow
                    variant="outlined"
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

      <div class="appointments-columns sticky-header">
        <div></div>
        <div>Appointment ID</div>
        <div>Applicant/s</div>
        <div>Service</div>
        <div>Date</div>
        <div>Assigned Staff</div>
        <div>Status</div>
        <div></div>
      </div>

      <div class="appointments-scroll">
        <div v-for="a in normalizedAppointments" :key="a.id" class="appointment-row">
          <div class="cell check"><input type="checkbox" /></div>
          <div class="cell id">{{ a.id }}</div>
          <div class="cell applicant">{{ a.applicant_name ?? `Applicant ${a.person_id}` }}</div>
          <div class="cell service">{{ a.service_name ?? `Service ${a.service_id}` }}</div>
          <div class="cell datetime">
            {{ formatDateTime(a.preferred_date) }}
            <div class="time">{{ formatTime(a) }}</div>
          </div>
          <div class="cell staff">{{ a.assigned_staff ?? `Staff ${a.user_id}` }}</div>
          <div class="cell status">
            <span class="status-pill" :class="a.status_text.toLowerCase()">{{
              a.status_text
            }}</span>
          </div>
          <div class="cell action">
            <button class="pill blue small" @click="viewAppointment(a)">View</button>
          </div>
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

.sticky-header {
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
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
  border-bottom: 1px solid #d1d5db;
}

.appointments-scroll {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.appointments-scroll::-webkit-scrollbar {
  width: 6px;
}

.appointments-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.appointments-scroll::-webkit-scrollbar-track {
  background: transparent;
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
    140px;
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
.wrap-text input {
  white-space: normal !important;
  overflow-wrap: break-word;
}
</style>
