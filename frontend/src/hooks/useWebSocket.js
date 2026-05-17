import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

/**
 * STOMP WebSocket 훅
 *
 * 구독 채널:
 *   /topic/pins     - 새 제보 핀 전체 브로드캐스트
 *   /topic/sympathy - 공감 수 실시간 변경
 *   /topic/alert    - 경보 발령 (공감 4개 이상)
 */
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