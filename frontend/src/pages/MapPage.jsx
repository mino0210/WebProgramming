import { useState } from 'react'
import KakaoMap       from '../components/map/KakaoMap'
import ReportFeed     from '../components/report/ReportFeed'
import ReportModal    from '../components/report/ReportModal'
import CategoryFilter from '../components/common/CategoryFilter'
import AlertBanner    from '../components/common/AlertBanner'
import Header         from '../components/common/Header'
import { useWebSocket } from '../hooks/useWebSocket'
import { getReports } from '../api/reportApi'

function MapPage() {
  const [pins, setPins]           = useState([])
  const [alerts, setAlerts]       = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [clickedLatLng, setClickedLatLng] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useWebSocket({
    onNewPin:   (pin)  => setPins((prev) => [pin, ...prev]),
    onSympathy: (data) => setPins((prev) =>
        prev.map((p) => p.reportId === data.reportId ? { ...p, sympathyCount: data.count } : p)
    ),
    onAlert: (data) => setAlerts((prev) => [data, ...prev]),
  })

  const filteredPins = selectedCategory
      ? pins.filter((p) => p.categoryName === selectedCategory)
      : pins

  const handleRefresh = () => {
    getReports()
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

        {/* 검색바 + 제보하기 */}
        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <span>📍</span>
            <input style={styles.searchInput} placeholder="지역명 또는 주소 검색" readOnly />
            <span>🔍</span>
          </div>
          <button style={styles.locationBtn}>🎯 내 위치</button>
          <button
              style={styles.reportBtn}
              onClick={() => { setClickedLatLng({ lat: 37.3, lng: 127.0 }); setModalOpen(true) }}
          >
            ✏️ 제보하기
          </button>
        </div>

        {/* 카테고리 필터 */}
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

        {/* 지도 + 피드 */}
        <div style={styles.main}>
          <div style={styles.mapArea}>
            <KakaoMap
                pins={filteredPins}
                onMapClick={(latLng) => { setClickedLatLng(latLng); setModalOpen(true) }}
                onPinsLoaded={setPins}
            />
          </div>
          <ReportFeed pins={pins} />
        </div>

        {/* 푸터 */}
        <footer style={styles.footer}>
          <span>🛡️ 안전이 최우선입니다. 작은 제보가 큰 피해를 막을 수 있습니다.</span>
          <span>📞 긴급상황 시 <strong style={{ color: '#fff' }}>119</strong></span>
          <span>💬 재난문자 수신 설정</span>
          <span>📞 문의: 02-123-4567</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          데이터 업데이트: {timeStr}
            <button style={styles.refreshBtn} onClick={handleRefresh} title="새로고침">
            🔄
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
  },
  searchRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 16px', background: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  searchBox: {
    flex: 1, display: 'flex', alignItems: 'center',
    border: '1.5px solid #cbd5e1', borderRadius: '8px',
    padding: '0 12px', background: '#f8fafc', height: '40px', gap: '8px',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    background: 'transparent', fontSize: '14px', color: '#475569',
    cursor: 'not-allowed',
  },
  locationBtn: {
    padding: '0 16px', height: '40px',
    border: '1.5px solid #3b82f6', borderRadius: '8px',
    background: '#fff', color: '#3b82f6',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  reportBtn: {
    padding: '0 20px', height: '40px',
    border: 'none', borderRadius: '8px',
    background: '#ef4444', color: '#fff',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  main: { flex: 1, display: 'flex', overflow: 'hidden' },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  footer: {
    display: 'flex', alignItems: 'center',
    padding: '8px 20px', background: '#1e293b', color: '#94a3b8',
    fontSize: '12px', flexShrink: 0, gap: '20px', flexWrap: 'wrap',
  },
  refreshBtn: {
    background: 'none', border: 'none',
    color: '#94a3b8', fontSize: '16px',
    cursor: 'pointer', padding: '2px',
  },
}

export default MapPage