import { useState, useEffect } from 'react'
import KakaoMap       from '../components/map/KakaoMap'
import ReportFeed     from '../components/report/ReportFeed'
import ReportModal    from '../components/report/ReportModal'
import CategoryFilter from '../components/common/CategoryFilter'
import AlertBanner    from '../components/common/AlertBanner'
import Header         from '../components/common/Header'
import { useWebSocket } from '../hooks/useWebSocket'
import { getReports, getCategories } from '../api/reportApi'

function MapPage() {
  const [pins, setPins]               = useState([])
  const [alerts, setAlerts]           = useState([])
  const [categories, setCategories]   = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalOpen, setModalOpen]     = useState(false)
  const [clickedLatLng, setClickedLatLng] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedPin, setSelectedPin] = useState(null)

  useEffect(() => {
    getCategories()
        .then((res) => setCategories(res.data?.data || res.data || []))
        .catch(() => {})
  }, [])

  useEffect(() => {
    getReports(selectedCategory)
        .then((res) => {
          setPins(res.data?.data || res.data || [])
          setLastUpdated(new Date())
        })
        .catch(() => {})
  }, [selectedCategory])

  useWebSocket({
    onNewPin:   (pin)  => setPins((prev) => [pin, ...prev]),
    onSympathy: (data) => setPins((prev) =>
        prev.map((p) =>
            (p.reportId ?? p.id) === data.reportId
                ? { ...p, sympathyCount: data.count }
                : p
        )
    ),
    onAlert: (data) => setAlerts((prev) => [data, ...prev]),
  })

  const handlePinsUpdate = (result) => {
    if (!result) return
    setPins((prev) =>
        prev.map((p) =>
            (p.reportId ?? p.id) === result.reportId
                ? { ...p, sympathyCount: result.count }
                : p
        )
    )
  }

  const handleResolved = (reportId) => {
    setPins((prev) =>
        prev.map((p) =>
            (p.reportId ?? p.id) === reportId
                ? { ...p, status: 'RESOLVED' }
                : p
        )
    )
  }

  const handleRefresh = () => {
    getReports(selectedCategory)
        .then((res) => {
          setPins(res.data?.data || res.data || [])
          setLastUpdated(new Date())
        })
        .catch(() => {})
  }

  const pad = (n) => n.toString().padStart(2, '0')
  const timeStr = `${pad(lastUpdated.getHours())}:${pad(lastUpdated.getMinutes())}`

  return (
      <div style={styles.page}>
        <Header />
        <AlertBanner alerts={alerts} />

        {/* 검색바 + 버튼 */}
        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input style={styles.searchInput} placeholder="지역명 또는 주소 검색" readOnly />
          </div>
          <button style={styles.locationBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
            내 위치
          </button>
          <button
              style={styles.reportBtn}
              onClick={() => { setClickedLatLng({ lat: 37.3, lng: 127.0 }); setModalOpen(true) }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            제보하기
          </button>
        </div>

        {/* 카테고리 필터 */}
        <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
        />

        {/* 지도 + 피드 */}
        <div style={styles.main}>
          <div style={styles.mapArea}>
            <KakaoMap
                pins={pins}
                onMapClick={(latLng) => { setClickedLatLng(latLng); setModalOpen(true) }}
                onPinsLoaded={setPins}
                onPinClick={(pin) => setSelectedPin(pin)}
            />
          </div>
          <ReportFeed
              pins={pins}
              selectedPin={selectedPin}
              onPinSelect={setSelectedPin}
              onPinsUpdate={handlePinsUpdate}
              onResolved={handleResolved}
          />
        </div>

        {/* 푸터 */}
        <footer style={styles.footer}>
        <span style={styles.footerItem}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          안전이 최우선입니다
        </span>
          <span style={styles.footerDivider}>|</span>
          <span style={styles.footerItem}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          긴급상황 시 <strong style={{ color: '#fff', marginLeft: '4px' }}>119</strong>
        </span>
          <span style={styles.footerDivider}>|</span>
          <span style={styles.footerItem}>💬 재난문자 수신 설정</span>
          <span style={styles.footerDivider}>|</span>
          <span style={styles.footerItem}>📞 문의: 02-123-4567</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          데이터 업데이트: {timeStr}
            <button style={styles.refreshBtn} onClick={handleRefresh} title="새로고침">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </span>
        </footer>

        {modalOpen && (
            <ReportModal
                latLng={clickedLatLng}
                onClose={() => setModalOpen(false)}
                onSubmitted={(newPin) => setPins((prev) => [newPin, ...prev])}
            />
        )}
      </div>
  )
}

const styles = {
  page: {
    display: 'flex', flexDirection: 'column',
    height: '100vh', overflow: 'hidden',
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    background: '#f8fafc',
  },
  searchRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', background: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  searchBox: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    padding: '0 16px', background: '#f8fafc', height: '44px',
    transition: 'border-color 0.15s',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    background: 'transparent', fontSize: '14px', color: '#475569',
    cursor: 'not-allowed',
  },
  locationBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '0 18px', height: '44px',
    border: '1.5px solid #3b82f6', borderRadius: '10px',
    background: '#fff', color: '#3b82f6',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  reportBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '0 22px', height: '44px',
    border: 'none', borderRadius: '10px',
    background: '#ef4444', color: '#fff',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
  },
  main: { flex: 1, display: 'flex', overflow: 'hidden' },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  footer: {
    display: 'flex', alignItems: 'center',
    padding: '8px 20px', background: '#0f172a', color: '#64748b',
    fontSize: '12px', flexShrink: 0, gap: '12px', flexWrap: 'wrap',
  },
  footerItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  footerDivider: { color: '#1e293b' },
  refreshBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none',
    color: '#94a3b8', cursor: 'pointer', padding: '4px',
    borderRadius: '4px', display: 'flex', alignItems: 'center',
  },
}

export default MapPage