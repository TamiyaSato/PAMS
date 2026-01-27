<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import pamsLogo from '@/assets/PAMS.png'

const authStore = useAuthStore()
authStore.checkAuth()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const logoutDialog = ref(false)

const handleLogout = () => {
  logoutDialog.value = false
  localStorage.removeItem('authToken')
  authStore.logout()
}
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
</script>

<template>
  <v-layout>
    <!-- Sidebar: unchanged -->
    <v-navigation-drawer
      permanent
      rail
      expand-on-hover
      width="280"
      rail-width="72"
      class="member-drawer"
    >
      <div class="logo-section">
        <img :src="pamsLogo" alt="PAMS Logo" class="logo-image" />
      </div>
      <RouterView />
    </v-navigation-drawer>

    <v-main>
      <v-app-bar flat title="Appointments" />

      <v-container fluid>
        <!-- Pending Confirmation -->
        <v-row>
          <v-col cols="12">
            <v-card class="pending-card">
              <h3 class="section-title">Pending Confirmation</h3>
              <p class="section-subtitle">
                An administrator has scheduled the following visit for you. Please confirm your
                attendance.
              </p>

              <v-row class="align-start mt-4">
                <!-- Highlight / Appointment -->
                <v-col cols="12" md="8">
                  <div class="highlight">
                    <strong>Wheelchair Fitting</strong>
                    <div>Wednesday, February 25, 2026 · 10:00 AM</div>
                    <div>With staff: Liza Ramos</div>
                  </div>
                </v-col>

                <!-- Action buttons -->
                <v-col cols="12" md="4">
                  <v-btn color="#045e40" block class="mb-2 btn-confirm"> Confirm Attendance </v-btn>
                  <v-btn color="#F3F4F6" block class="btn-reschedule"> Request Reschedule </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-6">
          <!-- Calendar -->
          <v-col cols="12" md="6">
            <v-card class="calendar-card">
              <div class="calendar-header">
                <strong>February 2026</strong>
              </div>
              <div class="calendar-grid">
                <div class="day" v-for="d in days" :key="d">{{ d }}</div>
                <div
                  class="date"
                  v-for="n in 28"
                  :key="n"
                  :class="{ selected: n === 25, muted: n === 18 }"
                >
                  {{ n }}
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Appointment Details -->
          <v-col cols="12" md="6">
            <v-card class="details-card">
              <div class="details-title">Appointment Details</div>

              <div class="details-row">
                <span class="label">Staff</span>
                <span class="value">Liza Ramos</span>
              </div>

              <div class="details-row">
                <span class="label">Date & Time</span>
                <span class="value">Wednesday, February 25, 2026 · 10:00 AM</span>
              </div>

              <div class="details-row">
                <span class="label">Service</span>
                <span class="value">Wheelchair Fitting</span>
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

        <!-- Appointments History -->
        <v-row class="mt-6">
          <v-col cols="12">
            <v-card class="history-card">
              <h3 class="section-title">Appointments History</h3>
              <v-simple-table dense>
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
                        <v-icon dark>mdi-wheelchair</v-icon>
                      </v-avatar>
                    </td>
                    <td>#001</td>
                    <td>Wheelchair Fitting</td>
                    <td>February 25, 2026 10:00 AM</td>
                    <td>Liza Ramos</td>
                    <td>
                      <v-chip color="#10B981" small>Approved</v-chip>
                    </td>
                    <td>
                      <v-btn small color="#F59E0B" dark>View Details</v-btn>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <v-avatar color="#F59E0B" size="32">
                        <v-icon dark>mdi-wheelchair</v-icon>
                      </v-avatar>
                    </td>
                    <td>#002</td>
                    <td>Initial Consultation</td>
                    <td>February 18, 2026 9:00 AM</td>
                    <td>Liza Ramos</td>
                    <td>
                      <v-chip color="#EF4444" small>Cancelled</v-chip>
                    </td>
                    <td>
                      <v-btn small color="#F59E0B" dark>View Details</v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Logout dialog -->
      <v-dialog v-if="isAuthenticated" v-model="logoutDialog" max-width="420" persistent>
        <v-card class="logout-card">
          <v-card-title class="logout-title"> Confirm Logout </v-card-title>
          <v-card-text class="logout-text"> Are you sure you want to log out? </v-card-text>
          <v-card-actions class="logout-actions">
            <div class="logout-btn-wrapper">
              <v-btn class="btn-no" @click="logoutDialog = false"> NO </v-btn>
              <v-btn class="btn-yes" @click="handleLogout"> YES </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-layout>
</template>

<style scoped>
/* Sidebar: unchanged */
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

/* Pending confirmation */
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
  background-color: #045e40;
  color: #ffffff;
  font-weight: 600;
}
.btn-reschedule {
  background-color: #f3f4f6;
  color: #111827;
  font-weight: 600;
}

/* Calendar */
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

/* Appointment Details */
.details-card {
  padding: 24px 32px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* Title */
.details-title {
  font-size: 22px; /* increased from 20px */
  font-weight: 700;
  margin-bottom: 16px;
}

/* Each row: label + value */
.details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0; /* slightly more spacing */
}

/* Label */
.label {
  font-size: 14px; /* increased from 12px */
  font-weight: 500;
  color: #6b7280;
}

/* Value */
.value {
  font-size: 16px; /* increased from 14px */
  font-weight: 600;
  color: #111827;
}

/* Divider spacing */
.v-divider.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

/* Subtitle */
.details-subtitle {
  font-size: 16px; /* increased from 14px */
  font-weight: 600;
  margin-bottom: 8px;
}

/* Documents list */
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

/* Logout dialog */
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
  background: #f59e0b; /* yellow */
  padding: 16px;
  border-radius: 10px;
  color: #111827; /* black text */
}

.highlight strong {
  font-size: 16px;
}

.highlight div {
  font-size: 14px;
  color: #111827; /* black text */
  margin-top: 4px;
}
</style>
