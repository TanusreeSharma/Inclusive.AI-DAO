import { Avatar, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState, useCallback, useEffect } from 'react'

import { ChatBox, LoadingScreen } from '@/components'
import { useAppSelector, useWeb3Auth } from '@/hooks'
import { type UserPod } from '@/types'
import { useGetUserPodQuery, useGetUserProfileQuery } from '@/services/user'
import { selectUserPod, selectUserProfile } from '@/slices/user'

export default function DiscussIndexPage() {
  const web3Auth = useWeb3Auth()
  const userPod = useAppSelector(selectUserPod)
  const userProfile = useAppSelector(selectUserProfile)

  const {
    data: fetchedUserProfile,
    error: fetchErrorUserProfile,
    isLoading: isUserProfileLoading,
    isError: isUserProfileError,
  } = useGetUserProfileQuery(web3Auth.user?.appPubkey || '', {
    skip: !web3Auth.user?.appPubkey,
  })

  const {
    data: fetchedUserPod,
    error: fetchErrorUserPod,
    isLoading: isUserPodLoading,
    isError: isUserPodError,
  } = useGetUserPodQuery(web3Auth.user?.appPubkey || '', {
    skip: !web3Auth.user?.appPubkey,
  })

  if (
    !web3Auth ||
    !web3Auth.user ||
    isUserProfileLoading ||
    isUserPodLoading ||
    !userProfile ||
    !userProfile.user ||
    !fetchedUserPod ||
    !userPod ||
    typeof (fetchedUserPod as UserPod)?.id === 'undefined' ||
    (fetchedUserPod as UserPod)?.id !== userPod.id
  ) {
    return <LoadingScreen />
  }

  return (
    <Box minHeight={550} position="relative">
      <ChatBox
        channelId={`pod-${userPod.id}`}
        web3AuthUser={web3Auth.user}
        promptSuggestions={[]}
      />
    </Box>
  )
}
