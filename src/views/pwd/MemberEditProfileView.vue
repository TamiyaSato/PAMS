<template>
  <div class="member-edit-profile">
    <p v-if="store.loading">Loading profile...</p>
    <p v-else-if="store.error" class="error">{{ store.error }}</p>
    <v-form v-else>
      <v-text-field label="Name" v-model="formData.full_name" />
      <v-text-field label="Address" v-model="formData.address" />
      <v-text-field label="Disability Type" v-model="formData.disability_type" />
      <v-text-field label="Birthday" v-model="formData.date_of_birth" type="date" />
      <v-select label="Gender" :items="['Male', 'Female']" v-model="formData.gender" />
      <v-text-field label="Contact Number" v-model="formData.contact_no" />
      <v-text-field label="Email Address" v-model="formData.email" />

      <v-btn color="warning" class="mt-4" :loading="store.loading" @click="saveProfileChanges">
        Update
      </v-btn>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberProfileStore } from '@/stores/memberProfile'
import type { MemberProfile } from '@/models/MemberProfile'

const store = useMemberProfileStore()
const router = useRouter()

const formData = ref<Partial<MemberProfile>>({})

onMounted(async () => {
  await store.fetchProfile()
})

watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      formData.value = { ...profile }
    }
  },
  { immediate: true },
)

const saveProfileChanges = async () => {
  try {
    await store.updateProfile(formData.value)
    router.push({ name: 'member-profile' })
  } catch (error) {
    console.error('Failed to update profile:', error)
  }
}
</script>

<style scoped>
.error {
  color: red;
}
.member-edit-profile {
  max-width: 600px;
  margin: 2rem auto;
}
</style>
