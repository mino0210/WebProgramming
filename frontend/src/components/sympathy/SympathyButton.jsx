import { useEffect, useMemo, useState } from 'react'
import { toggleSympathy } from '../../api/sympathyApi'

function normalizeApiData(response) {
  return response?.data?.data ?? response?.data ?? response
}

function SympathyButton({ reportId, memberId, count = 0, onChanged }) {
  const [loading, setLoading] = useState(false)
  const [localCount, setLocalCount] = useState(Number(count) || 0)
  const storageKey = useMemo(() => `safepin:sympathy:${memberId || 'guest'}:${reportId || 'none'}`, [memberId, reportId])
  const [active, setActive] = useState(() => localStorage.getItem(storageKey) === 'true')

  useEffect(() => {
    setLocalCount(Number(count) || 0)
  }, [count])

  useEffect(() => {
    setActive(localStorage.getItem(storageKey) === 'true')
  }, [storageKey])

  const handleClick = async (event) => {
    event?.stopPropagation?.()
    if (!reportId) return alert('제보 정보가 없습니다.')
    if (!memberId) return alert('로그인 후 이용할 수 있습니다.')
    if (loading) return

    try {
      setLoading(true)
      const beforeCount = Number(localCount) || 0
      const result = normalizeApiData(await toggleSympathy(reportId, memberId)) || {}
      const nextCount = Number(result.count ?? result.sympathyCount ?? beforeCount)
      const nextActive = result.active ?? result.sympathized ?? result.liked ?? (nextCount > beforeCount ? true : nextCount < beforeCount ? false : !active)
      const normalized = {
        ...result,
        reportId: result.reportId ?? reportId,
        count: nextCount,
        active: nextActive,
      }

      setLocalCount(nextCount)
      setActive(Boolean(nextActive))
      localStorage.setItem(storageKey, String(Boolean(nextActive)))
      onChanged?.(normalized)
    } catch (error) {
      console.error('[SympathyButton] 공감 처리 실패:', error)
      alert(error.message || '공감 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const iconColor = active ? '#ef4444' : '#64748b'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="sympathy-button"
      style={{
        ...styles.btn,
        background: active ? '#fef2f2' : '#fff',
        borderColor: active ? '#ef4444' : '#e2e8f0',
        color: active ? '#ef4444' : '#64748b',
        opacity: loading ? 0.7 : 1,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={active ? '#fee2e2' : 'none'}
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'all 0.15s' }}
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span style={{ fontWeight: '900', fontSize: '14px' }}>
        {loading ? '처리 중...' : `위험해요 ${localCount}`}
      </span>
    </button>
  )
}

const styles = {
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '9px 16px', borderRadius: '20px',
    border: '1.5px solid #e2e8f0',
    cursor: 'pointer', transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
}

export default SympathyButton
