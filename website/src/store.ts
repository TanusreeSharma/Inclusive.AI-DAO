import { configureStore } from '@reduxjs/toolkit'

// import appReducer from '@/slices/app'
import chatReducer from '@/slices/chat'
import groupReducer from '@/slices/group'
import profileReducer from '@/slices/profile'

const store = configureStore({
  reducer: {
    // app: appReducer,
    chat: chatReducer,
    group: groupReducer,
    profile: profileReducer,
    // survey: surveyReducer,
  },
  devTools: true,
})

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: { ...reducers }
export type AppDispatch = typeof store.dispatch