import { useState, useCallback, useEffect, useMemo } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { WebSocketHook } from 'react-use-websocket/dist/lib/types'

export default function useChatConnection(username: string, channel: string) {
  const [ws, setWs] = useState<WebSocketHook<any> | undefined>(undefined)

  useEffect(() => {
    if (!username || !channel) return
    if (ws?.readyState === ReadyState.OPEN) return

    const initMsg = { username, channel }

    const _ws = useWebSocket(process.env.NEXT_PUBLIC_WS_URL as string, {
      onOpen: () => {
        _ws.sendJsonMessage(initMsg)
      },
    })

    setWs(_ws)
  }, [username, channel])

  return ws
}
