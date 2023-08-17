import { Box, Button, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useWeb3Auth } from '@/hooks'
import { useGetUserProfileQuery } from '@/services/user'
import { UserProfile } from '@/slices/user'

export default function AuthPage() {
  const web3Auth = useWeb3Auth()
  const router = useRouter()

  const {
    data: fetchedUserProfile,
    error: fetchErrorUserProfile,
    isLoading: isUserProfileLoading,
    isError: isUserProfileError,
  } = useGetUserProfileQuery(web3Auth.user?.appPubkey || '', {
    skip: !web3Auth.user?.appPubkey,
  })

  useEffect(() => {
    if (
      web3Auth.provider &&
      web3Auth.user &&
      (fetchedUserProfile as UserProfile)?.user?.id === web3Auth.user.email
    ) {
      router.replace('/')
    }
  }, [web3Auth, fetchedUserProfile])

  return (
    <Stack
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      pb={10}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        pb={4}
        color="rgb(80, 130, 235)"
      >
        Inclusive AI
      </Typography>
      <Button
        variant="outlined"
        size="large"
        onClick={web3Auth.login}
        sx={{ width: 200 }}
      >
        Sign Up / Sign In
      </Button>
    </Stack>
  )
}
