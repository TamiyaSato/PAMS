<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberProfileStore } from '@/stores/memberProfile'

const store = useMemberProfileStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchProfile()
})

const goToEdit = () => {
  router.push({ name: 'member-edit-profile' })
}
</script>

<template>
  <div class="member-profile-view">
    <p v-if="store.loading">Loading profile...</p>
    <p v-else-if="store.error" class="error">{{ store.error }}</p>
    <div v-else>
      <v-card class="pa-4" outlined>
        <v-row>
          <v-col cols="12" md="4"> </v-col>
          <v-col cols="12" md="8">
            <h2>{{ store.profile?.full_name }}</h2>
            <p><strong>Disability Type:</strong> {{ store.profile?.disability_type }}</p>
            <p><strong>Address:</strong> {{ store.profile?.address }}</p>
            <p><strong>Birthday:</strong> {{ store.profile?.date_of_birth }}</p>
            <p><strong>Gender:</strong> {{ store.profile?.gender }}</p>
            <p><strong>Contact:</strong> {{ store.profile?.contact_no }}</p>
            <p><strong>Email:</strong> {{ store.profile?.email }}</p>
            <p><strong>Status:</strong> {{ store.profile?.status }}</p>
            <p><strong>Registered:</strong> {{ store.profile?.date_registered }}</p>
            <p><strong>Age:</strong> {{ store.age }}</p>
          </v-col>
        </v-row>
        <v-btn color="primary" class="mt-4" @click="goToEdit"> Edit Profile </v-btn>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
.member-profile-view {
  max-width: 800px;
  margin: 2rem auto;
}
</style>
