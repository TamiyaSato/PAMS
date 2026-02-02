export interface serviceResponse {
  id: number
  name: string
  description: string
  requirements: string
  category: string
  active: number
  date_created: string
}

export interface applicationResponse {
  id: number
  name: string
  description: string
  requirements: string
  category: string
  applicant_name: string
  date_created: string
  active: number
  status: number
}
