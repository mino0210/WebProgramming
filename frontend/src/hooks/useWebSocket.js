import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket({ onNewPin, onSympathy, onAlert }) {
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
      reconnectDelay: 3000,
      onConnect: () => {
        console.log('[WebSocket] 연결됨')
        client.subscribe('/topic/pins',     (msg) => onNewPin?.(JSON.parse(msg.body)))
        client.subscribe('/topic/sympathy', (msg) => onSympathy?.(JSON.parse(msg.body)))
        client.subscribe('/topic/alert',    (msg) => onAlert?.(JSON.parse(msg.body)))
      },
      onDisconnect: () => console.log('[WebSocket] 연결 해제'),
    })

    client.activate()
    clientRef.current = client
    return () => client.deactivate()
  }, [])

  return clientRef
}