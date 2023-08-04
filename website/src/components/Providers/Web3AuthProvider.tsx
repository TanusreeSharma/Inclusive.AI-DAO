import {
  ADAPTER_EVENTS,
  CONNECTED_EVENT_DATA,
  SafeEventEmitterProvider,
  UserInfo,
} from '@web3auth/base'
import { Web3Auth } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { LOGIN_MODAL_EVENTS } from '@web3auth/ui'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  initModalConfig,
  openloginAdapterConfig,
  web3AuthConfig,
} from '@/config/web3auth'

export enum Web3AuthStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERRORED = 'ERRORED',
  UNINITIATED = 'UNINITIATED',
}

export interface Web3AuthProviderData {
  web3auth: Web3Auth | undefined
  provider: SafeEventEmitterProvider | undefined
  providerData: CONNECTED_EVENT_DATA | undefined
  user: Partial<UserInfo> | undefined
  status: Web3AuthStatus
  onSuccessfulLogin: (
    web3auth: Web3Auth,
    data: CONNECTED_EVENT_DATA,
    user: any,
  ) => void
  login: () => void
  logout: () => void
}

export const Web3AuthProviderContext = React.createContext<Web3AuthProviderData>({
  web3auth: undefined,
  provider: undefined,
  providerData: undefined,
  user: undefined,
  status: Web3AuthStatus.UNINITIATED,
  onSuccessfulLogin: (
    web3auth: Web3Auth,
    data: CONNECTED_EVENT_DATA,
    user: Partial<UserInfo>,
  ) => {},
  login: () => {},
  logout: () => {},
})

export default function Web3AuthProvider({ children }: React.PropsWithChildren) {
  const [provider, setProvider] = useState<
    SafeEventEmitterProvider | undefined
  >(undefined)
  const [providerData, setProviderData] = useState<
    CONNECTED_EVENT_DATA | undefined
  >(undefined)
  const [user, setUser] = useState<Partial<UserInfo> | undefined>(undefined)
  const [web3auth, setWeb3Auth] = useState<Web3Auth | undefined>(undefined)
  const [status, setStatus] = useState<Web3AuthStatus>(Web3AuthStatus.UNINITIATED)

  const onSuccessfulLogin = useCallback(
    (
      web3auth: Web3Auth,
      data: CONNECTED_EVENT_DATA,
      user: Partial<UserInfo>,
    ) => {
      // console.log('onSuccessfulLogin', data, user)
      setProviderData(data)
      web3auth.connect().then((provider) => {
        setProvider(provider || undefined)
      })
      console.log(user)
      setUser(user)
    },
    [],
  )

  const login = useCallback(() => {
    console.log(web3auth)
    if (!web3auth) return
    web3auth
      .connect()
      .then((data) => {
        console.log('Login successful!')
        console.log(data)
      })
      .catch((err) => {
        console.error('Login failed!')
        console.error(err)
      })
  }, [web3auth])

  const logout = useCallback(() => {
    if (!web3auth) return
    web3auth
      .logout()
      .then(() => {
        console.log('Logout successful!')
      })
      .catch((err) => {
        console.error('Logout failed!')
        console.error(err)
      })
  }, [web3auth])

  const subscribeAuthEvents = useCallback(
    (web3auth: Web3Auth) => {
      if (!web3auth) return

      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: CONNECTED_EVENT_DATA) => {
        // console.log('Yeah!, you are successfully logged in', data)
        console.log('connected')
        setStatus(Web3AuthStatus.CONNECTED)
        web3auth
          .getUserInfo()
          .then((user) => onSuccessfulLogin(web3auth, data, user))
      })

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log('connecting')
        setStatus(Web3AuthStatus.CONNECTING)
      })

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log('disconnected')
        setStatus(Web3AuthStatus.DISCONNECTED)
        setUser(undefined)
        setProvider(undefined)
      })

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        setStatus(Web3AuthStatus.ERRORED)
        console.log('some error or user have cancelled login request', error)
      })

      web3auth.on(LOGIN_MODAL_EVENTS.MODAL_VISIBILITY, (isVisible) => {
        console.log('modal visibility', isVisible)
      })
    },
    [onSuccessfulLogin],
  )

  //
  // Initialize Web3Auth
  //
  useEffect(() => {
    // console.log(web3AuthConfig)
    if (!web3AuthConfig || !web3AuthConfig.clientId) return

    const newWeb3auth = new Web3Auth(web3AuthConfig)
    newWeb3auth.configureAdapter(new OpenloginAdapter(openloginAdapterConfig))

    setWeb3Auth(newWeb3auth)
    subscribeAuthEvents(newWeb3auth)

    newWeb3auth.initModal(initModalConfig).catch((err) => {
      console.error(err)
    })
  }, [subscribeAuthEvents])

  const ctx: Web3AuthProviderData = useMemo(
    () => ({
      web3auth,
      provider,
      providerData,
      user,
      status,
      onSuccessfulLogin,
      login,
      logout,
    }),
    [login, logout, onSuccessfulLogin, provider, providerData, status, user, web3auth],
  )

  return (
    <Web3AuthProviderContext.Provider value={ctx}>
      {children}
    </Web3AuthProviderContext.Provider>
  )
}

export const Web3AuthConsumer = Web3AuthProviderContext.Consumer
