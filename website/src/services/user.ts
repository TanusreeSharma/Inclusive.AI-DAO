import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { HYDRATE } from 'next-redux-wrapper'

import { baseQuery } from '@/services'
import { type UserProfile } from '@/slices/user'
import { UserPod } from '@/types'

export type ApiResponseIs = { is: 'not found' | 'errored' | 'does not exist' }

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  refetchOnMountOrArgChange: 30,
  //
  // Note: Do not rehydrate the userApi slice reducer. This will cause the api cache to be restored, which might be
  // stuck when fetching state.
  //
  // `extractRehydrationInfo`: https://redux-toolkit.js.org/rtk-query/usage/server-side-rendering#server-side-rendering-with-nextjs
  // extractRehydrationInfo(action, { reducerPath }) {
  //   if (action.type === HYDRATE) {
  //     return action.payload[reducerPath]
  //   }
  // },
  endpoints: (builder) => ({
    getUserPod: builder.query<
      UserPod | ApiResponseIs,
      string // appPubkey
    >({
      query: (appPubkey: string) => ({
        url: 'user/pod',
        params: { appPubkey },
      }),
    }),

    getUserProfile: builder.query<
      UserProfile | ApiResponseIs,
      string // appPubkey
    >({
      // user is auto-inferred using JWT token in headers
      query: (appPubkey: string) => ({
        url: 'user/profile',
        params: { appPubkey },
      }),
    }),

    postUserRegister: builder.mutation({
      query: (body: { appPubkey: string; name: string; role: string }) => ({
        url: 'user/register',
        method: 'POST',
        body,
      }),
    }),

    postUserProfile: builder.mutation({
      query: (
        body: Omit<UserProfile, 'user'> & {
          userId: string
          appPubkey: string
        },
      ) => ({
        url: 'user/profile',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetUserPodQuery,
  useGetUserProfileQuery,
  usePostUserRegisterMutation,
  usePostUserProfileMutation,
} = userApi
