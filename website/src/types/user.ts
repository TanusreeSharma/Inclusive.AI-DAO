import { ValueQuestion } from './pod'

export type UserRole = 'admin' | 'observer' | 'participant'

export type User = {
  id: string
  name: string
  role: UserRole
}

export type UserPod = {
  createdAt: string
  id: number
  isActive: boolean
  name: string
  slug: string
  valueQuestion: ValueQuestion[]
}
