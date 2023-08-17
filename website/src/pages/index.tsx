import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useMemo } from 'react'

import { ChatBox, LoadingScreen } from '@/components'
import { useAppSelector, useWeb3Auth } from '@/hooks'
import {
  ApiResponseIs,
  useGetUserPodQuery,
  useGetUserProfileQuery,
} from '@/services/user'
import { selectUserPod, selectUserProfile } from '@/slices/user'
import { type UserPod } from '@/types'

// const ValueQuestionBox = styled(NextLink)(({ theme }) => ({
const ValueQuestionBox = styled(Box)(({ theme }) => ({
  width: 'full',
  padding: '12px 24px',
  border: '1px solid #e3e4e5',
  borderRadius: 6,
  boxShadow: '0 0 20px 1px rgba(130,130,130,0.05)',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'border-color 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    cursor: 'pointer',
  },
}))

export default function IndexPage() {
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

  // useEffect(() => {
  // console.log(isUserProfileLoading, fetchedUserProfile)
  // if (
  //   !isUserProfileLoading &&
  //   (!fetchedUserProfile ||
  //     (fetchedUserProfile as ApiResponseIs).is === 'not found' ||
  //     (fetchedUserProfile as UserProfile)?.user?.id === '')
  // )
  //   router.replace('/intro')
  // }, [isUserProfileLoading, fetchedUserProfile])

  // useEffect(() => {
  //   // console.log('auth', isUserProfileLoading, isUserPodLoading, web3Auth.user?.appPubkey)
  //   const isUninitiated = web3Auth.status === Web3AuthStatus.UNINITIATED
  //   if (!isUserProfileLoading && !isUserPodLoading) {
  //     //
  //     // todo: handle isUserPodError
  //     console.log(fetchedUserProfile, fetchedUserPod)

  //     if (!isUserProfileError) {
  //       if ((fetchedUserProfile as ApiResponseIs)?.is === 'not found') {
  //         router.replace('/intro')
  //         return
  //       } else if ((fetchedUserPod as ApiResponseIs)?.is === 'not found') {
  //         // web3Auth.logout()
  //         console.log('pod not')
  //         router.replace('/auth')
  //         return
  //       } else {
  //         console.log('not intro')
  //       }
  //     }

  //     if (
  //       !isUninitiated &&
  //       (!web3Auth.user?.appPubkey || !fetchedUserProfile)
  //     ) {
  //       router.replace('/auth')
  //       return
  //     }

  //     if (isUserPodError || isUserProfileError) {
  //       console.log(isUserProfileError, fetchErrorUserProfile)
  //       console.log(isUserPodError, fetchErrorUserPod)

  //       if (
  //         (fetchErrorUserProfile as FetchBaseQueryError).status === 401 ||
  //         (fetchErrorUserPod as FetchBaseQueryError).status === 401
  //       ) {
  //         // user not found (registered), need to register profile
  //         router.replace('/intro')
  //       } else {
  //         // unknown error
  //         web3Auth.logout()
  //         router.replace('/auth')
  //       }
  //     }
  //   }
  // }, [
  //   isUserProfileLoading,
  //   isUserPodLoading,
  //   isUserProfileError,
  //   isUserPodError,
  //   fetchedUserProfile,
  //   fetchedUserPod,
  //   fetchErrorUserProfile,
  //   fetchErrorUserPod,
  //   web3Auth.user?.appPubkey,
  // ])

  const valueQuestionId = 0

  const valueQuestion = useMemo(() => {
    if (!fetchedUserPod) return
    if (!!(fetchedUserPod as ApiResponseIs).is) return
    // search value questions in userpod matching the id of `valueQuestionId`
    return (fetchedUserPod as UserPod).valueQuestion[valueQuestionId]
  }, [fetchedUserPod])

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
    (fetchedUserPod as UserPod)?.id !== userPod.id ||
    !valueQuestion
  ) {
    return <LoadingScreen />
  }

  return (
    <Stack direction="row" spacing={4} alignItems="stretch">
      <Box
        bgcolor="#f7f9fc"
        borderRadius={6}
        p={4}
        width="100%"
        maxWidth={{ xs: '100%', md: 450 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Welcome to <b>Pod {userPod.id}</b>
        </Typography>
        <Typography variant="body1" pt={1}>
          Here you will get familiar with a value topic by interacting with
          ChatGPT. Ask any questions related to this value topic and help us
          figure out how ChtaGPT should response the questions
        </Typography>

        <Typography variant="body1" fontWeight="bold" pt={5}>
          Read instruction and information to understand about this entire
          task/interaction.
        </Typography>
        <Typography variant="body1" pt={1}>
          You can visit <b>Discussion</b> channel anytime you want
        </Typography>
        <Typography variant="body1" pt={1}>
          Once you are ready understanding the value topic, you can proceed with
          governance voting
        </Typography>

        <Box pt={2}>
          <ValueQuestionBox>
            <Typography variant="h6" fontWeight="bold">
              {valueQuestion.topic}
            </Typography>
            <Typography variant="body2" pt={1} color="#555">
              {valueQuestion.question}
            </Typography>
          </ValueQuestionBox>
        </Box>
      </Box>
      <Stack
        width="100%"
        alignItems="flex-start"
        justifyContent="stretch"
        spacing={4}
        position="relative"
        minHeight={550}
      >
        <ChatBox
          channelId={`${web3Auth.user.email}+${valueQuestionId}`}
          web3AuthUser={web3Auth.user}
          promptSuggestions={[
            'What challenges do generative AI models face in avoiding stereotypes in image creation?',
            `How can AI models be trained to provide diverse representations for underspecified prompts like 'a CEO' or 'a nurse'`,
            'What methods are being used to ensure unbiased outputs in generative AI models?',
            'What are some real-world implications of stereotypical outputs from generative AI models?',
            // 'Explain the importance of avoiding stereotypical depictions in AI-generated images.',
            // 'How can the balance between diversity and homogeneity be maintained in AI image generation?',
            // 'Describe the ethical considerations in designing AI models to avoid stereotypical representations.',
            // 'How can user feedback be integrated to ensure diversity in AI-generated images?'
            // 'What is the role of data selection in shaping the outputs of generative AI models?'
            // 'How can collaboration between AI developers, sociologists, and ethicists help in mitigating stereotypical outputs in AI-generated imagery?'
          ]}
        />
      </Stack>
    </Stack>
  )
}
