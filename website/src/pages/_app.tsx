import { ThemeProvider } from '@mui/material/styles'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider as StoreProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import '@/styles/global.css'

import { Web3AuthProvider } from '@/components/Providers'
import { Web3AuthGatedLayout } from '@/layouts'
import store, { persistor } from '@/store'
import customTheme from '@/theme'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* viewport can't be in _document.tsx, per https://nextjs.org/docs/messages/no-document-viewport-meta */}
        <meta name="viewport" content="viewport-fit=cover" />
      </Head>
      <StoreProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={customTheme}>
            <Web3AuthProvider>
              <Web3AuthGatedLayout>
                <Component {...pageProps} />
              </Web3AuthGatedLayout>
            </Web3AuthProvider>
          </ThemeProvider>
        </PersistGate>
      </StoreProvider>
    </>
  )
}
