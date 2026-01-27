<script setup lang="ts">
import { ref } from 'vue'
import catto from '../../assets/catto.jpg'

type AnnouncementTab = 'All Updates' | 'Services' | 'Community News' | 'Urgent Alerts'

const activeTab = ref<AnnouncementTab>('All Updates')
</script>

<template>
  <v-container fluid class="member-container">
    <!-- Top Bar -->
    <div class="top-bar">
      <h2>Announcements</h2>

      <div class="top-actions">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search for something" />
        </div>

        <span class="material-symbols-outlined icon-btn">settings</span>
        <span class="material-symbols-outlined icon-btn">notifications</span>

        <v-avatar size="30">
          <img :src="catto" />
        </v-avatar>
      </div>
    </div>

    <!-- Content Card -->
    <div class="table-card">
      <!-- Tabs -->
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

      <!-- Announcement -->
      <div class="announcement-card">
        <span class="urgent-pill">Urgent</span>

        <div class="announcement-content">
          <h4>Barangay Hall Closed For Renovation</h4>

          <p class="meta">
            Posted: January 22, 2026<br />
            Category: Urgent Alert
          </p>

          <p class="description">
            Please be advised that the Barangay Hall will be temporarily closed starting February
            15, 2026 until March 15, 2026 due to scheduled renovation works aimed at improving
            facilities and accessibility for all residents.
            <strong class="read-more">[READ FULL ANNOUNCEMENT]</strong>
          </p>
        </div>
      </div>

      <!-- Empty space like screenshot -->
      <div class="empty-space" />
    </div>
  </v-container>
</template>

<style scoped>
.member-container {
  background: #f4f8fb;
  min-height: 90vh;
}

/* Top Bar */
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

/* Main Card */
.table-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
}

/* Tabs (same as base) */
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

/* Announcement */
.announcement-card {
  background: #c7ddf0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 14px;
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

/* Empty area (matches screenshot) */
.empty-space {
  height: 260px;
  background: #eef3f7;
  border-radius: 12px;
  margin-top: 16px;
}
</style>
