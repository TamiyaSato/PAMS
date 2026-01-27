export interface Appointment {
  id: string
  person_id: number
  applicant_name: string
  service_id: number
  service_name: string
  preferred_date: string
  time_start: string
  time_end: string
  assigned_staff: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  created_at: string
}
