// TODO: 팀원 A 담당 — 제보 등록 모달
import { useState, useEffect } from 'react'
import { createReport, getCategories } from '../../api/reportApi'

/**
 * ReportModal
 * props:
 *  - latLng: { lat, lng }  ← MapPage에서 지도 클릭 시 전달
 *  - onClose: () => void
 *  - onSubmitted: (newPin) => void  ← 등록 성공 시 핀 추가용
 */
function ReportModal({ latLng, onClose, onSubmitted }) {
  const memberId = localStorage.getItem('memberId')

  const [categories, setCategories] = useState([])
  const [title, setTitle]           = useState('')
  const [content, setContent]       = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [image, setImage]           = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // 카테고리 목록 불러오기
  useEffect(() => {
    getCategories()
        .then((res) => setCategories(res.data?.data || res.data || []))
        .catch(() => setError('카테고리를 불러오지 못했습니다.'))
  }, [])

  const handleSubmit = async () => {
    if (!title.trim())   return setError('제목을 입력해주세요.')
    if (!content.trim()) return setError('내용을 입력해주세요.')
    if (!categoryId)     return setError('유형을 선택해주세요.')
    if (!memberId)       return setError('로그인이 필요합니다.')

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      formData.append('categoryId', categoryId)
      formData.append('latitude', latLng.lat)
      formData.append('longitude', latLng.lng)
      if (image) formData.append('image', image)

      const res = await createReport(formData, memberId)
      onSubmitted?.(res.data?.data || res.data)
      onClose()
    } catch (e) {
      setError('제보 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

          {/* 헤더 */}
          <div style={styles.header}>
            <span style={styles.headerTitle}>📌 새 제보 등록</span>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          {/* 좌표 표시 */}
          <div style={styles.coordBadge}>
            📍 {latLng?.lat?.toFixed(5)}, {latLng?.lng?.toFixed(5)}
          </div>

          {/* 입력 폼 */}
          <div style={styles.body}>
            <label style={styles.label}>제목</label>
            <input
                style={styles.input}
                placeholder="제보 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
            />

            <label style={styles.label}>유형</label>
            <select
                style={styles.input}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">-- 유형 선택 --</option>
              {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <label style={styles.label}>내용</label>
            <textarea
                style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                placeholder="상황을 자세히 설명해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <label style={styles.label}>사진 첨부 (선택)</label>
            <input
                type="file"
                accept="image/*"
                style={styles.fileInput}
                onChange={(e) => setImage(e.target.files[0])}
            />
            {image && (
                <img
                    src={URL.createObjectURL(image)}
                    alt="미리보기"
                    style={styles.preview}
                />
            )}

            {error && <div style={styles.errorMsg}>{error}</div>}
          </div>

          {/* 버튼 */}
          <div style={styles.footer}>
            <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>
              취소
            </button>
            <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
              {loading ? '등록 중...' : '제보 등록'}
            </button>
          </div>

        </div>
      </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    width: '420px',
    maxWidth: '95vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  headerTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '18px',
    cursor: 'pointer', color: '#94a3b8',
  },
  coordBadge: {
    margin: '12px 20px 0',
    padding: '6px 12px',
    background: '#eff6ff',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '600',
  },
  body: {
    padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569', marginTop: '6px' },
  input: {
    padding: '9px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  fileInput: { fontSize: '13px', color: '#475569' },
  preview: {
    width: '100%', borderRadius: '8px',
    maxHeight: '160px', objectFit: 'cover', marginTop: '6px',
  },
  errorMsg: {
    padding: '8px 12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '13px',
  },
  footer: {
    display: 'flex', gap: '10px', justifyContent: 'flex-end',
    padding: '14px 20px',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  cancelBtn: {
    padding: '8px 20px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    background: '#fff',
    color: '#475569',
    fontSize: '14px', fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 24px',
    border: 'none',
    borderRadius: '8px',
    background: '#1e40af',
    color: '#fff',
    fontSize: '14px', fontWeight: '700',
    cursor: 'pointer',
  },
}

export default ReportModal
