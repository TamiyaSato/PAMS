import { defineStore } from 'pinia'
import type { MemberProfile } from '@/models/MemberProfile'
import api from '@/api/axios'

export const useMemberProfileStore = defineStore('memberProfile', {
  state: () => ({
    profile: null as MemberProfile | null,
    loading: false,
    error: '' as string,
  }),

  getters: {
    age: (state) => {
      if (!state.profile || !state.profile.date_of_birth) return null

      const dateString = state.profile.date_of_birth.split('T')[0]
      const [year, month, day] = dateString!.split('-').map(Number)
      if (isNaN(year!) || isNaN(month!) || isNaN(day!)) return null

      const today = new Date()
      let age = today.getFullYear() - year!
      if (
        today.getMonth() + 1 < month! ||
        (today.getMonth() + 1 === month && today.getDate() < day!)
      ) {
        age--
      }
      return age
    },

    avatarUrl: (state) => state.profile?.avatar || '/default-avatar.png',
  },

  actions: {
    async fetchProfile() {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.get('/api/v1/persons/me')

        // Map API response to MemberProfile shape
        this.profile = {
          id: data.id,
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          disability_type: data.disability_type,
          address: data.address,
          contact_no: data.contact_no,
          status:
            typeof data.status === 'number'
              ? data.status === 1
                ? 'Active'
                : 'Inactive'
              : String(data.status),
          date_registered: data.date_registered,
          email: data.email,
          avatar: undefined,
        }
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
      this.loading = true
      this.error = ''

      try {
        const body = {
          id: payload.id ?? this.profile?.id,
          full_name: payload.full_name ?? this.profile?.full_name,
          date_of_birth: payload.date_of_birth ?? this.profile?.date_of_birth,
          gender: payload.gender ?? this.profile?.gender,
          disability_type: payload.disability_type ?? this.profile?.disability_type,
          address: payload.address ?? this.profile?.address,
          contact_no: payload.contact_no ?? this.profile?.contact_no,
          email: payload.email ?? this.profile?.email,
        }

        const { data } = await api.put('/api/v1/persons/me', body)

        // Refresh local profile from API response
        this.profile = {
          id: data.id,
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          disability_type: data.disability_type,
          address: data.address,
          contact_no: data.contact_no,
          status:
            typeof data.status === 'number'
              ? data.status === 1
                ? 'Active'
                : 'Inactive'
              : String(data.status),
          date_registered: data.date_registered,
          email: data.email,
          avatar: this.profile?.avatar,
        }
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
