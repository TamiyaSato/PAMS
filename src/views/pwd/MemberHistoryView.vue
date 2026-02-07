<script setup lang="ts">
import { ref } from 'vue'
import catto from '../../assets/catto.jpg'

type HistoryTab = 'Application History' | 'My Documents'
const activeTab = ref<HistoryTab>('Application History')

/* --- Application History --- */
const applicationHistory = ref([
  {
    id: '#002',
    service: 'Wheelchair Distribution',
    category: 'House-to-House',
    dateApplied: '2026-01-05',
    dateUpdated: '2026-01-15',
    status: 'Released',
  },
  {
    id: '#001',
    service: 'Christmas Package',
    category: 'PWD Application',
    dateApplied: '2025-12-01',
    dateUpdated: '2025-12-20',
    status: 'Released',
  },
])

/* --- Documents --- */
type Doc = {
  name: string
  type: string
  service: string
  date: string
  previewUrl?: string
}

const documents = ref<Doc[]>([
  {
    name: 'candidate-registration.pdf',
    type: 'Candidate Registration',
    service: 'COMELEC Filing',
    date: '2026-01-10',
  },
  {
    name: 'national-id.pdf',
    type: 'National ID',
    service: 'Eyeglass Distribution',
    date: '2026-01-17',
  },
])

/* --- Preview Modal --- */
const previewDialog = ref(false)
const selectedDoc = ref<Doc | null>(null)

const openPreview = (doc: Doc) => {
  selectedDoc.value = {
    ...doc,
    previewUrl: '/mnt/data/9deb3629-9a6e-41fb-9d46-4b08684a1d6a.png',
  }
  previewDialog.value = true
}
</script>

<template>
  <v-container fluid class="member-container">
    <!-- Top Bar -->
    <div class="top-header">
      <h2>History & Documents</h2>

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

    <!-- Main Card -->
    <div class="table-card">
      <!-- Tabs -->
      <div class="table-top">
        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeTab === 'Application History' }"
            @click="activeTab = 'Application History'"
          >
            Application History
          </button>

          <button
            class="tab"
            :class="{ active: activeTab === 'My Documents' }"
            @click="activeTab = 'My Documents'"
          >
            My Documents
          </button>
        </div>
      </div>

      <v-divider class="my-4" />

      <!-- Application History -->
      <v-table v-if="activeTab === 'Application History'" class="history-table">
        <thead>
          <tr>
            <th></th>
            <th>ID No</th>
            <th>Service Name</th>
            <th>Category</th>
            <th>Date Applied</th>
            <th>Date Updated</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="app in applicationHistory" :key="app.id">
            <td>
              <div class="service-icon">
                <span class="material-symbols-outlined">assignment</span>
              </div>
            </td>
            <td>{{ app.id }}</td>
            <td>{{ app.service }}</td>
            <td>{{ app.category }}</td>
            <td>{{ app.dateApplied }}</td>
            <td>{{ app.dateUpdated }}</td>
            <td>
              <span class="status-pill released">{{ app.status }}</span>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Documents -->
      <v-table v-else class="history-table">
        <thead>
          <tr>
            <th></th>
            <th>File Name</th>
            <th>Document Type</th>
            <th>Service Name</th>
            <th>Date Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="doc in documents" :key="doc.name">
            <td>
              <div class="doc-icon">
                <span class="material-symbols-outlined">description</span>
              </div>
            </td>
            <td>{{ doc.name }}</td>
            <td>{{ doc.type }}</td>
            <td>{{ doc.service }}</td>
            <td>{{ doc.date }}</td>
            <td class="actions">
              <span class="material-symbols-outlined" @click="openPreview(doc)"> visibility </span>
              <span class="material-symbols-outlined">download</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Preview Modal -->
    <v-dialog v-model="previewDialog" max-width="520">
      <v-card class="preview-card">
        <div class="preview-header">
          <h3>{{ selectedDoc?.name }}</h3>
          <span class="material-symbols-outlined close-btn" @click="previewDialog = false">
            close
          </span>
        </div>

        <div class="preview-body">
          <img
            v-if="selectedDoc?.previewUrl"
            :src="selectedDoc.previewUrl"
            alt="Document Preview"
          />
        </div>

        <div class="preview-footer">
          <button class="download-btn">
            Download
            <span class="material-symbols-outlined">download</span>
          </button>
        </div>
      </v-card>
    </v-dialog>
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

/* Card */
.table-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  background: none;
  border: none;
  height: 44px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  position: relative;
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

/* Tables */
.history-table tbody tr {
  background: #eef5f9;
}

.history-table td {
  padding: 14px 12px;
}

.service-icon,
.doc-icon {
  background: #1e8f5a;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Status */
.status-pill {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.status-pill.released {
  background: #e5e7eb;
  color: #374151;
}

/* Actions */
.actions {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

/* Export */
.export-btn {
  background: #1e8f5a;
  color: white;
  border-radius: 999px;
  padding: 8px 16px;
  border: none;
  display: flex;
  gap: 6px;
}

/* Preview Modal */
.preview-card {
  border-radius: 16px;
  padding: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  cursor: pointer;
}

.preview-body {
  background: #f3f4f6;
  margin: 16px 0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: center;
}

.preview-body img {
  max-width: 100%;
  border-radius: 8px;
}

.preview-footer {
  display: flex;
  justify-content: center;
}

.download-btn {
  background: #facc15;
  border: none;
  border-radius: 999px;
  padding: 10px 20px;
  font-weight: 600;
  display: flex;
  gap: 8px;
  cursor: pointer;
}
</style>
