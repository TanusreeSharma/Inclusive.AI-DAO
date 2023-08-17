import { User } from '@/database/entity'
import {
  ProfileAgeRange,
  ProfileGenderIdentity,
  ProfileVisionLevel,
  ProfileEthnicBackground,
  ProfileEducationLevel,
  ProfileEmploymentStatus,
  ProfileDeviceUsageFrequency,
  ProfileHouseholdIncome,
  ProfileLanguage
} from '@/database/entity-types'

export type GptChatDialogue = {
  role: 'user' | 'system' | 'assistant'
  content: string
}

export type CreateUserProfileParams = {
  user: User
  ageRange: ProfileAgeRange
  genderIdentity: ProfileGenderIdentity
  genderIdentityOther: string
  hasVisualImpairment: boolean
  visionLevel: ProfileVisionLevel
  ethnicBackground: ProfileEthnicBackground
  ethnicBackgroundOther: string
  countryResideIn: string
  isEnrolledInEducation: boolean
  highestLevelEducation: ProfileEducationLevel
  employmentStatus: ProfileEmploymentStatus
  employmentStatusOther: string
  deviceUsageFrequency: ProfileDeviceUsageFrequency
  householdIncome: ProfileHouseholdIncome
  language: ProfileLanguage
  languageOther: string
  fromGlobalSouth: boolean
  studyHearAbout: string
}
