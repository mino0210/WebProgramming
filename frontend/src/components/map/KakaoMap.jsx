import { useEffect, useRef } from 'react'
import { getReports } from '../../api/reportApi'

function KakaoMap({ pins, onMapClick, onPinsLoaded }) {
  const mapRef  = useRef(null)
  const mapObj  = useRef(null)
  const markers = useRef({})
  const myMarkerRef = useRef(null)

  useEffect(() => {
    const { kakao } = window
    mapObj.current = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.3, 127.0),
      level: 7,
    })
    kakao.maps.event.addListener(mapObj.current, 'click', (e) => {
      onMapClick?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
    })
    getReports().then((res) => onPinsLoaded?.(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!mapObj.current) return
    const { kakao } = window
    pins.forEach((pin) => {
      if (markers.current[pin.reportId]) return
      markers.current[pin.reportId] = new kakao.maps.Marker({
        map: mapObj.current,
        position: new kakao.maps.LatLng(pin.latitude, pin.longitude),
        title: pin.title,
      })
    })
  }, [pins])

  // 확대
  const handleZoomIn = () => {
    if (!mapObj.current) return
    mapObj.current.setLevel(mapObj.current.getLevel() - 1)
  }

  // 축소
  const handleZoomOut = () => {
    if (!mapObj.current) return
    mapObj.current.setLevel(mapObj.current.getLevel() + 1)
  }

  // 내 위치
  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const { kakao } = window
      const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)

      // 기존 내 위치 마커 제거
      if (myMarkerRef.current) myMarkerRef.current.setMap(null)

      // 깜빡이는 커스텀 오버레이
      const content = `
        <div style="position:relative;width:40px;height:40px;transform:translate(-50%,-50%)">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:rgba(59,130,246,0.25);
            animation:ping 1.5s ease-out infinite;
          "></div>
          <div style="
            position:absolute;inset:6px;border-radius:50%;
            background:rgba(59,130,246,0.4);
          "></div>
          <div style="
            position:absolute;inset:12px;border-radius:50%;
            background:#2563eb;border:2.5px solid #fff;
            box-shadow:0 0 0 2px #2563eb;
          "></div>
        </div>
        <style>
          @keyframes ping {
            0%   { transform:scale(0.8); opacity:1; }
            100% { transform:scale(2.2); opacity:0; }
          }
        </style>
      `

      myMarkerRef.current = new kakao.maps.CustomOverlay({
        map: mapObj.current,
        position: latlng,
        content,
        zIndex: 10,
      })

      mapObj.current.setCenter(latlng)
      mapObj.current.setLevel(4)
    })
  }

  return (
      <div style={{ position: 'relative', flex: 1, height: '100%' }}>
        {/* 지도 */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* 확대/축소/내위치 버튼 */}
        <div style={styles.controlBox}>
          <button style={styles.controlBtn} onClick={handleZoomIn} title="확대">+</button>
          <div style={styles.divider} />
          <button style={styles.controlBtn} onClick={handleZoomOut} title="축소">−</button>
          <div style={styles.divider} />
          <button style={styles.controlBtn} onClick={handleMyLocation} title="내 위치">🎯</button>
        </div>
      </div>
  )
}

const styles = {
  controlBox: {
    position: 'absolute',
    top: '16px', left: '16px',
    display: 'flex', flexDirection: 'column',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    zIndex: 10,
  },
  controlBtn: {
    width: '36px', height: '36px',
    border: 'none', background: '#fff',
    fontSize: '18px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#374151', fontWeight: '600',
    transition: 'background 0.1s',
  },
  divider: {
    height: '1px', background: '#e2e8f0', margin: '0 6px',
  },
}

export default KakaoMap