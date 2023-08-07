import { Box, Button, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'

import {
  Web3AuthProviderContext,
  Web3AuthProviderData,
} from '@/components/Providers/Web3AuthProvider'

export default function AuthPage() {
  const web3AuthContext = useContext<Web3AuthProviderData>(Web3AuthProviderContext)
  const router = useRouter()

  useEffect(() => {
    if (web3AuthContext.provider && web3AuthContext.user) {
      router.replace('/')
    }
  }, [web3AuthContext])

  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      {/* <Typography variant="h6" fontWeight="bold" pb={2}>
        Auth Page
      </Typography> */}
      <Button variant="outlined" size="large" onClick={web3AuthContext.login} sx={{ width: 200 }}>
        Sign Up / Sign In
      </Button>
    </Stack>
  )
}
