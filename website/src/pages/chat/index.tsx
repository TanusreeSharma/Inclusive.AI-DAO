'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState, useCallback, useEffect } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

import { useAppDispatch, useAppSelector } from '@/hooks'
import { selectProfile } from '@/slices/profile'
import { addSelfMessageHistory, selectSelfMessageHistory } from '@/slices/chat'

export default function ChatIndexPage() {
  const dispatch = useAppDispatch()
  const userProfile = useAppSelector(selectProfile)
  const selfMessageHistory = useAppSelector(selectSelfMessageHistory)

  const ws = useWebSocket(process.env.NEXT_PUBLIC_WS_URL as string)

  const [draftMessage, setDraftMessage] = useState('')
  const [isChatDisabled, setIsChatDisabled] = useState(false)
  const [initiated, setInitiated] = useState(false)

  const handleSendMessage = useCallback(() => {
    if (!ws || !draftMessage || isChatDisabled) return
    setIsChatDisabled(true)
    ws.sendMessage(draftMessage)
    
    const msg = draftMessage
    setDraftMessage('Waiting for AI response...') // for self rooms

    const getAIResponse = async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/ai-assistant`
      console.log(url)
      // TODO: use POST instead of GET
      const response = await fetch(`${url}?prompt=${msg}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        //   prompt: msg,
        // }),
      })
      const json = await response.json()
      console.log(json)
      return json.message.choices[0].message.content as string
    }
    getAIResponse().then((response) => {
      dispatch(addSelfMessageHistory(response))
    }).catch((err) => {

    }).finally(() => {
      setDraftMessage('')
      setIsChatDisabled(false)
    })
  }, [ws, draftMessage])

  useEffect(() => {
    if (userProfile.id === '') return
    if (initiated || ws.readyState === ReadyState.CLOSING) return

    // For AI-assistant chat, each user's channel is their user ID
    ws.sendJsonMessage({
      user_id: userProfile.id,
      username: userProfile.name,
      channel: userProfile.id,
    })
    // TODO: set true only after receiving room confirmation from ws
    setInitiated(true)
  }, [userProfile, ws])

  useEffect(() => {
    if (ws.lastMessage !== null) {
      // console.log(ws.lastMessage)
      dispatch(addSelfMessageHistory(ws.lastMessage.data))
    }
  }, [ws.lastMessage])

  if (ws.readyState !== ReadyState.OPEN) {
    return (
      <Typography variant="h6" fontWeight="bold">
        Error in connecting to the chat. Please refresh the page.
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
      <Stack spacing={1}>
        {selfMessageHistory.map((message, idx) => (
          <ChatMessage key={idx} message={message} />
        ))}
      </Stack>
      <Stack direction="row" spacing={2} alignItems="stretch" mt={4}>
        <TextField
          variant="outlined"
          multiline
          minRows={2}
          maxRows={4}
          value={draftMessage}
          onChange={(e) => setDraftMessage(e.target.value)}
          fullWidth
        />
        <Button variant="outlined" onClick={handleSendMessage} disabled={isChatDisabled}>
          Send
        </Button>
      </Stack>
    </Stack>
  )
}

const AlternateChatBox = styled(Box)({
  width: '100%',
  padding: '10px 16px',
  fontSize: '1rem',
  borderRadius: 4,
  '&:nth-of-type(even)': {
    backgroundColor: 'rgb(244, 246, 249)',
  },
})

function ChatMessage({ message }: { message: string }) {
  return (
    <AlternateChatBox>
      {message}
    </AlternateChatBox>
  )
}
