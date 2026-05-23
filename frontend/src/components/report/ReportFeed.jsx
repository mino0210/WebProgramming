import { useState, useEffect } from 'react'
import ReportCard from './ReportCard'
import SympathyButton from '../sympathy/SympathyButton'
import { resolveReport } from '../../api/reportApi'

const CATEGORY_COLOR = {
  침수: '#3b82f6', 화재: '#ef4444', 교통: '#f59e0b',
  낙석: '#78716c', 정전: '#eab308', 가스누출: '#22c55e',
}

function ReportFeed({ pins = [], onPinsUpdate, onResolved, selectedPin, onPinSelect }) {
  const [selected, setSelected] = useState(null)
  const [notifyOn, setNotifyOn] = useState(true)
  const memberId = localStorage.getItem('memberId')
  const nickname = localStorage.getItem('nickname')
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  useEffect(() => { if (selectedPin) setSelected(selectedPin) }, [selectedPin])

  useEffect(() => {
    if (!selected) return
    const updated = pins.find((p) => p.id === selected.id)
    if (updated) setSelected(updated)
  }, [pins])

  const handleSympathyChanged = (result) => {
    if (!result) return
    setSelected((prev) => prev ? { ...prev, sympathyCount: result.count ?? prev.sympathyCount } : prev)
    onPinsUpdate?.(result)
  }

  const handleResolve = async (reportId) => {
    if (!window.confirm('이 제보를 해결 완료 처리하시겠습니까?')) return
    try {
      await resolveReport(reportId, memberId)
      setSelected((prev) => prev ? { ...prev, status: 'RESOLVED' } : prev)
      onResolved?.(reportId)
    } catch { alert('처리 중 오류가 발생했습니다.') }
  }

  const color = selected ? (CATEGORY_COLOR[selected.categoryName] || '#8b5cf6') : '#8b5cf6'

  return (
      <div style={styles.wrapper}>
        {/* 상세 패널 */}
        {selected && (
            <div style={styles.detail}>
              <div style={styles.detailHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ ...styles.detailBadge, background: color }}>{selected.categoryName}</span>
                  {selected.status === 'RESOLVED' && <span style={styles.resolvedChip}>✅ 해결완료</span>}
                </div>
                <button style={styles.closeBtn} onClick={() => setSelected(null)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div style={styles.detailTitle}>{selected.title}</div>
              <div style={styles.metaGrid}>
                <span style={styles.metaLabel}>제보 시간</span>
                <span style={styles.metaValue}>{selected.createdAt ? new Date(selected.createdAt).toLocaleString('ko-KR') : '-'}</span>
                <span style={styles.metaLabel}>위치</span>
                <span style={styles.metaValue}>{selected.title || '-'}</span>
                <span style={styles.metaLabel}>상세 내용</span>
                <span style={styles.metaValue}>{selected.content || '-'}</span>
                <span style={styles.metaLabel}>제보자</span>
                <span style={styles.metaValue}>{selected.nickname || '시민 제보'}</span>
              </div>
              {selected.imageUrls?.length > 0 && (
                  <div>
                    <div style={styles.sectionLabel}>첨부 사진</div>
                    <div style={styles.imageGrid}>
                      {selected.imageUrls.map((url, i) => (
                          <img key={i} src={url.startsWith('http') ? url : `${apiBase}${url}`} alt="제보" style={styles.detailImage} onError={(e) => { e.target.style.display = 'none' }} />
                      ))}
                    </div>
                  </div>
              )}
              <div style={styles.actionRow}>
                <SympathyButton reportId={selected.reportId ?? selected.id} memberId={memberId} count={selected.status === 'NEW' ? 0 : (selected.sympathyCount || 0)} onChanged={handleSympathyChanged} />
                {selected.nickname === nickname && selected.status !== 'RESOLVED' && (
                    <button style={styles.resolveBtn} onClick={() => handleResolve(selected.reportId ?? selected.id)}>✅ 해결 완료</button>
                )}
              </div>
              <div style={styles.dangerCount}>⚠️ {selected.sympathyCount || 0}명이 위험해요</div>
            </div>
        )}

        {/* 피드 */}
        <div style={styles.feed}>
          <div style={styles.feedHeader}>
            <span style={styles.feedTitle}>최근 제보</span>
            <span style={styles.feedMore}>전체 보기 &gt;</span>
          </div>

          <div style={styles.list}>
            {pins.length === 0 ? (
                <div style={styles.empty}>
                  {/* 이모지 대신 지도 모양 SVG */}
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/>
                    <path d="M8 2v16M16 6v16"/>
                  </svg>
                  <div style={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>아직 제보가 없습니다</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>지도를 클릭해 첫 제보를 등록해보세요!</div>
                </div>
            ) : (
                pins.map((report) => {
                  const isSelected = selected?.id === report.id
                  return (
                      <div key={report.id} onClick={(e) => { e.stopPropagation(); setSelected(isSelected ? null : report) }} style={{ cursor: 'pointer', background: isSelected ? '#eff6ff' : '#fff', borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent' }}>
                        <ReportCard report={report} />
                      </div>
                  )
                })
            )}
          </div>

          <div style={styles.alertRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span style={styles.alertText}>새로운 제보 알림 받기</span>
            </div>
            <div style={{ ...styles.toggle, background: notifyOn ? '#2563eb' : '#d1d5db' }} onClick={() => setNotifyOn(v => !v)}>
              <div style={{ ...styles.toggleKnob, left: notifyOn ? '23px' : '3px' }} />
            </div>
          </div>
        </div>
      </div>
  )
}

const styles = {
  wrapper: { display: 'flex', height: '100%', position: 'relative' },
  detail: { position: 'absolute', right: '320px', top: 0, bottom: 0, width: '300px', background: '#fff', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', overflowY: 'auto', boxShadow: '-4px 0 16px rgba(0,0,0,0.06)', zIndex: 100 },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  detailBadge: { color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px' },
  resolvedChip: { fontSize: '11px', fontWeight: '600', color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: '9999px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
  detailTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', lineHeight: 1.4 },
  metaGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '7px 14px', background: '#f9fafb', borderRadius: '10px', padding: '12px' },
  metaLabel: { fontSize: '12px', color: '#9ca3af', fontWeight: '500', whiteSpace: 'nowrap' },
  metaValue: { fontSize: '12px', color: '#374151', lineHeight: 1.5 },
  sectionLabel: { fontSize: '11px', color: '#9ca3af', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.3px' },
  imageGrid: { display: 'flex', gap: '8px' },
  detailImage: { width: 'calc(50% - 4px)', borderRadius: '8px', aspectRatio: '4/3', objectFit: 'cover' },
  actionRow: { display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' },
  resolveBtn: { flex: 1, padding: '8px 12px', border: 'none', borderRadius: '8px', background: '#22c55e', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  dangerCount: { fontSize: '12px', color: '#ef4444', fontWeight: '600', paddingTop: '8px', borderTop: '1px solid #f3f4f6' },
  feed: { width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #e5e7eb' },
  feedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 },
  feedTitle: { fontSize: '14px', fontWeight: '700', color: '#111827' },
  feedMore: { fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: '500' },
  list: { flex: 1, overflowY: 'auto' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', textAlign: 'center', padding: '20px' },
  alertRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6', flexShrink: 0, background: '#f9fafb' },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' },
  toggleKnob: { position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' },
  alertText: { fontSize: '13px', color: '#374151', fontWeight: '500' },
}

export default ReportFeed