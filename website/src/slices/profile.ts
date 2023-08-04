import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export interface ProfileState {
  email: string
  id: string
  name: string
  jwtToken: string
  // assigned pod
  pod: string
}

// Define the initial state using that type
const initialState: ProfileState = {
  email: '',
  id: '',
  name: '',
  jwtToken: '',
  pod: '',
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Pick<ProfileState, 'email' | 'id' | 'name'>>) => {
      state.email = action.payload.email
      state.id = action.payload.id
      state.name = action.payload.name
    },
    updateJwtToken: (state, action: PayloadAction<string>) => {
      state.jwtToken = action.payload
    },
    updateEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    updateId: (state, action: PayloadAction<string>) => {
      state.id = action.payload
    },
    updateName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
  },
})

export const { updateProfile, updateJwtToken, updateEmail, updateId, updateName } = profileSlice.actions

export const selectProfile = (state: RootState) => state.profile
export const selectJwtToken = (state: RootState) => state.profile.jwtToken
export const selectEmail = (state: RootState) => state.profile.email
export const selectId = (state: RootState) => state.profile.id
export const selectName = (state: RootState) => state.profile.name

export default profileSlice.reducer