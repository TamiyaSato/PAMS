<script setup lang="ts">
import api from '@/api/axios'
import { onMounted, ref, computed, watch } from 'vue'
import type { announcementResponse } from '@/models/announcementResponse'

const dialog = ref(false)
const tabs = ['All Announcements', 'Posted', 'Scheduled', 'Draft', 'Archived']
const activeTab = ref('All Announcements')

const announcements = ref<announcementResponse[]>([])
const loading = ref(false)

function getStatus(a: announcementResponse) {
  return a.active ?? 0
}

const filteredAnnouncements = computed(() => {
  const all = announcements.value || []
  switch (activeTab.value) {
    case 'Posted':
      return all.filter((a) => getStatus(a) === 1)
    case 'Scheduled':
      return all.filter((a) => getStatus(a) === 2)
    case 'Draft':
      return all.filter((a) => getStatus(a) === 3)
    case 'Archived':
      return all.filter((a) => getStatus(a) === 4)
    default:
      return all
  }
})

const newAnnouncement = ref<Partial<announcementResponse>>({
  title: '',
  content: '',

  posted_by: 0,
  status: 1,
  date_posted: '',
})

async function saveAnnouncement() {
  try {
    const dateCreated = newAnnouncement.value.date_posted
      ? new Date(newAnnouncement.value.date_posted).toISOString().split('T')[0]
      : ''
    const payload: Partial<announcementResponse> = {
      title: newAnnouncement.value.title,
      content: newAnnouncement.value.content,

      posted_by: newAnnouncement.value.posted_by,
      status: newAnnouncement.value.status,
      date_posted: dateCreated,
    }

    await api.post('/api/v1/announcements', payload)
    dialog.value = false
    await fetchAnnouncements()

    newAnnouncement.value = {
      title: '',
      content: '',

      posted_by: 0,
      status: 1,
      date_posted: '',
    }
  } catch (error) {
    console.error('Error saving announcement:', error)
  }
}

watch(dialog, (val) => {
  if (val) {
    newAnnouncement.value = {
      title: '',
      content: '',

      posted_by: 0,
      status: 1,
      date_posted: '',
    }
  }
})

async function fetchAnnouncements() {
  loading.value = true
  try {
    const response = await api.get<announcementResponse[]>('/api/v1/announcements')
    announcements.value = response.data.map((a) => ({
      ...a,
      posted_date: a.date_posted ? a.date_posted.split('T')[0] : '',
    }))
  } catch (error) {
    console.error('Error fetching announcements:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
    rel="stylesheet"
  />

  <div class="announcements-view">
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
          <input type="text" placeholder="Search" />
        </div>

        <v-dialog v-model="dialog" max-width="600">
          <template v-slot:activator="{ props }">
            <button class="pill yellow" v-bind="props">
              <span class="material-symbols-outlined">add</span>
              New Announcement
            </button>
          </template>

          <v-card title="Announcement Details">
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field v-model="newAnnouncement.title" label="Title*" required />
                </v-col>

                <v-col cols="12">
                  <v-text-field v-model="newAnnouncement.content" label="Summary*" required />
                </v-col>

                <v-col cols="12">
                  <v-text-field v-model="newAnnouncement.posted_by" label="Posted By" />
                </v-col>

                <v-col cols="12">
                  <v-date-input v-model="newAnnouncement.date_posted" label="Post Date" />
                </v-col>
              </v-row>

              <small class="text-caption text-medium-emphasis"> * indicates required field </small>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-spacer />
              <v-btn variant="plain" @click="dialog = false">Close</v-btn>
              <v-btn color="primary" variant="tonal" @click="saveAnnouncement"> Save </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card blue">
        <div class="stat-left">
          <span class="material-symbols-outlined">mail</span>
          <span>Active Announcements</span>
        </div>
        <div class="count yellow">14</div>
      </div>

      <div class="stat-card blue">
        <div class="stat-left">
          <span class="material-symbols-outlined">edit</span>
          <span>Posted this week</span>
        </div>
        <div class="count yellow">09</div>
      </div>

      <div class="stat-card blue">
        <div class="stat-left">
          <span class="material-symbols-outlined">schedule</span>
          <span>Scheduled Updates</span>
        </div>
        <div class="count yellow">03</div>
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

        <div class="table-actions">
          <span class="material-symbols-outlined filter">filter_alt</span>
          <button class="export-btn">
            <span class="material-symbols-outlined">ios_share</span>
            Export
          </button>
        </div>
      </div>

      <table class="announcements-table">
        <thead>
          <tr>
            <th></th>
            <th>Announcement ID</th>
            <th>Title</th>
            <th>Summary</th>

            <th>Posted By</th>
            <th>Posted Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in filteredAnnouncements" :key="row.id">
            <td><input type="checkbox" /></td>
            <td>{{ row.id }}</td>
            <td>{{ row.title }}</td>
            <td>{{ row.content }}</td>

            <td>{{ row.full_name }}</td>
            <td>{{ row.date_posted }}</td>
            <td>
              <span class="status-pill">{{ row.status }}</span>
            </td>
            <td>
              <button class="actions-btn">
                Actions
                <span class="material-symbols-outlined">expand_more</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="show-all">Show All</div>
    </div>
  </div>
</template>

<style scoped>
.announcements-view {
  background: #eef5f9;
  padding: 24px;
  min-height: 90vh;
  font-family: Inter, sans-serif;
}

.top-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
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
  gap: 8px;
  align-items: center;
}

.search-box input {
  border: none;
  outline: none;
}

.pill {
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.pill.yellow {
  background: #ffbf00;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #0b1b5a;
  color: white;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
}

.count {
  font-size: 18px;
  font-weight: 600;
}

.count.yellow {
  background: #ffbf00;
  color: #0b1b5a;
  padding: 6px 14px;
  border-radius: 999px;
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
  gap: 28px;
}

.tab {
  background: none;
  border: none;
  padding: 12px 0;
  color: #8b8b8b;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: #0d6efd;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #0d6efd;
}

.table-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter {
  cursor: pointer;
}

.export-btn {
  background: #02833c;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 8px 16px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.announcements-table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

tbody tr {
  background: #eef5f9;
}

tbody td {
  padding: 16px 12px;
}

.status-pill {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 15px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  height: 26px;
}

.actions-btn {
  background: #0b1b5a;
  color: white;
  border-radius: 999px;
  border: none;
  padding: 10px 10px;
  font-size: 15px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

.show-all {
  text-align: right;
  color: #0d6efd;
  font-weight: 600;
  margin-top: 10px;
  cursor: pointer;
}
</style>
