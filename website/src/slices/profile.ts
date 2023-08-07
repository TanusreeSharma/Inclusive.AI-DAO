import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export interface ProfileState {
  email: string
  id: string
  name: string
  pfp: string // profile picture
  jwtToken: string
  pubKey: string
  // assigned pod
  pod: string
}

// Define the initial state using that type
const initialState: ProfileState = {
  email: '',
  id: '',
  name: '',
  pfp: '',
  jwtToken: '',
  pubKey: '',
  pod: '',
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (
      state,
      action: PayloadAction<
        Pick<ProfileState, 'email' | 'id' | 'name' | 'pfp'>
      >,
    ) => {
      state.email = action.payload.email
      state.id = action.payload.id
      state.name = action.payload.name
      state.pfp = action.payload.pfp
    },
    updateJwtToken: (state, action: PayloadAction<string>) => {
      state.jwtToken = action.payload
    },
    updatePubKey: (state, action: PayloadAction<string>) => {
      state.pubKey = action.payload
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

export const {
  updateProfile,
  updateJwtToken,
  updatePubKey,
  updateEmail,
  updateId,
  updateName,
} = profileSlice.actions

export const selectProfile = (state: RootState) => state.profile
export const selectJwtToken = (state: RootState) => state.profile.jwtToken
export const selectEmail = (state: RootState) => state.profile.email
export const selectId = (state: RootState) => state.profile.id
export const selectName = (state: RootState) => state.profile.name

export default profileSlice.reducer
