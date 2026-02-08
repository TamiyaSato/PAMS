<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'
import type { announcementResponse } from '@/models/announcementResponse'

type AnnouncementTab = 'All Updates' | 'Services' | 'Community News' | 'Urgent Alerts'

const activeTab = ref<AnnouncementTab>('All Updates')
const loading = ref(false)
const announcements = ref<announcementResponse[]>([])

const filteredAnnouncements = computed(() => {
  switch (activeTab.value) {
    case 'Urgent Alerts':
      return announcements.value.filter((a) => a.category === 1)
    case 'Community News':
      return announcements.value.filter((a) => a.category === 2)
    case 'Services':
      return announcements.value.filter((a) => a.category === 3)
    case 'All Updates':
    default:
      return announcements.value
  }
})

async function fetchAnnouncements() {
  loading.value = true
  try {
    const response = await api.get<announcementResponse[]>('/api/v1/announcements?status=1')
    announcements.value = response.data.map((a) => ({
      ...a,
      date_posted: a.date_posted ? a.date_posted.split('T')[0] : '',
    }))
  } catch (error) {
    console.error('Error fetching announcements:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchAnnouncements())
</script>

<template>
  <v-container fluid class="member-container">
    <div class="top-header">
      <h2>Announcements</h2>

      <div class="top-actions"></div>
    </div>

    <div class="table-card">
      <div class="tabs">
        <button
          v-for="tab in ['All Updates', 'Services', 'Community News', 'Urgent Alerts']"
          :key="tab"
          class="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab as AnnouncementTab"
        >
          {{ tab }}
        </button>
      </div>

      <v-divider class="my-4" />

      <div
        class="announcement-card"
        v-for="announcement in filteredAnnouncements"
        :key="announcement.id"
      >
        <div class="urgent-pill" v-if="announcement.category === 1">Urgent</div>

        <div class="announcement-content">
          <h4>{{ announcement.title }}</h4>

          <p class="meta">Posted: {{ announcement.date_posted }}</p>

          <p class="description">
            {{ announcement.content }}
          </p>
        </div>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.member-container {
  background: #f4f8fb;
  min-height: 90vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: #eef3f7;
  padding: 6px 12px;
  border-radius: 999px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
}

.icon-btn {
  background: #eef3f7;
  padding: 8px;
  border-radius: 50%;
}

.table-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 32px;
  align-items: flex-end;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  background: none;
  border: none;
  height: 44px;
  padding: 0;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
}

.tab.active {
  color: #2563eb;
  font-weight: 600;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2563eb;
}

.announcement-card {
  background: #c7ddf0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}

.urgent-pill {
  background: #dc2626;
  color: white;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12px;
  height: fit-content;
}

.announcement-content h4 {
  margin: 0;
}

.meta {
  font-size: 13px;
  margin: 6px 0;
}

.description {
  font-size: 14px;
}

.read-more {
  cursor: pointer;
}

.empty-space {
  height: 260px;
  background: #eef3f7;
  border-radius: 12px;
  margin-top: 16px;
}
</style>
