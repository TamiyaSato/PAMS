<script setup lang="ts">
import api from '@/api/axios'
import { onMounted, ref, computed, watch } from 'vue'
import type { serviceResponse } from '@/models/serviceResponse'
import TableLoading from '@/components/TableLoading.vue'

type serviceWithActions = serviceResponse & { showActions: boolean }

const tabs = ['All', 'Active', 'Drafts', 'Archived']
const activeTab = ref('All')
const services = ref<serviceWithActions[]>([])
const loading = ref(false)
const searchQuery = ref('')

const newDialog = ref(false)
const editDialog = ref(false)
const newService = ref<Partial<serviceWithActions>>({
  name: '',
  description: '',
  requirements: '',
  category: '',
  active: 1,
  date_created: '',
})
const editServiceData = ref<Partial<serviceWithActions>>({})

function getStatus(s: serviceWithActions) {
  return s.active ?? 0
}

const filteredServices = computed(() => {
  let list = services.value

  if (activeTab.value === 'Active') list = list.filter((s) => getStatus(s) === 1)
  else if (activeTab.value === 'Drafts') list = list.filter((s) => getStatus(s) === 2)
  else if (activeTab.value === 'Archived') list = list.filter((s) => getStatus(s) === 3)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q),
    )
  }

  return list
})

async function fetchServices() {
  loading.value = true
  try {
    const response = await api.get<serviceResponse[]>('/api/v1/service-types')
    services.value = response.data.map((service) => ({
      ...service,
      date_created: service.date_created ? service.date_created.split('T')[0] : '',
      showActions: false,
    })) as serviceWithActions[]
  } catch (error) {
    console.error('Error fetching services:', error)
  } finally {
    loading.value = false
  }
}

async function saveNewService() {
  try {
    const payload: unknown = {
      name: newService.value.name,
      description: newService.value.description,
      requirements: newService.value.requirements,
      category: newService.value.category,
      active: newService.value.active,
      date_created: newService.value.date_created
        ? new Date(newService.value.date_created).toISOString().split('T')[0]
        : '',
    }
    await api.post('/api/v1/service-types', payload)
    newDialog.value = false
    await fetchServices()
    newService.value = {
      name: '',
      description: '',
      requirements: '',
      category: '',
      active: 1,
      date_created: '',
    }
  } catch (error) {
    console.error('Error saving service:', error)
  }
}

function editServiceAction(service: serviceWithActions) {
  editServiceData.value = { ...service }
  editDialog.value = true
}

async function saveEditService() {
  if (!editServiceData.value.id) return
  try {
    const payload: unknown = {
      name: editServiceData.value.name,
      description: editServiceData.value.description,
      requirements: editServiceData.value.requirements,
      category: editServiceData.value.category,
      active: editServiceData.value.active,
      date_created: editServiceData.value.date_created
        ? new Date(editServiceData.value.date_created).toISOString().split('T')[0]
        : '',
    }
    await api.put(`/api/v1/service-types/${editServiceData.value.id}`, payload)
    editDialog.value = false
    await fetchServices()
  } catch (error) {
    console.error('Error editing service:', error)
  }
}

async function archiveService(service: serviceWithActions) {
  try {
    await api.patch(`/api/v1/service-types/${service.id}`, { active: 3 })
    await fetchServices()
  } catch (error) {
    console.error('Error archiving service:', error)
  }
}

async function deleteService(service: serviceWithActions) {
  try {
    await api.delete(`/api/v1/service-types/${service.id}`)
    await fetchServices()
  } catch (error) {
    console.error('Error deleting service:', error)
  }
}

watch(newDialog, (val) => {
  if (val)
    newService.value = {
      name: '',
      description: '',
      requirements: '',
      category: '',
      active: 1,
      date_created: '',
    }
})

onMounted(() => fetchServices())
</script>

<template>
  <v-container fluid class="admin-container">
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
          <input type="text" placeholder="Search services" v-model="searchQuery" />
        </div>

        <v-dialog v-model="newDialog" max-width="600">
          <template v-slot:activator="{ props: activatorProps }">
            <button class="pill yellow" v-bind="activatorProps">
              <span class="material-symbols-outlined">add</span>
              New Service
            </button>
          </template>
          <v-card title="New Service">
            <v-card-text>
              <v-text-field v-model="newService.name" label="Service Name*" required />
              <v-text-field v-model="newService.description" label="Description*" required />
              <v-autocomplete
                v-model="newService.category"
                :items="['Financial', 'Goods', 'Training', 'Medical']"
                label="Category"
              />
              <v-text-field v-model="newService.requirements" label="Requirements*" required />
              <v-date-input v-model="newService.date_created" label="Cut-Off Date" />
            </v-card-text>
            <v-card-actions>
              <v-btn @click="newDialog = false">Close</v-btn>
              <v-btn color="primary" @click="saveNewService">Save</v-btn>
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

      <TableLoading :loading="loading" message="Loading services..." height="620px">
        <v-table class="services-table" height="620px" fixed-header>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Requirements</th>
              <th>Cut-Off</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in filteredServices" :key="service.id">
              <td><input type="checkbox" /></td>
              <td>{{ service.id }}</td>
              <td>{{ service.name }}</td>
              <td>{{ service.description }}</td>
              <td>{{ service.category }}</td>
              <td>{{ service.requirements }}</td>
              <td>{{ service.date_created }}</td>
              <td>
                <v-menu v-model="service.showActions" offset-y>
                  <template v-slot:activator="{ props: activatorProps }">
                    <button class="actions-btn" v-bind="activatorProps">
                      Actions
                      <span class="material-symbols-outlined">expand_more</span>
                    </button>
                  </template>
                  <v-list>
                    <v-list-item @click="editServiceAction(service)">
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="archiveService(service)">
                      <v-list-item-title>Archive</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteService(service)">
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>
      </TableLoading>
    </div>

    <v-dialog v-model="editDialog" max-width="600">
      <v-card title="Edit Service">
        <v-card-text>
          <v-text-field v-model="editServiceData.name" label="Service Name*" required />
          <v-text-field v-model="editServiceData.description" label="Description*" required />
          <v-autocomplete
            v-model="editServiceData.category"
            :items="['Financial', 'Goods', 'Training', 'Medical']"
            label="Category"
          />
          <v-text-field v-model="editServiceData.requirements" label="Requirements*" required />
          <v-date-input v-model="editServiceData.date_created" label="Cut-Off Date" />
        </v-card-text>
        <v-card-actions>
          <v-btn @click="editDialog = false">Close</v-btn>
          <v-btn color="primary" @click="saveEditService">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
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
  content: '';
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

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 500,
    'opsz' 24;
}
</style>
