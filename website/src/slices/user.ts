import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import * as pt from '@/types/profile'
import type { User, UserPod } from '@/types/user'
import { ApiResponseIs, userApi } from '@/services/user'

export interface UserProfile {
  user: User
  ageRange: pt.UserProfileAgeRange
  genderIdentity: pt.UserProfileGenderIdentity
  genderIdentityOther?: string
  hasVisualImpairment: boolean
  visionLevel: pt.UserProfileVisionLevel
  ethnicBackground: pt.UserProfileEthnicBackground
  ethnicBackgroundOther?: string
  countryResideIn: string
  isEnrolledInEducation: boolean
  highestLevelEducation: pt.UserProfileEducationLevel
  employmentStatus: pt.UserProfileEmploymentStatus
  employmentStatusOther?: string
  deviceUsageFrequency: pt.UserProfileDeviceUsageFrequency
  householdIncome: pt.UserProfileHouseholdIncome
  language: pt.UserProfileLanguage
  languageOther?: string
  fromGlobalSouth: boolean
  studyHearAbout: string
}

export interface UserState {
  pod: UserPod | null
  profile: UserProfile
}

// Define the initial state using that type
const initialState: UserState = {
  pod: null,
  profile: {
    user: {
      id: '',
      name: '',
      role: 'participant',
    },
    ageRange: 'under_18',
    genderIdentity: pt.UserProfileGenderIdentity.OTHER,
    hasVisualImpairment: false,
    visionLevel: pt.UserProfileVisionLevel.NONE_ABOVE,
    ethnicBackground: pt.UserProfileEthnicBackground.OTHER,
    countryResideIn: '',
    isEnrolledInEducation: false,
    highestLevelEducation: pt.UserProfileEducationLevel.BACHELOR,
    employmentStatus: pt.UserProfileEmploymentStatus.OTHER,
    deviceUsageFrequency: pt.UserProfileDeviceUsageFrequency.FREQUENTLY,
    householdIncome: pt.UserProfileHouseholdIncome.OVER_100K,
    language: 'English',
    fromGlobalSouth: false,
    studyHearAbout: '',
  },
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUserProfile: (state, action: PayloadAction<UserProfile>) => {
      // Use spread operator to not erase any existing fields
      state.profile = {
        ...action.payload,
      }
    },
    updateUserProfileId: (state, action: PayloadAction<string>) => {
      state.profile.user.id = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.getUserProfile.matchFulfilled,
      (state, action) => {
        if ((action.payload as ApiResponseIs).is) return
        state.profile = {
          ...state.pod,
          ...(action.payload as UserProfile),
        }
      },
    )

    builder.addMatcher(
      userApi.endpoints.getUserPod.matchFulfilled,
      (state, action) => {
        if ((action.payload as ApiResponseIs).is) return
        state.pod = {
          ...state.pod,
          ...(action.payload as UserPod),
        }
      },
    )
  },
})

export const { updateUserProfile, updateUserProfileId } = userSlice.actions

export const selectUserPod = (state: RootState) => state.user.pod
export const selectUserProfile = (state: RootState) => state.user.profile
export const selectUserProfileId = (state: RootState) =>
  state.user.profile.user.id

export default userSlice.reducer
