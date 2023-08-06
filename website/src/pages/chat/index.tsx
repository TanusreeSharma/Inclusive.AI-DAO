'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { styled } from '@mui/system'
import axios from 'axios'
import { useState, useCallback, useEffect } from 'react'
// import useWebSocket, { ReadyState } from 'react-use-websocket'
import { io as socketIo, Socket, ManagerOptions } from 'socket.io-client'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { selectProfile } from '@/slices/profile'
import { addSelfMessageHistory, selectSelfMessageHistory } from '@/slices/chat'
import type { GptChatDialogue } from '@/types'

function useSocket(url: string, namespace: string) {
  const [socket, setSocket] = useState<Socket | undefined>(undefined)

  useEffect(() => {
    const urlNamespaced = `${url}/${namespace}`
    const _socket = socketIo(urlNamespaced, {
      path: '/socket', // socket.io server opened at /socket not /socket.io
      transports: ['websocket'],
    })
    setSocket(_socket)
    // clean up
    return () => {
      _socket.disconnect()
    }
  }, [])

  return socket
}

export default function ChatIndexPage() {
  const dispatch = useAppDispatch()
  const userProfile = useAppSelector(selectProfile)
  const selfMessageHistory = useAppSelector(selectSelfMessageHistory)

  // const ws = useWebSocket(process.env.NEXT_PUBLIC_WS_URL as string)
  // const socket = useSocket(process.env.NEXT_PUBLIC_WS_URL as string + '/chat')
  const socket = useSocket(process.env.NEXT_PUBLIC_WS_URL as string, 'chat')

  const [draftMessage, setDraftMessage] = useState('')
  const [isChatDisabled, setIsChatDisabled] = useState(false)
  const [initiated, setInitiated] = useState(false)

  const handleSendMessage = useCallback(() => {
    if (!socket || !draftMessage || isChatDisabled) return
    setIsChatDisabled(true)

    socket.emit('chat', { message: draftMessage }, (res: any) =>
      console.log(res),
    )

    const currentDialogues = [
      ...selfMessageHistory,
      { role: 'user', content: draftMessage },
    ]

    dispatch(addSelfMessageHistory({ role: 'user', content: draftMessage }))
    setDraftMessage('Waiting for AI response...') // for self rooms

    const getAIResponse = async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/ai/chat`
      const data = {
        appPubkey: userProfile.pubKey, // identifier against JWT (in addition to email)
        dialogues: currentDialogues,
      }
      const options = {
        headers: {
          Authorization: 'Bearer ' + userProfile.jwtToken,
          'Content-Type': 'application/json',
        },
      }

      try {
        return (await axios.post<GptChatDialogue>(url, data, options)).data
      } catch (err) {
        console.error(err)
        throw err
      }
    }
    getAIResponse()
      .then((response) => {
        dispatch(addSelfMessageHistory(response))
      })
      .catch((err) => {})
      .finally(() => {
        setDraftMessage('')
        setIsChatDisabled(false)
      })
  }, [socket, draftMessage, userProfile, isChatDisabled, selfMessageHistory])

  const handleKeyPressSendMessage = (
    e: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // useEffect(() => {
  //   if (userProfile.id === '') return
  //   if (initiated || ws.readyState === ReadyState.CLOSING) return

  //   // For AI-assistant chat, each user's channel is their user ID
  //   ws.sendJsonMessage({
  //     user_id: userProfile.id,
  //     username: userProfile.name,
  //     channel: userProfile.id,
  //   })
  //   // TODO: set true only after receiving room confirmation from ws
  //   setInitiated(true)
  // }, [userProfile, ws])

  useEffect(() => {
    if (!socket) return
    if (initiated) return

    socket.off('connect')
    socket.off('disconnect')
    socket.off('chat_message')

    socket.on('connect', () => {
      socket.connected = true
      console.log('socket connected')
      setInitiated(true)
    })
    socket.on('disconnect', () => {
      socket.connected = false
      console.log('socket disconnected')
    })
    socket.on('chat_message', (data: any) => {
      console.log('socket chat_message', data)
    })
  }, [socket])

  // if (ws.readyState !== ReadyState.OPEN) {
  if (!socket || !socket.connected || !initiated) {
    return (
      <Typography variant="h6" fontWeight="bold">
        Connecting...
      </Typography>
    )
  }

  return (
    <Stack
      height="100%"
      alignItems="flex-stretch"
      justifyContent="flex-end"
      pb={2}
      width="100%"
      maxWidth={600}
    >
      <Stack spacing={1} sx={{ overflowY: 'scroll' }}>
        {selfMessageHistory.map((message, idx) => (
          <ChatMessage key={idx} message={message.content} role={message.role} />
        ))}
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
          disabled={isChatDisabled}
        />
        <Button
          variant="outlined"
          onClick={handleSendMessage}
          disabled={isChatDisabled}
        >
          Send
        </Button>
      </Stack>
    </Stack>
  )
}

const AlternateChatBox = styled(Box)({
  width: '100%',
  padding: '10px 16px',
  borderRadius: 4,
  '&:nth-of-type(even)': {
    backgroundColor: 'rgb(244, 246, 249)',
  },
})

function ChatMessage({ message, role }: { message: string, role: string }) {
  return (
    <AlternateChatBox width="calc(100% + 10px)" pr={2}>
      <Typography variant="body2" fontWeight="bold" pb={1} textTransform="uppercase">{role}</Typography>
      <Typography variant="body1">{message}</Typography>
    </AlternateChatBox>
  )
}
