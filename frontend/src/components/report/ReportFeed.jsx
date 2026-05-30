import { useEffect, useState } from 'react'
import ReportCard from './ReportCard'
import SympathyButton from '../sympathy/SympathyButton'
import { getReportImageUrls } from '../../utils/mediaUrl'
import { CategoryIcon, getCategoryMeta } from '../../utils/categoryMeta'

const getReportId = (report) => report?.reportId ?? report?.id
const getLat = (report) => Number(report?.latitude ?? report?.lat)
const getLng = (report) => Number(report?.longitude ?? report?.lng)


const mergeUniqueList = (...lists) => {
  const merged = []
  lists.flat().filter(Boolean).forEach((item) => {
    const key = typeof item === 'string' ? item : JSON.stringify(item)
    if (!merged.some((existing) => (typeof existing === 'string' ? existing : JSON.stringify(existing)) === key)) {
      merged.push(item)
    }
  })
  return merged
}

const mergeReportWithFullData = (target, pins) => {
  if (!target) return null
  const targetId = getReportId(target)
  const fullReport = targetId != null
    ? pins.find((pin) => String(getReportId(pin)) === String(targetId))
    : null

  const imageUrls = mergeUniqueList(fullReport?.imageUrls || [], target?.imageUrls || [])
  const images = mergeUniqueList(fullReport?.images || [], target?.images || [])
  const reportImages = mergeUniqueList(fullReport?.reportImages || [], target?.reportImages || [])

  return {
    ...(fullReport || {}),
    ...target,
    imageUrls,
    images,
    reportImages,
  }
}

const buildKakaoRouteUrl = (report) => {
  const lat = getLat(report)
  const lng = getLng(report)
  const title = encodeURIComponent(report?.title || report?.categoryName || 'SafePin 제보 위치')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return `https://map.kakao.com/link/to/${title},${lat},${lng}`
}


const buildImageFallbacks = (url) => {
  if (!url) return []
  const values = [url]

  try {
    const parsed = new URL(url, window.location.href)
    const currentHost = window.location.hostname
    const path = parsed.pathname

    if (path.startsWith('/images/')) {
      values.push(`${window.location.protocol}//${currentHost}:8080${path}`)
      values.push(`${parsed.protocol}//${parsed.hostname}:8080${path}`)
    }

    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      values.push(`${parsed.protocol}//${currentHost}:8080${path}`)
    }
  } catch {
    if (String(url).startsWith('/images/')) {
      values.push(`${window.location.protocol}//${window.location.hostname}:8080${url}`)
    }
  }

  return Array.from(new Set(values.filter(Boolean)))
}

function GalleryImage({ src, alt = '제보 이미지', style, fallbackStyle }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const candidates = buildImageFallbacks(src)
  const currentSrc = candidates[sourceIndex]

  useEffect(() => {
    setSourceIndex(0)
    setFailed(false)
  }, [src])

  if (!currentSrc || failed) {
    return (
      <div style={{ ...styles.imageFallback, ...(fallbackStyle || {}) }}>
        <span style={{ fontSize: '18px' }}>🖼️</span>
        <span>이미지를 불러오지 못했습니다</span>
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      style={style}
      loading="lazy"
      onError={() => {
        if (sourceIndex < candidates.length - 1) {
          setSourceIndex((prev) => prev + 1)
          return
        }
        console.warn('[SafePin] 제보 이미지 로딩 실패:', candidates)
        setFailed(true)
      }}
    />
  )
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

function ReportFeed({ pins = [], selectedPin, onPinSelect, onPinsUpdate, onResolved, alertsEnabled = true, onToggleAlerts }) {
  const [selected, setSelected] = useState(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [actionMessage, setActionMessage] = useState('')
  const memberId = localStorage.getItem('memberId')

  useEffect(() => {
    if (!selectedPin) return
    setSelected(mergeReportWithFullData(selectedPin, pins))
    setImageIndex(0)
  }, [selectedPin, pins])

  useEffect(() => {
    if (!actionMessage) return undefined
    const timer = window.setTimeout(() => setActionMessage(''), 2500)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const handleCardClick = (report) => {
    const currentId = getReportId(selected)
    const nextId = getReportId(report)
    const next = currentId === nextId ? null : mergeReportWithFullData(report, pins)
    setSelected(next)
    setImageIndex(0)
    onPinSelect?.(next)
  }

  const handleSympathyChanged = (result) => {
    const resultId = result?.reportId ?? result?.id
    const nextCount = Number(result?.count ?? result?.sympathyCount ?? 0)
    if (resultId == null) return

    const normalized = {
      ...result,
      reportId: resultId,
      id: resultId,
      count: nextCount,
      sympathyCount: nextCount,
    }

    onPinsUpdate?.(normalized)

    setSelected((prev) => {
      if (!prev || String(getReportId(prev)) !== String(resultId)) return prev
      const updated = { ...prev, sympathyCount: nextCount }
      onPinSelect?.(updated)
      return updated
    })
  }

  const handleShare = async () => {
    if (!selectedDetail) return
    const text = buildShareText(selectedDetail)
    const shareData = {
      title: selectedDetail.title || 'SafePin 재난 제보',
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
    if (!selectedDetail) return
    const url = buildKakaoRouteUrl(selectedDetail)
    if (!url) {
      setActionMessage('위치 정보가 없어 경로를 열 수 없습니다.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const selectedDetail = mergeReportWithFullData(selected, pins)
  const categoryMeta = selectedDetail ? getCategoryMeta(selectedDetail.categoryName) : getCategoryMeta('기타')
  const color = selectedDetail ? (selectedDetail.categoryColor || categoryMeta.color) : categoryMeta.color
  const selectedLat = getLat(selectedDetail)
  const selectedLng = getLng(selectedDetail)
  const selectedLocationText = Number.isFinite(selectedLat) && Number.isFinite(selectedLng)
    ? `${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`
    : '위치 정보 없음'
  const selectedImageUrls = getReportImageUrls(selectedDetail)
  const safeImageIndex = selectedImageUrls.length > 0 ? Math.min(imageIndex, selectedImageUrls.length - 1) : 0
  const currentImageUrl = selectedImageUrls[safeImageIndex]

  return (
    <div className="report-feed-wrapper" style={styles.wrapper}>
      {selectedDetail && (
        <div className="report-detail" style={styles.detail}>
          <div style={styles.detailHeader}>
            <div style={styles.detailHeaderLeft}>
              <span style={{ ...styles.detailBadge, background: color }}>
                <CategoryIcon name={selectedDetail.categoryName || '기타'} size={13} background={false} style={{ color: '#fff', width: 18, height: 18, minWidth: 18 }} />
                {selectedDetail.categoryName || '기타'}
              </span>
              {Number(selectedDetail.sympathyCount || 0) >= 3 && <span style={styles.hotBadge}>위험지역</span>}
            </div>
            <button style={styles.detailClose} onClick={() => { setSelected(null); onPinSelect?.(null) }}>✕</button>
          </div>

          <div style={styles.detailTitle}>{selectedDetail.title}</div>
          <div style={styles.detailMetaGrid}>
            <span>🕐 {selectedDetail.createdAt ? new Date(selectedDetail.createdAt).toLocaleString('ko-KR') : '시간 정보 없음'}</span>
            <span>📍 {selectedLocationText}</span>
          </div>
          <div style={styles.detailContent}>{selectedDetail.content}</div>

          {selectedImageUrls.length > 0 && (
            <div style={styles.detailImages}>
              <div style={styles.imageViewer}>
                <GalleryImage
                  key={currentImageUrl}
                  src={currentImageUrl}
                  alt="제보 이미지"
                  style={styles.detailImage}
                  fallbackStyle={{ minHeight: '180px' }}
                />
                {selectedImageUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      style={{ ...styles.imageNavBtn, left: '8px' }}
                      onClick={() => setImageIndex((prev) => (prev - 1 + selectedImageUrls.length) % selectedImageUrls.length)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.imageNavBtn, right: '8px' }}
                      onClick={() => setImageIndex((prev) => (prev + 1) % selectedImageUrls.length)}
                    >
                      ›
                    </button>
                    <div style={styles.imageCounter}>{safeImageIndex + 1} / {selectedImageUrls.length}</div>
                  </>
                )}
              </div>
              {selectedImageUrls.length > 1 && (
                <div style={styles.thumbnailRow}>
                  {selectedImageUrls.map((url, i) => (
                    <button
                      key={`${url}-thumb-${i}`}
                      type="button"
                      style={{
                        ...styles.thumbnailBtn,
                        borderColor: i === safeImageIndex ? '#2563eb' : '#e2e8f0',
                        opacity: i === safeImageIndex ? 1 : 0.68,
                      }}
                      onClick={() => setImageIndex(i)}
                    >
                      <GalleryImage
                        src={url}
                        alt={`제보 이미지 ${i + 1}`}
                        style={styles.thumbnailImage}
                        fallbackStyle={{ width: '100%', height: '100%', fontSize: '0', padding: 0, gap: 0 }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={styles.actionGrid}>
            <button type="button" style={styles.primaryActionBtn} onClick={handleRoute}>🧭 경로 보기</button>
            <button type="button" style={styles.secondaryActionBtn} onClick={handleShare}>🔗 공유하기</button>
          </div>
          {actionMessage && <div style={styles.actionMessage}>{actionMessage}</div>}

          <div style={styles.detailFooter}>
            <SympathyButton
              reportId={getReportId(selectedDetail)}
              memberId={memberId}
              count={selectedDetail.sympathyCount || 0}
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
              const isSelected = String(getReportId(selectedDetail)) === String(reportId)
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

        <button type="button" style={styles.alertRow} onClick={onToggleAlerts}>
          <span style={styles.alertText}>{alertsEnabled ? '🔔 실시간 제보 알림 수신 중' : '🔕 실시간 제보 알림 꺼짐'}</span>
          <div style={{ ...styles.toggle, background: alertsEnabled ? '#2563eb' : '#cbd5e1' }}>
            <div style={{ ...styles.toggleKnob, right: alertsEnabled ? '3px' : '23px' }} />
          </div>
        </button>
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
    padding: '4px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px',
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
  detailImages: { display: 'flex', flexDirection: 'column', gap: '9px' },
  imageViewer: { position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' },
  detailImage: { width: '100%', borderRadius: '12px', maxHeight: '210px', objectFit: 'cover', display: 'block' },
  imageFallback: {
    minHeight: '160px', width: '100%', borderRadius: '12px', background: '#f8fafc',
    border: '1px dashed #cbd5e1', color: '#94a3b8', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: '800',
  },
  imageNavBtn: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: '34px', height: '34px', borderRadius: '50%', border: 'none',
    background: 'rgba(15,23,42,0.58)', color: '#fff', fontSize: '24px', fontWeight: '900',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  imageCounter: {
    position: 'absolute', right: '10px', bottom: '9px',
    padding: '4px 8px', borderRadius: '999px', background: 'rgba(15,23,42,0.66)',
    color: '#fff', fontSize: '12px', fontWeight: '900',
  },
  thumbnailRow: { display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' },
  thumbnailBtn: { width: '48px', height: '42px', flex: '0 0 auto', border: '2px solid #e2e8f0', borderRadius: '9px', padding: 0, overflow: 'hidden', background: '#fff', cursor: 'pointer' },
  thumbnailImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
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
    width: '100%', padding: '12px 16px', border: 'none', borderTop: '1px solid #f1f5f9',
    flexShrink: 0, background: '#f8fafc', cursor: 'pointer',
  },
  alertText: { fontSize: '14px', color: '#374151', fontWeight: '600' },
  toggle: { width: '46px', height: '26px', borderRadius: '12px', background: '#2563eb', position: 'relative', cursor: 'pointer' },
  toggleKnob: { position: 'absolute', top: '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'right 0.16s ease' },
}

export default ReportFeed
