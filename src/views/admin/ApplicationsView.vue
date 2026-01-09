<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
    rel="stylesheet"
  />

  <div class="services-view">

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
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search by name or queue number" />
        </div>

        <button class="pill dark">
          Service
          <span class="material-symbols-outlined">expand_more</span>
        </button>

        <button class="pill dark">
          Category
          <span class="material-symbols-outlined">expand_more</span>
        </button>

        <button class="pill dark">
          Status
          <span class="material-symbols-outlined">expand_more</span>
        </button>
      </div>
    </div>


    <div class="stats">
      <div class="stat-card">
        <div class="stat-left">
          <span class="material-symbols-outlined">download</span>
          <span>New Applications</span>
        </div>
        <div class="count">03</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <span class="material-symbols-outlined">visibility</span>
          <span>For Verification</span>
        </div>
        <div class="count">02</div>
      </div>

      <div class="stat-card">
        <div class="stat-left">
          <span class="material-symbols-outlined">calendar_month</span>
          <span>Scheduled Meetings</span>
        </div>
        <div class="count">01</div>
      </div>
    </div>


    <div class="table-card">
      <div class="table-top">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <button class="export-btn">
          <span class="material-symbols-outlined">ios_share</span>
          Export
        </button>
      </div>

      <table class="services-table">
        <thead>
          <tr>
            <th></th>
            <th>Queue No.</th>
            <th>Applicant Name</th>
            <th>Disability Type</th>
            <th>Service</th>
            <th>Category</th>
            <th>Date Applied</th>
            <th>Files</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in applications" :key="row.queue">
            <td><input type="checkbox" /></td>
            <td>{{ row.queue }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.disability }}</td>
            <td>{{ row.service }}</td>
            <td>{{ row.category }}</td>
            <td>{{ row.date }}</td>
            <td>
              <span class="material-symbols-outlined file-icon">folder</span>
            </td>
            <td>
              <button class="actions-btn">
                {{ row.status }}
                <span class="material-symbols-outlined">expand_more</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const tabs = [
  "All",
  "Viewed",
  "Verification",
  "Approved",
  "Denied",
  "On Hold",
  "Scheduled",
];

const activeTab = ref("All");

const applications = [
  {
    queue: "PWD-010",
    name: "Charlie F. Sanchez",
    disability: "Psychosocial",
    service: "Christmas Package",
    category: "House-to-House",
    date: "2025-12-05",
    status: "Denied",
  },
  {
    queue: "PWD-011",
    name: "Juan A. Dela Cruz",
    disability: "Psychosocial",
    service: "Christmas Package",
    category: "House-to-House",
    date: "2025-12-03",
    status: "Verify",
  },
  {
    queue: "PWD-012",
    name: "Luz V. Minda",
    disability: "Hearing",
    service: "Wheelchair Distribution",
    category: "PWD Application",
    date: "2025-10-05",
    status: "Actions",
  },
  {
    queue: "PWD-014",
    name: "Maria A. Josefina",
    disability: "Visual",
    service: "Eyeglass Distribution",
    category: "PWD Application",
    date: "2025-11-15",
    status: "Scheduled",
  },
  {
    queue: "PWD-015",
    name: "Marie S. Soriano",
    disability: "Visual",
    service: "Eyeglass Distribution",
    category: "PWD Application",
    date: "2025-11-17",
    status: "On Hold",
  },
];
</script>

<style scoped>
.services-view {
  background: #eef5f9;
  padding: 24px;
  min-height: 100vh;
  font-family: Inter, sans-serif;
}

.top-header {
  display: flex;
  justify-content: space-between;
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



.table-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
}

.table-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tabs {
  display: flex;
  gap: 36px;
}

.tab {
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 15px;
  color: #8b8b8b;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: #0d6efd;
  font-weight: 600;
}

.tab.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #0d6efd;
}

.services-table {
  width: 100%;
  border-collapse: collapse;
}

.services-table thead th {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.services-table tbody tr {
  background: #eef5f9;
}

.services-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #dbe5ee;
}

.services-table td {
  padding: 16px 12px;
}

.actions-btn {
  background: #0b1b5a;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.export-btn {
  background: #02833c;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.file-icon {
  color: #0d6efd;
}

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 500, "opsz" 24;
}
</style>
