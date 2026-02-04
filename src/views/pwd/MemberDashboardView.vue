<script setup lang="ts">
import catto from '../../assets/catto.jpg'
</script>

<template>
  <v-container fluid class="dashboard">
    <div class="top-bar">
      <div class="left">
        <h2>Welcome, John!</h2>
        <p class="sub">
          <a href="#">Last login: [date, time]</a>
        </p>
      </div>

      <div class="right">
        <div class="search">
          <v-icon size="18">search</v-icon>
          <input placeholder="Search for something" />
        </div>

        <v-icon class="icon">settings</v-icon>
        <v-icon class="icon">notifications</v-icon>

        <v-avatar size="40">
          <img :src="catto" alt="Avatar" />
        </v-avatar>
      </div>
    </div>

    <div class="stats">
      <div class="stat-pill">
        <v-icon class="stat-icon">description</v-icon>
        <span class="stat-title">Active Applications</span>
        <button class="stat-btn">View More</button>
      </div>

      <div class="stat-pill">
        <v-icon class="stat-icon">check_circle</v-icon>
        <span class="stat-title">Approved Services</span>
        <button class="stat-btn">View More</button>
      </div>

      <div class="stat-pill">
        <v-icon class="stat-icon">event</v-icon>
        <span class="stat-title">Next Appointment</span>
        <button class="stat-btn">View More</button>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="card">
          <div class="card-header">
            <h3>Application Status</h3>
            <a href="#">View full status page</a>
          </div>

          <div class="status-row">
            <v-avatar size="36" color="green">
              <v-icon color="white" size="18">accessible</v-icon>
            </v-avatar>

            <div class="status-info">
              <strong>Ref. #001</strong>
              <small>Reference Number</small>
              <span>Wheelchair Distribution</span>
              <small>Service Name</small>
            </div>

            <span class="badge viewed">VIEWED</span>
          </div>

          <div class="status-row">
            <v-avatar size="36" color="green">
              <v-icon color="white" size="18">accessible</v-icon>
            </v-avatar>

            <div class="status-info">
              <strong>Ref. #002</strong>
              <small>Reference Number</small>
              <span>Wheelchair Distribution</span>
              <small>Service Name</small>
            </div>

            <span class="badge viewed">SUBMITTED</span>
          </div>

          <div class="status-row">
            <v-avatar size="36" color="green">
              <v-icon color="white" size="18">accessible</v-icon>
            </v-avatar>

            <div class="status-info">
              <strong>Ref. #003</strong>
              <small>Reference Number</small>
              <span>Wheelchair Distribution</span>
              <small>Service Name</small>
            </div>

            <span class="badge viewed">ACTIVE</span>
          </div>
        </v-card>

        <v-card class="card mt">
          <h3>Available Services</h3>

          <div class="services">
            <div class="service">
              <v-icon>card_giftcard</v-icon>
              <strong>CHRISTMAS PACKAGE</strong>
              <button>Apply Here</button>
            </div>

            <div class="service">
              <v-icon>visibility</v-icon>
              <strong>EYEGLASSES</strong>
              <button>Apply Here</button>
            </div>

            <div class="service">
              <v-icon>fitness_center</v-icon>
              <strong>PROSTHETIC</strong>
              <button>Apply Here</button>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="card center">
          <h3>My Queue #</h3>

          <div class="queue-oval">PWD-014</div>

          <p class="queue-desc">
            EYEGLASSES SCREENING<br />
            December 15, 2025<br />
            at 8:00 AM
          </p>
        </v-card>

        <v-card class="card mt">
          <h3>Appointments</h3>
          <p><strong>Next Appointment:</strong></p>
          <ul>
            <li>Date/Time: December 15, 2025 at 8 AM</li>
            <li>Visit: Barangay Sampaloc 2</li>
          </ul>
          <button class="primary">Manage Appointments Here</button>
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

.viewed,
.submitted,
.active {
  color: #2563eb;
}

.badge {
  margin-left: auto;
  font-weight: 600;
}

.viewed {
  color: #2563eb;
}
.submitted {
  color: #2563eb;
}
.active {
  color: #2563eb;
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
