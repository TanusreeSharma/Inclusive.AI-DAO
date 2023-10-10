import { User } from '@/database/entity'
import {
  ProfileAgeRange,
  ProfileGenderIdentity,
  ProfileEthnicBackground,
  ProfileEducationLevel,
  ProfileEmploymentStatus,
  ProfileDeviceUsageFrequency,
  ProfileHouseholdIncome,
  ProfilePrimaryLanguage
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
  ethnicBackground: ProfileEthnicBackground
  ethnicBackgroundOther: string
  countryResideIn: string
  isEnrolledInEducation: boolean
  highestLevelEducation: ProfileEducationLevel
  employmentStatus: ProfileEmploymentStatus
  employmentStatusOther: string
  deviceUsageFrequency: ProfileDeviceUsageFrequency
  householdIncome: ProfileHouseholdIncome
  primaryLanguage: ProfilePrimaryLanguage
  primaryLanguageOther: string
  fromGlobalSouth: boolean
  studyHear: string
}

// ProposalType: 'single-choice' | 'approval' | 'quadratic' | 'ranked-choice' | 'weighted' | 'basic'
export type SnapshotSupportedTypes = 'quadratic' | 'weighted' | 'ranked-choice'

export type SnapshotProposal = {
  id: string
  title: string
  type: string
  symbol: string
  body: string
  choices: string[]
  created: number // timestamp
  start: number // timestamp
  end: number // timestamp
  snapshot: string
  state: string
  author: string
  space: {
    id: string
    name: string
  }
  votes: number
  quorum: number
  scores: number[]
  scores_state: string
  scores_total: number
  scores_updated: number
}