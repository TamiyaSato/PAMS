import { defineStore } from 'pinia'
import type { MemberProfile } from '@/models/MemberProfile'

const mockProfileData: MemberProfile = {
  id: 1001,
  full_name: 'Maria Santos',
  date_of_birth: '1990-03-12',
  gender: 'Female',
  disability_type: 'Visual Impairment',
  address: 'Purok 2',
  contact_no: '09123456781',
  status: 'Active',
  date_registered: '2019-03-12',
  email: 'maria.santos@email.com',
}

export const useMemberProfileStore = defineStore('memberProfile', {
  state: () => ({
    profile: null as MemberProfile | null,
    loading: false,
    error: '' as string,
  }),

  getters: {
    age: (state) => {
      if (!state.profile) return null
      const birthDate = new Date(state.profile.date_of_birth)
      const diff = Date.now() - birthDate.getTime()
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    },

    avatarUrl: (state) => state.profile?.avatar || '/default-avatar.png',
  },

  actions: {
    async fetchProfile() {
      this.loading = true
      this.error = ''
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Assign mock data
        this.profile = mockProfileData
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.error = err.message
        } else if (typeof err === 'string') {
          this.error = err
        } else {
          this.error = 'An unknown error occurred'
        }
      } finally {
        this.loading = false
      }
    },

    async updateProfile(payload: Partial<MemberProfile>) {
      if (!this.profile) {
        this.error = 'No profile loaded to update'
        return
      }

      this.loading = true
      this.error = ''

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Update mock locally
        Object.assign(this.profile, payload)
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.error = err.message
        } else if (typeof err === 'string') {
          this.error = err
        } else {
          this.error = 'Failed to update profile'
        }
      } finally {
        this.loading = false
      }
    },
  },
})
