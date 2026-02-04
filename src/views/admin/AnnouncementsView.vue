<script setup lang="ts">
import api from '@/api/axios'
import { onMounted, ref, computed, watch } from 'vue'
import type { announcementResponse } from '@/models/announcementResponse'

const dialog = ref(false)
const tabs = ['All Announcements', 'Posted', 'Scheduled', 'Draft', 'Archived']
const activeTab = ref('All Announcements')

type announcementWithActions = announcementResponse & { showActions: boolean }

const announcements = ref<announcementWithActions[]>([])
const loading = ref(false)

function getStatus(a: announcementWithActions) {
  return a.active ?? a.status ?? 0
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
      showActions: false,
    }))
  } catch (error) {
    console.error('Error fetching announcements:', error)
  } finally {
    loading.value = false
  }
}

async function updateAnnouncementStatus(id: number, status: number) {
  try {
    await api.put(`/api/v1/announcements/${id}`, { status })
    await fetchAnnouncements()
  } catch (error) {
    console.error('Failed to update announcement status:', error)
  }
}

onMounted(() => fetchAnnouncements())
</script>

<template>
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
              <v-text-field v-model="newAnnouncement.title" label="Title*" required />
              <v-text-field v-model="newAnnouncement.content" label="Summary*" required />
              <v-text-field v-model="newAnnouncement.posted_by" label="Posted By" />
              <v-text-field v-model="newAnnouncement.category" label="Category" />
              <v-date-input v-model="newAnnouncement.date_posted" label="Post Date" />
            </v-card-text>
            <v-card-actions>
              <v-btn @click="dialog = false">Close</v-btn>
              <v-btn color="primary" @click="saveAnnouncement">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
              <v-menu v-model="row.showActions" offset-y>
                <template v-slot:activator="{ props: activatorProps }">
                  <button class="actions-btn" v-bind="activatorProps">
                    Actions
                    <span class="material-symbols-outlined">expand_more</span>
                  </button>
                </template>

                <v-list>
                  <v-list-item @click="updateAnnouncementStatus(row.id!, 1)">
                    <v-list-item-title>Post</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="updateAnnouncementStatus(row.id!, 2)">
                    <v-list-item-title>Schedule</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="updateAnnouncementStatus(row.id!, 3)">
                    <v-list-item-title>Draft</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="updateAnnouncementStatus(row.id!, 4)">
                    <v-list-item-title>Archive</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </table>
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
  cursor: pointer;
}

.actions-menu {
  position: absolute;
  top: 30px;
  right: 0;
  display: flex;
  flex-direction: column;
  min-width: 120px;
  background: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  z-index: 20;
}

.actions-menu button {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
}

.actions-menu button:hover {
  background: #eef5f9;
}

.show-all {
  text-align: right;
  color: #0d6efd;
  font-weight: 600;
  margin-top: 10px;
  cursor: pointer;
}
</style>
