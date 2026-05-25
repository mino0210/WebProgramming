import { useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const normalizeMessage = (message) => {
  try {
    return JSON.parse(message.body)
  } catch (error) {
    console.error('[useWebSocket] 메시지 파싱 실패:', error)
    return null
  }
}

export function useWebSocket({ onNewPin, onSympathy, onAlert } = {}) {
  const clientRef = useRef(null)
  const handlersRef = useRef({ onNewPin, onSympathy, onAlert })

  useEffect(() => {
    handlersRef.current = { onNewPin, onSympathy, onAlert }
  }, [onNewPin, onSympathy, onAlert])

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      debug: () => {},
      onConnect: () => {
        client.subscribe('/topic/pins', (message) => {
          const pin = normalizeMessage(message)
          if (pin) handlersRef.current.onNewPin?.(pin)
        })

        client.subscribe('/topic/sympathy', (message) => {
          const data = normalizeMessage(message)
          if (data) handlersRef.current.onSympathy?.(data)
        })

        client.subscribe('/topic/alert', (message) => {
          const data = normalizeMessage(message)
          if (data) handlersRef.current.onAlert?.({
            ...data,
            type: 'sympathy',
            title: data.title || '위험 공감이 집중된 제보가 있습니다.',
          })
        })
      },
      onStompError: (frame) => {
        console.error('[useWebSocket] STOMP 오류:', frame.headers?.message || frame.body)
      },
      onWebSocketError: (error) => {
        console.error('[useWebSocket] 연결 오류:', error)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [])

  return clientRef
}
