import { Button, Stack, Typography } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { redirect } from 'next/navigation'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import { Provider as StoreProvider } from 'react-redux'

import '@/styles/global.css'

import Web3AuthProvider, {
  Web3AuthProviderContext,
  Web3AuthProviderData,
  Web3AuthStatus,
} from '@/components/Providers/Web3AuthProvider'
import Topbar from '@/components/Topbar'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { BodyLayout, MainLayout } from '@/layouts'
import { selectProfile, updateJwtToken, updateProfile } from '@/slices/profile'
import store from '@/store'
import customTheme from '@/theme'

const inter = Inter({ subsets: ['latin'] })

function Web3AuthGatedLayout({ children }: React.PropsWithChildren) {
  const dispatch = useAppDispatch()
  const web3AuthContext = useContext<Web3AuthProviderData>(
    Web3AuthProviderContext,
  )
  const router = useRouter()
  const userProfile = useAppSelector(selectProfile)

  useEffect(() => {
    // const notUninitiated = web3AuthContext.status !== Web3AuthStatus.UNINITIATED
    const notConnecting = web3AuthContext.status !== Web3AuthStatus.CONNECTING

    if (
      (!web3AuthContext.provider || !web3AuthContext.user) &&
      (notConnecting)
    ) {
      if (router.pathname !== '/auth') {
        router.replace('/auth')
      }
    }

    if (web3AuthContext.provider && web3AuthContext.user && !userProfile.email) {
      dispatch(updateProfile({
        email: web3AuthContext.user.email || '',
        id: web3AuthContext.user.verifierId || '',
        name: web3AuthContext.user.name || '',
      }))
      dispatch(updateJwtToken(web3AuthContext.user.oAuthAccessToken || web3AuthContext.user.idToken || ''))
    }
  }, [web3AuthContext, userProfile])

  if (web3AuthContext.status === Web3AuthStatus.UNINITIATED) {
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

  if (web3AuthContext.status === Web3AuthStatus.CONNECTING) {
    return (
      <Stack
        height="100%"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" fontWeight="bold" color="rgb(80, 130, 235)">
          Loading...
        </Typography>
      </Stack>
    )
  }

  return <>{children}</>
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider store={store}>
      <ThemeProvider theme={customTheme}>
        <Web3AuthProvider>
          <MainLayout className={inter.className}>
            <Web3AuthGatedLayout>
              <Topbar />
              <BodyLayout>
                <Component {...pageProps} />
              </BodyLayout>
            </Web3AuthGatedLayout>
          </MainLayout>
        </Web3AuthProvider>
      </ThemeProvider>
    </StoreProvider>
  )
}
