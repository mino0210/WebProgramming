import { useState } from 'react'
import { toggleSympathy } from '../../api/sympathyApi'

function SympathyButton({ reportId, memberId, onChanged }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!reportId) {
      alert('제보 정보가 없습니다.')
      return
    }

    if (!memberId) {
      alert('로그인 후 이용할 수 있습니다.')
      return
    }

    if (loading) return

    try {
      setLoading(true)

      const response = await toggleSympathy(reportId, memberId)

      const apiResponse = response?.data ?? response
      const result = apiResponse?.data ?? apiResponse

      onChanged?.(result)
    } catch (error) {
      console.error('[SympathyButton] 공감 처리 실패:', error)
      alert('공감 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
      <button
          type="button"
          className="sympathy-button"
          onClick={handleClick}
          disabled={loading}
      >
        {loading ? '처리 중...' : '위험해요'}
      </button>
  )
}

export default SympathyButton