import {
  Avatar,
  Box,
  Button,
  Stack,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Web3AuthExtendedUser } from '@/components/Providers'
import { useAppDispatch, useAppSelector, useSocket } from '@/hooks'
import { addMessages, selectMessageHistory } from '@/slices/chat'
import { GptChatDialogue } from '@/types'

const PromptSuggestionBox = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '100%',
  padding: theme.spacing(2),
  borderRadius: 4,
  backgroundColor: '#f7f9fc',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#c9e6fc',
  },
}))

const AlternateChatBox = styled(Box)({
  width: '100%',
  padding: '14px 16px',
  borderRadius: 4,
  '&:nth-of-type(even)': {
    backgroundColor: 'rgb(244, 246, 249)',
  },
})

interface ChatBoxProps {
  channelId: string
  web3AuthUser: Web3AuthExtendedUser
  promptSuggestions: string[]
}

export function ChatBox(props: ChatBoxProps) {
  const { channelId, web3AuthUser, promptSuggestions } = props

  const dispatch = useAppDispatch()

  const selfMessageHistory = useAppSelector(selectMessageHistory(channelId))

  const socket = useSocket({
    namespace: 'chat',
    jwtToken: web3AuthUser.idToken,
    autoJoin: true,
    autoJoinChannel: web3AuthUser.email,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [draftMessage, setDraftMessage] = useState('')
  const [isChatDisabled, setIsChatDisabled] = useState(false)
  const [initiated, setInitiated] = useState(false)

  const handleSendMessage = useCallback(() => {
    if (!socket || !draftMessage || isChatDisabled) return
    setIsChatDisabled(true)

    const currentMessage = { role: 'user' as 'user', content: draftMessage }

    // Send current message (only the current message) to server
    socket.emit('chat', { message: currentMessage })

    dispatch(
      addMessages({
        channel: channelId,
        messages: [currentMessage],
      }),
    )
    setDraftMessage('Waiting for response...') // for self rooms

    socket.off('chat_message') // remove all other same listener before adding below
    socket.on(
      'chat_message',
      ({ message: _aiMessage }: { message: GptChatDialogue | string }) => {
        let aiMessage: GptChatDialogue | undefined
        if (typeof _aiMessage === 'string') {
          try {
            aiMessage = JSON.parse(_aiMessage)
          } catch (e) {
            console.error(e)
          }
        } else {
          aiMessage = _aiMessage as GptChatDialogue
        }
        // console.log(aiMessage, _aiMessage)

        if (
          !!aiMessage &&
          aiMessage.content &&
          aiMessage.role === 'assistant'
        ) {
          dispatch(
            addMessages({
              channel: channelId,
              messages: [aiMessage],
            }),
          )
          setDraftMessage('')
        }
        setIsChatDisabled(false)
      },
    )
  }, [socket, draftMessage, web3AuthUser, isChatDisabled, selfMessageHistory])

  const handleKeyPressSendMessage = (
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => {
    if (!socket) return
    if (initiated) return

    // remove any existing socket listeners before re-adding them
    socket.off('connect')
    socket.off('disconnect')

    socket.on('connect', () => {
      socket.connected = true
      // console.log('socket connected')
      setInitiated(true)
    })
    socket.on('disconnect', () => {
      socket.connected = false
      // console.log('socket disconnected')
    })
  }, [socket])

  // Scroll to Bottom of Chat box when messages are added
  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [selfMessageHistory, messagesEndRef])

  let Messages = <></>
  if (selfMessageHistory.length) {
    Messages = (
      <Stack spacing={1} overflow="auto">
        {selfMessageHistory.map((message, idx) => (
          <ChatMessage
            key={idx}
            message={message.content}
            role={message.role}
            pfp={web3AuthUser.profileImage}
          />
        ))}
        <Box ref={messagesEndRef} />
      </Stack>
    )
  } else {
    Messages = (
      <Grid container spacing={2}>
        {promptSuggestions.map((prompt, idx) => (
          <Grid xs={6}>
            <PromptSuggestionBox onClick={() => setDraftMessage(prompt)}>
              <Typography variant="body2" key={prompt}>
                {prompt}
              </Typography>
            </PromptSuggestionBox>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Stack
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      alignItems="flex-stretch"
      justifyContent="flex-end"
      width="100%"
      maxWidth={{ xs: '100%', md: 650 }}
      border="1px solid #eee"
      borderRadius={6}
      px={3}
      py={2}
    >
      <Stack spacing={1} sx={{ overflowY: 'scroll' }}>
        {Messages}
      </Stack>
      <Stack direction="row" spacing={2} alignItems="stretch" mt={2}>
        <TextField
          variant="outlined"
          multiline
          minRows={2}
          maxRows={4}
          value={draftMessage}
          onChange={(e) => setDraftMessage(e.target.value)}
          onKeyUp={handleKeyPressSendMessage}
          fullWidth
          disabled={isChatDisabled || !socket || !initiated} // || !socket.connected
          sx={{ borderRadius: 6 }}
        />
        <Button
          variant="outlined"
          onClick={handleSendMessage}
          disabled={isChatDisabled || !socket || !initiated} // || !socket.connected
        >
          Send
        </Button>
      </Stack>
    </Stack>
  )
}

function ChatMessage({
  message,
  role,
  pfp,
}: {
  message: string
  role: string
  pfp?: string
}) {
  const pfpUrl = role === 'user' ? pfp || '/user.png' : '/ai.png'
  return (
    <AlternateChatBox width="calc(100% + 10px)" pr={2}>
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Avatar
          alt={role === 'user' ? 'User' : 'Assistant'}
          src={pfpUrl}
          sx={{ width: 32, height: 32 }}
        />
        <Typography variant="body2">{message}</Typography>
      </Stack>
    </AlternateChatBox>
  )
}
