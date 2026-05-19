import { useState } from 'react'
import { login, signUp } from '../api/memberApi'

/** 인증 상태 관리 훅 (MVP: localStorage 기반, 추후 전역 상태로 전환) */
export function useAuth() {
  const [member, setMember] = useState(() => {
    const saved = localStorage.getItem('member')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogin = async (data) => {
    const res = await login(data)
    localStorage.setItem('member', JSON.stringify(res.data))
    // Header.jsx / ReportModal.jsx / SympathyButton 등이 사용하는 개별 키도 함께 저장
    if (res.data?.id != null)       localStorage.setItem('memberId', String(res.data.id))
    if (res.data?.nickname != null) localStorage.setItem('nickname', res.data.nickname)
    setMember(res.data)
    return res.data
  }

  const handleSignUp = async (data) => signUp(data)

  const handleLogout = () => {
    localStorage.removeItem('member')
    localStorage.removeItem('memberId')
    localStorage.removeItem('nickname')
    setMember(null)
  }

  return { member, handleLogin, handleSignUp, handleLogout }
}
