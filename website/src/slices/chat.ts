import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

export interface ChatState {
  self: {
    messageHistory: string[]
  }
}

// Define the initial state using that type
const initialState: ChatState = {
  self: {
    messageHistory: [],
  },
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearSelfMessageHistory: (state) => {
      state.self.messageHistory = []
    },
    addSelfMessageHistory: (state, action: PayloadAction<string>) => { // MessageEvent<any>.data
      state.self.messageHistory.push(action.payload)
    },
  },
})

export const { addSelfMessageHistory, clearSelfMessageHistory } =
  chatSlice.actions

export const selectSelfMessageHistory = (state: RootState) =>
  state.chat.self.messageHistory

export default chatSlice.reducer
