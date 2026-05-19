import { useRef } from 'react'

// 백엔드 연결 전 임시 stub — B 담당 완성 후 원래 코드로 교체 필요
export function useWebSocket({ onNewPin, onSympathy, onAlert } = {}) {
  const clientRef = useRef(null)
  return clientRef
}