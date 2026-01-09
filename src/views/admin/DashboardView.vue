<script setup lang="ts">
</script>

<template>
  <v-container fluid class="dashboard">


    <div class="top-header">
      <div class="welcome">
        <h2>Hi, Admin!</h2>
        <p>
          <a href="#">Logged in as: [Admin] [Role]</a><br />
          <a href="#">Last login: [date, time]</a>
        </p>
      </div>

      <div class="top-actions">
        <div class="search-box">
          <v-icon size="18">search</v-icon>
          <input type="text" placeholder="Search dashboard" />
        </div>

        <button class="pill dark">
          Year
          <v-icon size="18">expand_more</v-icon>
        </button>

        <button class="pill dark">
          Category
          <v-icon size="18">expand_more</v-icon>
        </button>
      </div>
    </div>


    <div class="stats">
      <div class="stat-card">
        <div class="stat-left">
          <v-icon>assignment</v-icon>
          <span>Applications Today</span>
        </div>
        <div class="count">21</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>inventory</v-icon>
          <span>Active Services</span>
        </div>
        <div class="count">124</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <v-icon>warning</v-icon>
          <span>Pending Approvals</span>
        </div>
        <div class="count">08</div>
      </div>
    </div>


    <v-row>

      <v-col cols="12" md="8">
        <v-card class="content-card">
          <h3>Service Management</h3>

          <div class="service-row">
            <v-avatar color="green" size="40">
              <v-icon color="white">accessible</v-icon>
            </v-avatar>

            <div class="service-info">
              <strong>Wheelchair Distribution</strong>
              <span>Service Name</span>
            </div>

            <div class="service-info">
              <strong>PWD Application</strong>
              <span>Category</span>
            </div>

            <div class="service-info">
              <strong>162</strong>
              <span>Applicants</span>
            </div>

            <span class="status active">Active</span>

            <button class="link-btn">View Details</button>
          </div>
        </v-card>


        <v-card class="content-card mt-4">
          <h3>Application Review</h3>

          <div class="review-row">
  <div class="review-cell applicant">
    <v-avatar size="40">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRUcux_QhsmbgtdjMe3q2djMPS2oKtPYUAEw&s"
      />
    </v-avatar>
    <div>
      <div class="value">Juan A. Dela Cruz</div>
      <div class="label">Applicant</div>
    </div>
  </div>

  <div class="review-cell">
    <div class="value">Psychosocial</div>
    <div class="label">Disability</div>
  </div>

  <div class="review-cell">
    <div class="value">Christmas Package</div>
    <div class="label">Service</div>
  </div>

  <div class="review-cell">
    <div class="value">2025-12-03</div>
    <div class="label">Date</div>
  </div>

  <div class="review-actions">
    <button class="actions-btn">
      Actions
      <v-icon end>expand_more</v-icon>
    </button>
  </div>
</div>

        </v-card>
      </v-col>


      <v-col cols="12" md="4">
        <v-card class="content-card">
          <h3>Appointments</h3>

          <div class="appointment">
            <v-avatar color="green" size="40">
              <v-icon color="white">accessible</v-icon>
            </v-avatar>

            <div>
              <strong>Thu, Dec 18 – J. Dela Cruz</strong>
              <p>11:30 AM – 12:00 PM</p>
            </div>
          </div>
        </v-card>

        <v-card class="content-card mt-4">
          <h3>Activity Logs</h3>
          <p>
            Admin John sent a scheduled appointment.
            <span class="link">View</span>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dashboard {
  background: #eef5f9;
  padding: 24px;
  min-height: 100vh;
  font-family: Inter, sans-serif;
}


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

.search-box {
  background: white;
  padding: 10px 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
}


.pill {
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pill.dark {
  background: #0b1b5a;
  color: white;
}


.content-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.content-card h3 {
  margin-bottom: 16px;
}


.service-row {
  display: grid;
  grid-template-columns: auto 1.6fr 1.6fr 1fr auto auto;
  gap: 16px;
  align-items: center;
}

.service-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.status.active {
  color: #1e8e3e;
  font-weight: 600;
}

.link-btn {
  background: none;
  border: none;
  color: #0d6efd;
  cursor: pointer;
}


.review-row {
  display: grid;
  grid-template-columns: 2.4fr 1.4fr 1.6fr 1.2fr auto;
  align-items: center;
  gap: 24px;
}

.review-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.review-cell.applicant {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}


.value {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

.label {
  font-size: 12px;
  color: #8a8a8a;
  line-height: 1.2;
}


.actions-btn {
  background: #0b1b5a;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 6px 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
}


.appointment {
  display: flex;
  gap: 12px;
  align-items: center;
}

.link {
  color: #0d6efd;
  cursor: pointer;
}
</style>
