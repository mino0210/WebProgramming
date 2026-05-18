import { useState } from 'react'
import ReportCard from './ReportCard'

const CATEGORY_COLOR = {
  침수: '#3b82f6',
  화재: '#ef4444',
  교통: '#f59e0b',
  낙석: '#78716c',
  정전: '#eab308',
  가스누출: '#22c55e',
}

function ReportFeed({ pins = [] }) {
  const [selected, setSelected] = useState(null)

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  const handleCardClick = (report) => {
    console.log('카드 클릭됨:', report)
    setSelected(selected?.id === report.id ? null : report)
  }

  const color = selected ? (CATEGORY_COLOR[selected.categoryName] || '#8b5cf6') : '#8b5cf6'

  return (
      <div style={styles.wrapper}>

        {/* 상세 팝업 — 왼쪽으로 확장 */}
        {selected && (
            <div style={styles.detail}>
              <div style={styles.detailHeader}>
            <span style={{ ...styles.detailBadge, background: color }}>
              {selected.categoryName}
            </span>
                <button style={styles.detailClose} onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={styles.detailTitle}>{selected.title}</div>
              <div style={styles.detailMeta}>
                <span>🕐 {selected.createdAt ? new Date(selected.createdAt).toLocaleString('ko-KR') : ''}</span>
              </div>
              <div style={styles.detailContent}>{selected.content}</div>

              {/* 이미지 */}
              {selected.imageUrls && selected.imageUrls.length > 0 && (
                  <div style={styles.detailImages}>
                    {selected.imageUrls.map((url, i) => (
                        <img
                            key={i}
                            src={`${apiBase}${url}`}
                            alt="제보 이미지"
                            style={styles.detailImage}
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    ))}
                  </div>
              )}

              <div style={styles.detailFooter}>
                ⚠️ {selected.sympathyCount || 0}명이 위험해요
              </div>
            </div>
        )}

        {/* 피드 목록 */}
        <div style={styles.feed}>
          <div style={styles.header}>
            <span style={styles.title}>최근 제보</span>
            <span style={styles.more}>전체 보기 &gt;</span>
          </div>

          <div style={styles.list}>
            {pins.length === 0 ? (
                <div style={styles.empty}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>아직 제보가 없습니다</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    지도를 클릭해 첫 제보를 등록해보세요!
                  </div>
                </div>
            ) : (
                pins.map((report) => (
                    <div
                        key={report.id}
                        onClick={(e) => { e.stopPropagation(); handleCardClick(report) }}
                        style={{
                          cursor: 'pointer',
                          background: selected?.id === report.id ? '#f0f7ff' : '#fff',
                          borderLeft: selected?.id === report.id ? '3px solid #3b82f6' : '3px solid transparent',
                          userSelect: 'none',
                        }}
                    >
                      <ReportCard report={report} />
                    </div>
                ))
            )}
          </div>

          <div style={styles.alertRow}>
            <span style={styles.alertText}>🔔 새로운 제보 알림 받기</span>
            <div style={styles.toggle}>
              <div style={styles.toggleKnob} />
            </div>
          </div>
        </div>
      </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex', flexDirection: 'row',
    height: '100%', position: 'relative',
  },
  detail: {
    position: 'absolute',
    right: '320px',
    top: 0, bottom: 0,
    width: '300px',
    background: '#fff',
    borderLeft: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column',
    padding: '16px', gap: '10px',
    overflowY: 'auto',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
    zIndex: 100,
  },
  detailHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  detailBadge: {
    color: '#fff', fontSize: '11px', fontWeight: '700',
    padding: '3px 10px', borderRadius: '12px',
  },
  detailClose: {
    background: 'none', border: 'none',
    fontSize: '16px', cursor: 'pointer', color: '#94a3b8',
  },
  detailTitle: {
    fontSize: '16px', fontWeight: '700', color: '#1e293b', lineHeight: 1.4,
  },
  detailMeta: {
    fontSize: '12px', color: '#94a3b8',
  },
  detailContent: {
    fontSize: '13px', color: '#475569', lineHeight: 1.6,
  },
  detailImages: {
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  detailImage: {
    width: '100%', borderRadius: '8px',
    maxHeight: '180px', objectFit: 'cover',
  },
  detailFooter: {
    fontSize: '12px', color: '#ef4444', fontWeight: '600',
    marginTop: 'auto', paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
  },
  feed: {
    width: '320px', flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    background: '#fff', borderLeft: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
  },
  title: { fontSize: '15px', fontWeight: '700', color: '#1e293b' },
  more: { fontSize: '12px', color: '#3b82f6', cursor: 'pointer' },
  list: { flex: 1, overflowY: 'auto' },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '200px', textAlign: 'center', padding: '20px',
  },
  alertRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderTop: '1px solid #f1f5f9',
    flexShrink: 0, background: '#f8fafc',
  },
  alertText: { fontSize: '13px', color: '#374151', fontWeight: '500' },
  toggle: {
    width: '42px', height: '24px', borderRadius: '12px',
    background: '#3b82f6', position: 'relative', cursor: 'pointer',
  },
  toggleKnob: {
    position: 'absolute', right: '3px', top: '3px',
    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
  },
}

export default ReportFeed