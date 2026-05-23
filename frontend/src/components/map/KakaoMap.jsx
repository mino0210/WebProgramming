import { useEffect, useRef } from 'react'
import { getReports } from '../../api/reportApi'

const CATEGORY_COLOR = {
  침수: '#3b82f6', 화재: '#ef4444', 교통: '#f59e0b',
  낙석: '#78716c', 정전: '#eab308', 가스누출: '#22c55e',
}

function KakaoMap({ pins, onMapClick, onPinsLoaded, onPinClick }) {
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const markers = useRef([])
  const myMarkerRef = useRef(null)
  const activeOverlayRef = useRef(null) // 기존 infowindowRef를 오버레이용으로 이름 변경

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao?.maps) {
        setTimeout(initMap, 300)
        return
      }

      window.kakao.maps.load(() => {
        const { kakao } = window
        if (!mapRef.current || mapObj.current) return

        mapObj.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.3, 127.0),
          level: 7,
        })

        kakao.maps.event.addListener(mapObj.current, 'click', (e) => {
          onMapClick?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
          if (activeOverlayRef.current) activeOverlayRef.current.setMap(null)
        })

        getReports().then((res) => onPinsLoaded?.(res.data?.data ?? res.data ?? []))
        showMyLocation(false)
      })
    }
    initMap()
  }, [])

  useEffect(() => {
    if (!mapObj.current || !window.kakao?.maps) return
    const { kakao } = window

    markers.current.forEach((marker) => marker.setMap(null))
    markers.current = []
    if (activeOverlayRef.current) activeOverlayRef.current.setMap(null)

    pins.forEach((pin) => {
      if (pin.latitude == null || pin.longitude == null) return

      const color = CATEGORY_COLOR[pin.categoryName] || '#8b5cf6'
      const svg = `
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 10.5 16 24 16 24S32 26.5 32 16C32 7.16 24.84 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="16" r="7" fill="white"/>
        </svg>`

      const markerImage = new kakao.maps.MarkerImage(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          new kakao.maps.Size(32, 40),
          { offset: new kakao.maps.Point(16, 40) }
      )

      const marker = new kakao.maps.Marker({
        map: mapObj.current,
        position: new kakao.maps.LatLng(pin.latitude, pin.longitude),
        image: markerImage
      })

      const overlayContent = document.createElement('div')
      overlayContent.innerHTML = `
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); width: 260px; overflow: hidden; font-family: sans-serif;">
          <div style="padding: 16px 16px 12px; display: flex; justify-content: space-between; align-items: flex-start;">
            <span style="background:${color}; color:#fff; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700;">${pin.categoryName || '기타'}</span>
            <button id="close-${pin.id}" style="background:none; border:none; cursor:pointer; color:#94a3b8; padding:0; display:flex; align-items:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div style="padding: 0 16px 16px;">
            <div style="font-size:15px; font-weight:700; color:#111827; margin-bottom:6px;">${pin.title || '제목 없음'}</div>
            <div style="font-size:13px; color:#64748b; line-height:1.5;">${pin.content || ''}</div>
            <div style="font-size:12px; color:#f59e0b; margin-top:12px; font-weight:600;">⚠️ ${pin.sympathyCount || 0}명이 위험해요</div>
          </div>
        </div>`

      const overlay = new kakao.maps.CustomOverlay({
        content: overlayContent,
        position: marker.getPosition(),
        yAnchor: 1.25,
        zIndex: 100 // 팝업을 가장 상단으로 배치
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        if (activeOverlayRef.current) activeOverlayRef.current.setMap(null)
        overlay.setMap(mapObj.current)
        activeOverlayRef.current = overlay
        onPinClick?.(pin)
      })

      overlayContent.querySelector(`#close-${pin.id}`).onclick = () => overlay.setMap(null)
      markers.current.push(marker)
    })
  }, [pins])

  const showMyLocation = (moveCenter = true) => {
    if (!navigator.geolocation || !mapObj.current || !window.kakao?.maps) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      if (myMarkerRef.current) myMarkerRef.current.setMap(null)

      const content = `
        <div style="position:relative;width:40px;height:40px;transform:translate(-50%,-50%)">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:ping 1.5s ease-out infinite;"></div>
          <div style="position:absolute;inset:6px;border-radius:50%;background:rgba(59,130,246,0.4);"></div>
          <div style="position:absolute;inset:12px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;box-shadow:0 0 0 2px #2563eb;"></div>
        </div>
        <style>@keyframes ping{0%{transform:scale(0.8);opacity:1;}100%{transform:scale(2.2);opacity:0;}}</style>`

      myMarkerRef.current = new window.kakao.maps.CustomOverlay({
        map: mapObj.current,
        position: latlng,
        content,
        zIndex: 10 // 내 위치는 팝업보다 아래에 배치
      })
      if (moveCenter) { mapObj.current.setCenter(latlng); mapObj.current.setLevel(4) }
    })
  }

  return (
      <div style={{ position: 'relative', flex: 1, height: '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <div style={styles.controlBox}>
          <button style={styles.controlBtn} onClick={() => mapObj.current?.setLevel(mapObj.current.getLevel() - 1)}>+</button>
          <div style={styles.divider} />
          <button style={styles.controlBtn} onClick={() => mapObj.current?.setLevel(mapObj.current.getLevel() + 1)}>−</button>
          <div style={styles.divider} />
          <button style={styles.controlBtn} onClick={() => showMyLocation(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path></svg>
          </button>
        </div>
      </div>
  )
}

const styles = {
  controlBox: { position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 10 },
  controlBtn: { width: '36px', height: '36px', border: 'none', background: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontWeight: '600' },
  divider: { height: '1px', background: '#e2e8f0', margin: '0 6px' }
}

export default KakaoMap