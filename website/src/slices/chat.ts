import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import type { GptChatDialogue } from '@/types'

export interface ChatState {
  history: Record<string, GptChatDialogue[]> // mapping of channel => messages history
}

// Define the initial state using that type
const initialState: ChatState = {
  history: {},
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state, action: PayloadAction<string>) => {
      if (action.payload in state.history) state.history[action.payload] = []
    },
    addMessages: (
      state,
      action: PayloadAction<{
        channel: string | undefined
        messages: GptChatDialogue[]
      }>,
    ) => {
      // MessageEvent<any>.data
      if (!action.payload.channel) return

      // Initialize history for channel if it doesn't exist
      if (!state.history) state.history = {}
      if (!state.history[action.payload.channel]) state.history[action.payload.channel] = []
      // Add message to history
      state.history[action.payload.channel] = state.history[
        action.payload.channel
      ].concat(action.payload.messages)
    },
  },
})

export const { addMessages, clearMessages } = chatSlice.actions

export const selectMessageHistory =
  (channel: string | undefined) => (state: RootState) =>
    channel && state.chat.history
      ? state.chat.history[channel] ?? []
      : []

export default chatSlice.reducer
