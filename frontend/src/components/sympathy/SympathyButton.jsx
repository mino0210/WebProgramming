import { useState } from 'react'
import { toggleSympathy } from '../../api/sympathyApi'

function SympathyButton({ reportId, memberId, count = 0, onChanged }) {
  const [loading, setLoading] = useState(false)
  const [localCount, setLocalCount] = useState(count > 1 ? count : 0)
  const [active, setActive] = useState(false)

  const handleClick = async () => {
    if (!reportId) return alert('제보 정보가 없습니다.')
    if (!memberId) return alert('로그인 후 이용할 수 있습니다.')
    if (loading) return

    try {
      setLoading(true)
      const response = await toggleSympathy(reportId, memberId)
      const apiResponse = response?.data ?? response
      const result = apiResponse?.data ?? apiResponse

      // 공감 수 업데이트
      if (result?.count !== undefined) setLocalCount(result.count)
      setActive((prev) => !prev)
      onChanged?.(result)
    } catch (error) {
      console.error('[SympathyButton] 공감 처리 실패:', error)
      alert('공감 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 💡 버튼 상태에 따른 아이콘 색상 설정
  const iconColor = active ? '#ef4444' : '#64748b'

  return (
      <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          style={{
            ...styles.btn,
            background: active ? '#fef2f2' : '#fff',
            borderColor: active ? '#ef4444' : '#e2e8f0',
            color: active ? '#ef4444' : '#64748b',
          }}
      >
        {/* 💡 이모지 대신 들어간 미니멀 경고 기호 SVG */}
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={active ? '#fee2e2' : 'none'} /* 눌렸을 때 아이콘 내부도 옅은 빨간색으로 채움 */
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'all 0.15s' }}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span style={{ fontWeight: '600', fontSize: '13px' }}>
        {loading ? '처리 중...' : `위험해요 ${localCount}`}
      </span>
      </button>
  )
}

const styles = {
  btn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '20px',
    border: '1.5px solid #e2e8f0',
    background: '#fff', cursor: 'pointer',
    transition: 'all 0.15s',
  },
}

export default SympathyButton