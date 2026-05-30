import { useEffect, useMemo, useState } from 'react'
import { getSympathyStatus, toggleSympathy } from '../../api/sympathyApi'

function normalizeApiData(response) {
  return response?.data?.data ?? response?.data ?? response
}

const toNumberOrNull = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
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
    let ignore = false

    const cachedActive = localStorage.getItem(storageKey) === 'true'
    setActive(cachedActive)

    if (!reportId || !memberId) return undefined

    getSympathyStatus(reportId, memberId)
      .then((response) => {
        if (ignore) return
        const data = normalizeApiData(response) || {}
        const serverCount = toNumberOrNull(data.count ?? data.sympathyCount)
        const serverActive = Boolean(data.active ?? data.sympathized ?? data.liked ?? cachedActive)

        if (serverCount != null) setLocalCount(serverCount)
        setActive(serverActive)
        localStorage.setItem(storageKey, String(serverActive))
      })
      .catch((error) => {
        // 상태 조회 실패 시에도 버튼 자체는 기존 count/localStorage 기준으로 동작하게 둡니다.
        console.warn('[SympathyButton] 공감 상태 조회 실패:', error?.message || error)
      })

    return () => {
      ignore = true
    }
  }, [reportId, memberId, storageKey])

  const emitChanged = (payload) => {
    const normalizedReportId = payload.reportId ?? payload.id ?? reportId
    const normalizedCount = Number(payload.count ?? payload.sympathyCount ?? localCount) || 0
    const normalizedActive = Boolean(payload.active ?? payload.sympathized ?? payload.liked ?? active)

    onChanged?.({
      ...payload,
      reportId: normalizedReportId,
      id: normalizedReportId,
      count: normalizedCount,
      sympathyCount: normalizedCount,
      active: normalizedActive,
    })
  }

  const handleClick = async (event) => {
    event?.stopPropagation?.()
    if (!reportId) return alert('제보 정보가 없습니다.')
    if (!memberId) return alert('로그인 후 이용할 수 있습니다.')
    if (loading) return

    const beforeCount = Number(localCount) || 0
    const optimisticActive = !active
    const optimisticCount = Math.max(0, beforeCount + (optimisticActive ? 1 : -1))

    setLoading(true)
    setActive(optimisticActive)
    setLocalCount(optimisticCount)
    localStorage.setItem(storageKey, String(optimisticActive))
    emitChanged({ reportId, count: optimisticCount, active: optimisticActive })

    try {
      const result = normalizeApiData(await toggleSympathy(reportId, memberId)) || {}
      const serverCount = toNumberOrNull(result.count ?? result.sympathyCount)
      const nextCount = serverCount != null ? serverCount : optimisticCount
      const nextActive = Boolean(result.active ?? result.sympathized ?? result.liked ?? optimisticActive)
      const normalized = {
        ...result,
        reportId: result.reportId ?? result.id ?? reportId,
        count: nextCount,
        sympathyCount: nextCount,
        active: nextActive,
      }

      setLocalCount(nextCount)
      setActive(nextActive)
      localStorage.setItem(storageKey, String(nextActive))
      emitChanged(normalized)
    } catch (error) {
      setLocalCount(beforeCount)
      setActive(!optimisticActive)
      localStorage.setItem(storageKey, String(!optimisticActive))
      emitChanged({ reportId, count: beforeCount, active: !optimisticActive })
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
