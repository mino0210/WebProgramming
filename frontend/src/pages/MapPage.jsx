import { useState } from 'react'
import KakaoMap       from '../components/map/KakaoMap'
import ReportFeed     from '../components/report/ReportFeed'
import ReportModal    from '../components/report/ReportModal'
import CategoryFilter from '../components/common/CategoryFilter'
import AlertBanner    from '../components/common/AlertBanner'
import Header         from '../components/common/Header'
import { useWebSocket } from '../hooks/useWebSocket'

/** 메인 지도 페이지 — 모든 핵심 기능의 진입점 */
function MapPage() {
  const [pins, setPins]           = useState([])
  const [alerts, setAlerts]       = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [clickedLatLng, setClickedLatLng] = useState(null)

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

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <AlertBanner alerts={alerts} />
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <KakaoMap
          pins={filteredPins}
          onMapClick={(latLng) => { setClickedLatLng(latLng); setModalOpen(true) }}
          onPinsLoaded={setPins}
        />
        <ReportFeed pins={pins} />
      </div>
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

export default MapPage
