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
  applicant_name?: string
  assigned_staff?: string
  time_start?: string
  time_end?: string
  created_at?: string
}

interface NormalizedAppointment extends Appointment {
  status_text: 'Confirmed' | 'Pending' | 'Reschedule'
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

const newAppointment = reactive({
  person_id: '',
  service_id: '',
  preferred_date: null as Date | null,
  user_id: '',
  status: 'Pending' as 'Confirmed' | 'Pending' | 'Reschedule',
  location: '',
  notes: '',
})

const STATUS_MAP: Record<number, 'Confirmed' | 'Pending' | 'Reschedule'> = {
  1: 'Confirmed',
  2: 'Pending',
  3: 'Reschedule',
}

const appointments = ref<Appointment[]>([])
const persons = ref<Person[]>([])
const serviceTypes = ref<ServiceType[]>([])
const loading = ref(false)
const selectedDate = ref<Date>(new Date())

const viewDialog = ref(false)
const selectedAppointment = ref<NormalizedAppointment | null>(null)

/** Local YYYY-MM-DD for a Date (avoids UTC shift from toISOString) */
function toLocalDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse UTC ISO string and return local date YYYY-MM-DD for grouping/calendar */
function getLocalDateOnlyFromISO(iso: string): string {
  if (!iso) return ''
  return toLocalDateString(new Date(iso))
}

function formatDateTime(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Format date and time in locale (UTC stored value → local display) */
function formatDateTimeLocale(date: string) {
  const d = new Date(date)
  const dateStr = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${dateStr}, ${timeStr}`
}

function formatTime(a: NormalizedAppointment) {
  if (a.time_start && a.time_end) return `${a.time_start} – ${a.time_end}`
  const d = new Date(a.preferred_date)
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function resetForm() {
  newAppointment.person_id = ''
  newAppointment.service_id = ''
  newAppointment.preferred_date = null
  newAppointment.user_id = ''
  newAppointment.status = 'Pending'
  newAppointment.location = ''
  newAppointment.notes = ''
}

async function fetchAppointments() {
  loading.value = true
  try {
    const res = await api.get<Appointment[]>('/api/v1/appointments/me')
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
      preferred_date: toLocalISOString(newAppointment.preferred_date),
      user_id: Number(authStore.user?.oid),
      status: 2,
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

function toLocalISOString(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000 // minutes to milliseconds
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString()
  return localISOTime.slice(0, -1) // Remove the 'Z'
}

/** Selected calendar date in local YYYY-MM-DD (not UTC) */
const selectedDateISO = computed(() => toLocalDateString(selectedDate.value))

/** Unique appointment dates in local YYYY-MM-DD for v-date-picker events */
const calendarEvents = computed<string[]>(() => {
  const dates = appointments.value
    .map((a) => (a.preferred_date ? getLocalDateOnlyFromISO(a.preferred_date) : null))
    .filter((d): d is string => d != null && d !== '')
  return [...new Set(dates)]
})

const normalizedAppointments = computed<NormalizedAppointment[]>(() =>
  appointments.value.map((a) => {
    const dateOnly = a.preferred_date ? getLocalDateOnlyFromISO(a.preferred_date) : ''
    return {
      ...a,
      status_text: STATUS_MAP[a.status] ?? 'Pending',
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

const confirmedAppointments = computed(() =>
  normalizedAppointments.value.filter((a) => a.status_text === 'Confirmed'),
)

const pendingAppointments = computed(() =>
  normalizedAppointments.value.filter((a) => a.status_text === 'Pending'),
)

const rescheduleAppointments = computed(() =>
  normalizedAppointments.value.filter((a) => a.status_text === 'Reschedule'),
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
                label="Person Name"
                :model-value="
                  selectedAppointment.person_name ?? `Person ${selectedAppointment.person_id}`
                "
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Person Contact"
                :model-value="selectedAppointment.person_contact ?? '—'"
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Service Name"
                :model-value="
                  selectedAppointment.service_name ?? `Service ${selectedAppointment.service_id}`
                "
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Service Description"
                :model-value="selectedAppointment.service_description ?? '—'"
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Service Category"
                :model-value="selectedAppointment.service_category ?? '—'"
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                label="Preferred Date"
                :model-value="formatDateTime(selectedAppointment.preferred_date)"
                readonly
                variant="outlined"
                persistent-placeholder
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                label="Time"
                :model-value="formatTime(selectedAppointment)"
                readonly
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="Status"
                :model-value="selectedAppointment.status_text"
                readonly
                variant="outlined"
                persistent-placeholder
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
                :model-value="selectedAppointment.notes ?? ''"
                readonly
                auto-grow
                variant="outlined"
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
      <h2>Appointments & Schedule</h2>

      <div class="header-actions">
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
        <span>Confirmed</span>
        <b>{{ confirmedAppointments.length }}</b>
      </div>
      <div class="stat">
        <span>Pending</span>
        <b>{{ pendingAppointments.length }}</b>
      </div>
      <div class="stat">
        <span>Reschedule</span>
        <b>{{ rescheduleAppointments.length }}</b>
      </div>
    </div>

    <div class="schedule">
      <div class="calendar">
        <v-date-picker
          v-model="selectedDate"
          :events="calendarEvents"
          hide-header
          event-color="yellow"
        />
      </div>

      <div class="details">
        <h4>Appointments for {{ selectedDateISO }}</h4>

        <div v-for="a in todaysAppointments" :key="a.id" class="appointment-detail-card">
          <div class="appointment-detail-header">
            <span class="status-pill" :class="a.status_text.toLowerCase()">{{
              a.status_text
            }}</span>
            <span class="appointment-id">#{{ a.id }}</span>
          </div>
          <dl class="appointment-detail-fields">
            <dt>Person Name</dt>
            <dd>{{ a.person_name ?? `Person ${a.person_id}` }}</dd>
            <dt>Person Contact</dt>
            <dd>{{ a.person_contact ?? '—' }}</dd>
            <dt>Service</dt>
            <dd>{{ a.service_name ?? `Service ${a.service_id}` }}</dd>
            <dt>Service Description</dt>
            <dd>{{ a.service_description ?? '—' }}</dd>
            <dt>Service Category</dt>
            <dd>{{ a.service_category ?? '—' }}</dd>
            <dt>Preferred Date & Time (local)</dt>
            <dd>{{ formatDateTimeLocale(a.preferred_date) }}</dd>
            <dt v-if="a.location">Location</dt>
            <dd v-if="a.location">{{ a.location }}</dd>
            <dt v-if="a.notes">Notes</dt>
            <dd v-if="a.notes">{{ a.notes }}</dd>
          </dl>
          <v-btn
            class="view-btn"
            variant="tonal"
            color="primary"
            size="small"
            @click="viewAppointment(a)"
          >
            View full details
          </v-btn>
        </div>

        <p v-if="!todaysAppointments.length" class="no-appointments">
          No appointments for this date.
        </p>
      </div>
    </div>

    <div class="all-appointments">
      <div class="all-appointments-header">
        <h3>All Appointments</h3>

        <div class="header-actions"></div>
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
          <div class="cell applicant">
            {{ a.person_name ?? a.applicant_name ?? `Applicant ${a.person_id}` }}
          </div>
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
  grid-template-columns: repeat(5, 1fr);
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

.appointment-detail-card {
  background: #eef5f9;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e0e7ef;
}

.appointment-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #d1d5db;
}

.appointment-detail-header .appointment-id {
  font-variant-numeric: tabular-nums;
  color: #6b7280;
  font-size: 0.9rem;
}

.appointment-detail-fields {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 6px 16px;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
}

.appointment-detail-fields dt {
  color: #6b7280;
  font-weight: 500;
}

.appointment-detail-fields dd {
  margin: 0;
}

.appointment-detail-card .view-btn {
  margin-top: 8px;
}

.no-appointments {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
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

.status-pill.confirmed {
  background: #dcfce7;
  color: #166534;
}

.status-pill.pending {
  background: #fef3c7;
  color: #b45309;
}

.status-pill.reschedule {
  background: #dbeafe;
  color: #1e40af;
}
.wrap-text input {
  white-space: normal !important;
  overflow-wrap: break-word;
}
</style>
