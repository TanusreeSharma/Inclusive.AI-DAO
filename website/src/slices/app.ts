import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// import {
//   Web3AuthStatus,
//   type CacheableWeb3AuthProviderData,
// } from '@/components/Providers'
import type { RootState } from '@/store'

export interface AppState {
  // web3AuthCache: CacheableWeb3AuthProviderData
  user: {
    jwtToken: string
  }
}

const initialState: AppState = {
  // web3AuthCache: {
  //   provider: undefined,
  //   user: undefined,
  // },
  user: {
    jwtToken: '',
  },
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // setWeb3AuthCache: (
    //   state,
    //   action: PayloadAction<CacheableWeb3AuthProviderData>,
    // ) => {
    //   state.web3AuthCache = action.payload
    // },
    // unsetWeb3AuthCache: (state) => {
    //   state.web3AuthCache = initialState.web3AuthCache
    // },
    setUserJwtToken: (state, action: PayloadAction<string>) => {
      state.user.jwtToken = action.payload
    }
  },
})

// export const { setWeb3AuthCache, unsetWeb3AuthCache } = appSlice.actions
export const { setUserJwtToken } = appSlice.actions

// export const selectWeb3AuthCache = (state: RootState) => state.app.web3AuthCache
export const selectUserJwtToken = (state: RootState) => state.app.user.jwtToken

export default appSlice.reducer
