import { useEffect, useState } from 'react'
import ReportCard from './ReportCard'
import SympathyButton from '../sympathy/SympathyButton'

const CATEGORY_COLOR = {
  침수: '#3b82f6',
  화재: '#ef4444',
  교통: '#f59e0b',
  낙석: '#78716c',
  정전: '#eab308',
  가스누출: '#22c55e',
}

const getReportId = (report) => report?.reportId ?? report?.id
const getLat = (report) => Number(report?.latitude ?? report?.lat)
const getLng = (report) => Number(report?.longitude ?? report?.lng)

const buildKakaoRouteUrl = (report) => {
  const lat = getLat(report)
  const lng = getLng(report)
  const title = encodeURIComponent(report?.title || report?.categoryName || 'SafePin 제보 위치')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return `https://map.kakao.com/link/to/${title},${lat},${lng}`
}

const buildShareText = (report) => {
  const lat = getLat(report)
  const lng = getLng(report)
  const category = report?.categoryName ? `[${report.categoryName}] ` : ''
  const title = report?.title || 'SafePin 재난 제보'
  const content = report?.content ? `\n${report.content}` : ''
  const location = Number.isFinite(lat) && Number.isFinite(lng)
    ? `\n위치: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
    : ''
  return `${category}${title}${content}${location}`
}

function ReportFeed({ pins = [], selectedPin, onPinSelect, onPinsUpdate, onResolved }) {
  const [selected, setSelected] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const memberId = localStorage.getItem('memberId')
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  useEffect(() => {
    if (!selectedPin) return
    setSelected(selectedPin)
  }, [selectedPin])

  useEffect(() => {
    if (!actionMessage) return undefined
    const timer = window.setTimeout(() => setActionMessage(''), 2500)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const handleCardClick = (report) => {
    const currentId = getReportId(selected)
    const nextId = getReportId(report)
    const next = currentId === nextId ? null : report
    setSelected(next)
    onPinSelect?.(next)
  }

  const handleSympathyChanged = (result) => {
    onPinsUpdate?.(result)
    if (!result?.reportId) return
    setSelected((prev) =>
      prev && getReportId(prev) === result.reportId
        ? { ...prev, sympathyCount: result.count }
        : prev
    )
  }

  const handleShare = async () => {
    if (!selected) return
    const text = buildShareText(selected)
    const shareData = {
      title: selected.title || 'SafePin 재난 제보',
      text,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setActionMessage('공유 창을 열었습니다.')
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`)
        setActionMessage('제보 정보가 클립보드에 복사되었습니다.')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setActionMessage('공유에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  const handleRoute = () => {
    if (!selected) return
    const url = buildKakaoRouteUrl(selected)
    if (!url) {
      setActionMessage('위치 정보가 없어 경로를 열 수 없습니다.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const color = selected ? (selected.categoryColor || CATEGORY_COLOR[selected.categoryName] || '#8b5cf6') : '#8b5cf6'
  const selectedLat = getLat(selected)
  const selectedLng = getLng(selected)
  const selectedLocationText = Number.isFinite(selectedLat) && Number.isFinite(selectedLng)
    ? `${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`
    : '위치 정보 없음'

  return (
    <div className="report-feed-wrapper" style={styles.wrapper}>
      {selected && (
        <div className="report-detail" style={styles.detail}>
          <div style={styles.detailHeader}>
            <div style={styles.detailHeaderLeft}>
              <span style={{ ...styles.detailBadge, background: color }}>
                {selected.categoryName || '기타'}
              </span>
              {Number(selected.sympathyCount || 0) >= 3 && <span style={styles.hotBadge}>위험지역</span>}
            </div>
            <button style={styles.detailClose} onClick={() => { setSelected(null); onPinSelect?.(null) }}>✕</button>
          </div>

          <div style={styles.detailTitle}>{selected.title}</div>
          <div style={styles.detailMetaGrid}>
            <span>🕐 {selected.createdAt ? new Date(selected.createdAt).toLocaleString('ko-KR') : '시간 정보 없음'}</span>
            <span>📍 {selectedLocationText}</span>
          </div>
          <div style={styles.detailContent}>{selected.content}</div>

          {selected.imageUrls && selected.imageUrls.length > 0 && (
            <div style={styles.detailImages}>
              {selected.imageUrls.map((url, i) => (
                <img
                  key={`${url}-${i}`}
                  src={`${apiBase}${url}`}
                  alt="제보 이미지"
                  style={styles.detailImage}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ))}
            </div>
          )}

          <div style={styles.actionGrid}>
            <button type="button" style={styles.primaryActionBtn} onClick={handleRoute}>🧭 경로 보기</button>
            <button type="button" style={styles.secondaryActionBtn} onClick={handleShare}>🔗 공유하기</button>
          </div>
          {actionMessage && <div style={styles.actionMessage}>{actionMessage}</div>}

          <div style={styles.detailFooter}>
            <SympathyButton
              reportId={getReportId(selected)}
              memberId={memberId}
              count={selected.sympathyCount || 0}
              onChanged={handleSympathyChanged}
            />
            <span style={styles.detailHint}>공감 3개 이상 또는 근처 제보 집중 시 위험지역으로 표시됩니다.</span>
          </div>
        </div>
      )}

      <div className="report-feed" style={styles.feed}>
        <div style={styles.header}>
          <div>
            <span style={styles.title}>실시간 제보</span>
            <div style={styles.subTitle}>지도에서 핀을 선택하면 상세 정보가 열립니다.</div>
          </div>
          <span style={styles.more}>{pins.length}건</span>
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
            pins.map((report) => {
              const reportId = getReportId(report)
              const isSelected = getReportId(selected) === reportId
              return (
                <div
                  key={reportId}
                  onClick={(e) => { e.stopPropagation(); handleCardClick(report) }}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : '#fff',
                    borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                    userSelect: 'none',
                    transition: 'background 0.14s ease, border-left 0.14s ease',
                  }}
                >
                  <ReportCard report={report} onResolved={onResolved} />
                </div>
              )
            })
          )}
        </div>

        <div style={styles.alertRow}>
          <span style={styles.alertText}>🔔 실시간 제보 알림 수신 중</span>
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
    right: '360px', top: '12px', bottom: '12px',
    width: '350px', background: 'rgba(255,255,255,0.98)',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    display: 'flex', flexDirection: 'column',
    padding: '20px', gap: '13px',
    overflowY: 'auto',
    boxShadow: '0 18px 45px rgba(15,23,42,0.16)',
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  detailHeaderLeft: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 },
  detailBadge: {
    color: '#fff', fontSize: '12px', fontWeight: '900',
    padding: '4px 10px', borderRadius: '999px',
  },
  hotBadge: {
    color: '#ea580c', background: '#fff7ed', border: '1px solid #fed7aa',
    fontSize: '12px', fontWeight: '900', padding: '3px 9px', borderRadius: '999px',
  },
  detailClose: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    fontSize: '14px', cursor: 'pointer', color: '#64748b',
    width: '34px', height: '34px', borderRadius: '50%',
  },
  detailTitle: { fontSize: '19px', fontWeight: '800', color: '#0f172a', lineHeight: 1.4 },
  detailMetaGrid: {
    display: 'grid', gap: '5px',
    fontSize: '13px', fontWeight: '700', color: '#475569',
    padding: '10px 12px', borderRadius: '12px', background: '#f8fafc',
  },
  detailContent: { fontSize: '15px', fontWeight: '650', color: '#475569', lineHeight: 1.65, whiteSpace: 'pre-wrap' },
  detailImages: { display: 'flex', flexDirection: 'column', gap: '8px' },
  detailImage: { width: '100%', borderRadius: '12px', maxHeight: '190px', objectFit: 'cover' },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  primaryActionBtn: {
    border: 'none', borderRadius: '11px', background: '#2563eb', color: '#fff',
    fontWeight: '900', fontSize: '14px', padding: '12px 10px', cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(37,99,235,0.2)',
  },
  secondaryActionBtn: {
    border: '1px solid #cbd5e1', borderRadius: '11px', background: '#fff', color: '#334155',
    fontWeight: '900', fontSize: '14px', padding: '12px 10px', cursor: 'pointer',
  },
  actionMessage: { fontSize: '13px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', borderRadius: '10px', padding: '8px 10px' },
  detailFooter: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    marginTop: 'auto', paddingTop: '10px',
    borderTop: '1px solid #f1f5f9',
  },
  detailHint: { fontSize: '12px', fontWeight: '700', color: '#94a3b8' },
  feed: {
    width: '360px', flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    background: '#fff', borderLeft: '1px solid #e2e8f0',
    overflow: 'hidden', boxShadow: '-8px 0 26px rgba(15,23,42,0.06)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
    padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
    background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
  },
  title: { fontSize: '18px', fontWeight: '900', color: '#0f172a' },
  subTitle: { marginTop: '3px', fontSize: '13px', color: '#64748b', fontWeight: '600' },
  more: { fontSize: '13px', color: '#2563eb', fontWeight: 900, background: '#eff6ff', padding: '5px 9px', borderRadius: '999px' },
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
  alertText: { fontSize: '14px', color: '#374151', fontWeight: '600' },
  toggle: { width: '46px', height: '26px', borderRadius: '12px', background: '#2563eb', position: 'relative', cursor: 'pointer' },
  toggleKnob: { position: 'absolute', right: '3px', top: '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff' },
}

export default ReportFeed
