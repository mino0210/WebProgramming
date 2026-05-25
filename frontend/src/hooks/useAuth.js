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
    const memberData = res?.data?.data ?? res?.data ?? res
    localStorage.setItem('member', JSON.stringify(memberData))
    // Header.jsx / ReportModal.jsx / SympathyButton 등이 사용하는 개별 키도 함께 저장
    if (memberData?.id != null)       localStorage.setItem('memberId', String(memberData.id))
    if (memberData?.nickname != null) localStorage.setItem('nickname', memberData.nickname)
    setMember(memberData)
    return memberData
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
