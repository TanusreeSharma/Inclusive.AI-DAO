import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { LoadingScreen, Topbar } from '@/components'
import { Web3AuthProviderData, Web3AuthStatus } from '@/components/Providers'
import { useAppSelector, useWeb3Auth } from '@/hooks'
import { BodyLayout, MainLayout } from '@/layouts'
import { UserProfile, selectUserProfile } from '@/slices/user'
import {
  ApiResponseIs,
  useGetUserPodQuery,
  useGetUserProfileQuery,
} from '@/services/user'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'

function isUserFetched(ctx: Web3AuthProviderData) {
  return !!ctx.user && !!ctx.provider
}

export function Web3AuthGatedLayout({
  children,
  className,
}: React.PropsWithChildren & { className?: string }) {
  const web3Auth = useWeb3Auth()
  const router = useRouter()

  const userProfile = useAppSelector(selectUserProfile)

  const {
    data: fetchedUserProfile,
    error: fetchErrorUserProfile,
    isLoading: isUserProfileLoading,
    isFetching: isUserProfileFetching,
    isError: isUserProfileError,
    refetch: refetchUserProfile,
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

  const isUninitiated = web3Auth.status === Web3AuthStatus.UNINITIATED
  const isConnecting = web3Auth.status === Web3AuthStatus.CONNECTING
  const isConnected = web3Auth.status === Web3AuthStatus.CONNECTED

  useEffect(() => {
    if (fetchedUserProfile) {
      const isLoading = isUninitiated || isConnecting
      if ((fetchedUserProfile as ApiResponseIs).is) {
        router.replace('/auth')
      } else if (
        !isLoading &&
        (fetchedUserProfile as UserProfile).user?.id !== web3Auth.user?.email
      ) {
        router.replace('/intro')
      }
      return
    } else if (!fetchedUserProfile) {
      // router.replace('/intro')
      return
    }

    if (!isConnecting && !isUserFetched(web3Auth)) {
      // if (router.pathname !== '/intro') {
      //   router.replace('/intro')
      //   return
      // }
      if (router.pathname !== '/auth') {
        router.replace('/auth')
        return
      }
    }
  }, [isUninitiated || isConnecting, fetchedUserProfile, web3Auth])

  useEffect(() => {
    const isUninitiated = web3Auth.status === Web3AuthStatus.UNINITIATED
    if (!isUserProfileLoading && !isUserPodLoading) {
      //
      // todo: handle isUserPodError

      if (!isUserProfileError) {
        if ((fetchedUserProfile as ApiResponseIs)?.is === 'not found') {
          router.replace('/intro')
          return
        } else if ((fetchedUserPod as ApiResponseIs)?.is === 'not found') {
          web3Auth.logout()
          router.replace('/auth')
          return
        }
      }

      if (
        !isUninitiated &&
        (!web3Auth.user?.appPubkey || !fetchedUserProfile)
      ) {
        router.replace('/auth')
        return
      }

      if (isUserPodError || isUserProfileError) {
        // console.log(isUserProfileError, fetchErrorUserProfile)
        // console.log(isUserPodError, fetchErrorUserPod)
        if (
          (fetchErrorUserProfile as FetchBaseQueryError).status === 401 ||
          (fetchErrorUserPod as FetchBaseQueryError).status === 401
        ) {
          // user not found (registered), need to register profile
          router.replace('/intro')
        } else {
          // unknown error
          web3Auth.logout()
          router.replace('/auth')
        }
      }
    }
  }, [
    isUserProfileLoading,
    isUserPodLoading,
    isUserProfileError,
    isUserPodError,
    fetchedUserProfile,
    fetchedUserPod,
    fetchErrorUserProfile,
    fetchErrorUserPod,
    web3Auth.user?.appPubkey,
  ])

  if (isConnecting && !isUserFetched(web3Auth)) {
    return <LoadingScreen />
  }

  if (isUninitiated && !isUserFetched(web3Auth)) {
    if (router.pathname !== '/auth') {
      return <LoadingScreen />
    } else {
      return (
        <MainLayout className={className}>
          <BodyLayout>{children}</BodyLayout>
        </MainLayout>
      )
    }
  }

  return (
    <MainLayout className={className}>
      <Topbar />
      <BodyLayout>{children}</BodyLayout>
    </MainLayout>
  )
}
