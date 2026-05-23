import { useState, useEffect } from 'react'
import { createReport, getCategories } from '../../api/reportApi'

const CATEGORY_META = {
  침수:    { color: '#3b82f6', bg: '#eff6ff' },
  화재:    { color: '#ef4444', bg: '#fef2f2' },
  교통:    { color: '#f59e0b', bg: '#fffbeb' },
  낙석:    { color: '#78716c', bg: '#f5f5f4' },
  정전:    { color: '#eab308', bg: '#fefce8' },
  가스누출: { color: '#22c55e', bg: '#f0fdf4' },
}

function ReportModal({ latLng, onClose, onSubmitted }) {
  const memberId = localStorage.getItem('memberId')
  const [categories, setCategories] = useState([])
  const [title, setTitle]           = useState('')
  const [content, setContent]       = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [image, setImage]           = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    getCategories()
        .then((res) => setCategories(res.data?.data || res.data || []))
        .catch(() => setError('카테고리를 불러오지 못했습니다.'))
  }, [])

  const selectedCat = categories.find((c) => String(c.id) === String(categoryId))
  const catMeta = selectedCat ? (CATEGORY_META[selectedCat.name] || { color: '#1d4ed8', bg: '#eff6ff' }) : { color: '#1d4ed8', bg: '#eff6ff' }

  const handleSubmit = async () => {
    if (!title.trim())   return setError('제목을 입력해주세요.')
    if (!content.trim()) return setError('내용을 입력해주세요.')
    if (!categoryId)     return setError('유형을 선택해주세요.')
    if (!memberId)       return setError('로그인이 필요합니다.')
    setLoading(true); setError('')
    try {
      const formData = new FormData()
      formData.append('data', new Blob([JSON.stringify({
        title, content, categoryId: Number(categoryId),
        latitude: latLng.lat, longitude: latLng.lng,
      })], { type: 'application/json' }))
      if (image) formData.append('images', image)
      const res = await createReport(formData, memberId)
      onSubmitted?.(res.data?.data || res.data)
      onClose()
    } catch { setError('제보 등록에 실패했습니다. 다시 시도해주세요.') }
    finally { setLoading(false) }
  }

  return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

          {/* 헤더 */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...styles.headerIcon, background: catMeta.color }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <span style={styles.headerTitle}>새 제보 등록</span>
            </div>
            <button style={styles.closeBtn} onClick={onClose}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* 위치 배지 */}
          <div style={styles.locBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {latLng?.lat?.toFixed(5)}, {latLng?.lng?.toFixed(5)}
          </div>

          <div style={styles.body}>
            {/* 카테고리 버튼 그리드 */}
            <label style={styles.label}>재난 유형</label>
            <div style={styles.catGrid}>
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat.name] || { color: '#6b7280', bg: '#f3f4f6' }
                const isActive = String(categoryId) === String(cat.id)
                return (
                    <button key={cat.id} type="button"
                            style={{
                              ...styles.catBtn,
                              background: isActive ? meta.bg : '#f9fafb',
                              border: isActive ? `2px solid ${meta.color}` : '1.5px solid #e5e7eb',
                              color: isActive ? meta.color : '#4b5563',
                              fontWeight: isActive ? '700' : '500',
                            }}
                            onClick={() => setCategoryId(cat.id)}
                    >
                      {cat.name}
                    </button>
                )
              })}
            </div>

            <label style={styles.label}>제목</label>
            <input style={styles.input} placeholder="제보 제목을 입력하세요"
                   value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} />

            <label style={styles.label}>내용</label>
            <textarea style={{ ...styles.input, height: '84px', resize: 'vertical' }}
                      placeholder="상황을 자세히 설명해주세요"
                      value={content} onChange={(e) => setContent(e.target.value)} />

            <label style={styles.label}>
              사진 첨부 <span style={{ color: '#9ca3af', fontWeight: 400 }}>(선택)</span>
            </label>
            {image ? (
                <div style={{ position: 'relative' }}>
                  <img src={URL.createObjectURL(image)} alt="미리보기" style={styles.preview} />
                  <button style={styles.removeImg} onClick={() => setImage(null)}>✕</button>
                </div>
            ) : (
                <label style={styles.fileLabel}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>클릭하여 사진 업로드</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                         onChange={(e) => setImage(e.target.files[0])} />
                </label>
            )}

            {error && (
                <div style={styles.errorMsg}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {error}
                </div>
            )}
          </div>

          <div style={styles.footer}>
            <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>취소</button>
            <button style={{ ...styles.submitBtn, background: catMeta.color, opacity: loading ? 0.7 : 1 }}
                    onClick={handleSubmit} disabled={loading}>
              {loading ? '등록 중...' : '제보 등록'}
            </button>
          </div>
        </div>
      </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff', borderRadius: '16px', width: '420px', maxWidth: '95vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 20px', borderBottom: '1px solid #f3f4f6',
  },
  headerIcon: { width: '26px', height: '26px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: '15px', fontWeight: '700', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
  locBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    margin: '12px 20px 0', padding: '7px 12px',
    background: '#eff6ff', borderRadius: '8px',
    fontSize: '12px', color: '#2563eb', fontWeight: '600',
  },
  body: { padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto' },
  label: { fontSize: '12px', fontWeight: '700', color: '#374151', marginTop: '8px' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' },
  catBtn: { padding: '8px 4px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.12s', textAlign: 'center' },
  input: {
    padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', color: '#111827', outline: 'none',
    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  fileLabel: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '5px', padding: '18px',
    border: '1.5px dashed #d1d5db', borderRadius: '10px',
    cursor: 'pointer', background: '#f9fafb',
  },
  preview: { width: '100%', borderRadius: '10px', maxHeight: '150px', objectFit: 'cover' },
  removeImg: {
    position: 'absolute', top: '6px', right: '6px',
    background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
    width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer',
    fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  errorMsg: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
    color: '#dc2626', fontSize: '13px',
  },
  footer: {
    display: 'flex', gap: '10px', justifyContent: 'flex-end',
    padding: '13px 20px', borderTop: '1px solid #f3f4f6', background: '#f9fafb',
  },
  cancelBtn: { padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', color: '#4b5563', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
}

export default ReportModal