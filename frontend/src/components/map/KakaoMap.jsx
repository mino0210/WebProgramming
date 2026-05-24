import { useEffect, useRef } from 'react'
import { getReports } from '../../api/reportApi'

const CATEGORY_COLOR = {
  침수: '#3b82f6', 화재: '#ef4444', 교통: '#f59e0b',
  낙석: '#78716c', 정전: '#eab308', 가스누출: '#22c55e',
}

const getRisk = (count) => {
  if (count < 2) return { size: 35, color: '59,130,246' }
  if (count < 4) return { size: 50, color: '234,179,8' }
  if (count < 6) return { size: 70, color: '249,115,22' }
  return               { size: 90, color: '239,68,68' }
}

// 기본 핀 SVG
const normalSvg = (color) => `
  <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 10.5 16 24 16 24S32 26.5 32 16C32 7.16 24.84 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="16" r="7" fill="white"/>
  </svg>`

// 선택된 핀 SVG
const selectedSvg = (color) => `
  <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 0C9.0 0 0 9.0 0 20c0 13.0 20 30 20 30S40 33.0 40 20C40 9.0 31.0 0 20 0z" fill="${color}"/>
    <circle cx="20" cy="20" r="11" fill="white" opacity="0.3"/>
    <circle cx="20" cy="20" r="8" fill="white"/>
    <circle cx="20" cy="20" r="4" fill="${color}"/>
  </svg>`

function KakaoMap({ pins, onMapClick, onPinsLoaded, onPinClick }) {
  const mapRef            = useRef(null)
  const mapObj            = useRef(null)
  const markers           = useRef([])
  const circleOverlays    = useRef([])
  const myMarkerRef       = useRef(null)
  const activeOverlayRef  = useRef(null)
  const selectedMarkerRef = useRef(null)  // 현재 선택된 마커 정보 { marker, color }

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao?.maps) { setTimeout(initMap, 300); return }
      window.kakao.maps.load(() => {
        const { kakao } = window
        if (!mapRef.current || mapObj.current) return

        mapObj.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.3, 127.0),
          level: 7,
        })

        setTimeout(() => mapObj.current?.relayout(), 100)

        kakao.maps.event.addListener(mapObj.current, 'click', (e) => {
          onMapClick?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
          if (activeOverlayRef.current) activeOverlayRef.current.setMap(null)
          // 지도 클릭 시 선택 해제
          resetSelectedMarker()
        })

        getReports().then((res) => onPinsLoaded?.(res.data?.data ?? res.data ?? []))
        showMyLocation(false)
      })
    }
    initMap()
  }, [])

  // 선택된 마커를 기본 상태로 되돌림
  const resetSelectedMarker = () => {
    if (!selectedMarkerRef.current) return
    const { marker, color } = selectedMarkerRef.current
    const image = makeMarkerImage(normalSvg(color), 32, 40, 16, 40)
    marker.setImage(image)
    selectedMarkerRef.current = null
  }

  const makeMarkerImage = (svg, w, h, ox, oy) => {
    const { kakao } = window
    return new kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        new kakao.maps.Size(w, h),
        { offset: new kakao.maps.Point(ox, oy) }
    )
  }

  useEffect(() => {
    if (!mapObj.current || !window.kakao?.maps) return
    const { kakao } = window

    markers.current.forEach((m) => m.setMap(null))
    markers.current = []
    circleOverlays.current.forEach((o) => o.setMap(null))
    circleOverlays.current = []
    if (activeOverlayRef.current) activeOverlayRef.current.setMap(null)
    selectedMarkerRef.current = null

    pins.forEach((pin) => {
      if (pin.latitude == null || pin.longitude == null) return

      const color    = CATEGORY_COLOR[pin.categoryName] || '#8b5cf6'
      const position = new kakao.maps.LatLng(pin.latitude, pin.longitude)

      // 히트맵
      const risk = getRisk(pin.sympathyCount || 0)
      const circleDiv = document.createElement('div')
      circleDiv.style.cssText = `
        width: ${risk.size}px;
        height: ${risk.size}px;
        border-radius: 50%;
        background: radial-gradient(circle,
          rgba(${risk.color},0.4) 0%,
          rgba(${risk.color},0.2) 50%,
          rgba(${risk.color},0) 100%
        );
        transform: translate(0%, 30%);
        pointer-events: none;
      `
      const circleOverlay = new kakao.maps.CustomOverlay({
        map: mapObj.current,
        position,
        content: circleDiv,
        zIndex: -1,
        yAnchor: 1,
      })
      circleOverlays.current.push(circleOverlay)


      const marker = new kakao.maps.Marker({
        map: mapObj.current,
        position,
        image: makeMarkerImage(normalSvg(color), 32, 40, 16, 40),
      })

      // 팝업 오버레이
      const overlayContent = document.createElement('div')
      overlayContent.innerHTML = `
        <div style="
          background:#fff; border:1px solid #e5e7eb; border-radius:14px;
          box-shadow:0 8px 24px rgba(0,0,0,0.12); width:260px;
          overflow:hidden; font-family:'Apple SD Gothic Neo',sans-serif;
        ">
          <div style="padding:14px 14px 10px; display:flex; justify-content:space-between; align-items:center;">
            <span style="
              background:${color}; color:#fff;
              padding:3px 10px; border-radius:999px;
              font-size:11px; font-weight:700;
            ">${pin.categoryName || '기타'}</span>
            <button id="close-${pin.id}" style="
              background:none; border:none; cursor:pointer;
              color:#9ca3af; padding:2px; display:flex; align-items:center;
            ">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div style="padding:0 14px 14px;">
            <div style="font-size:15px; font-weight:700; color:#111827; margin-bottom:8px; line-height:1.4;">
              ${pin.title || '제목 없음'}
            </div>
            <div style="display:grid; grid-template-columns:auto 1fr; gap:5px 10px; margin-bottom:10px;">
              <span style="font-size:12px; color:#9ca3af;">내용</span>
              <span style="font-size:12px; color:#374151; line-height:1.5;">${pin.content || '-'}</span>
              <span style="font-size:12px; color:#9ca3af;">제보자</span>
              <span style="font-size:12px; color:#374151;">${pin.nickname || '시민 제보'}</span>
            </div>
            <div style="
              font-size:12px; color:#ef4444; font-weight:600;
              padding-top:8px; border-top:1px solid #f3f4f6;
            ">⚠️ ${pin.sympathyCount || 0}명이 위험해요</div>
          </div>
        </div>`

      const overlay = new kakao.maps.CustomOverlay({
        content: overlayContent,
        position,
        yAnchor: 1.3,
        zIndex: 999,
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        resetSelectedMarker()

        // 클릭한 마커 강조
        marker.setImage(makeMarkerImage(selectedSvg(color), 40, 50, 20, 50))
        selectedMarkerRef.current = { marker, color }

        // 팝업 열기
        if (activeOverlayRef.current) activeOverlayRef.current.setMap(null)
        overlay.setMap(mapObj.current)
        activeOverlayRef.current = overlay
        onPinClick?.(pin)
      })

      overlayContent.querySelector(`#close-${pin.id}`).onclick = () => {
        overlay.setMap(null)
        resetSelectedMarker()
      }

      markers.current.push(marker)
    })
  }, [pins])

  const showMyLocation = (moveCenter = true) => {
    if (!navigator.geolocation || !mapObj.current || !window.kakao?.maps) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const latlng = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      if (myMarkerRef.current) myMarkerRef.current.setMap(null)

      myMarkerRef.current = new window.kakao.maps.CustomOverlay({
        map: mapObj.current,
        position: latlng,
        content: `
          <div style="position:relative;width:40px;height:40px;transform:translate(-50%,-50%)">
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:ping 1.5s ease-out infinite;"></div>
            <div style="position:absolute;inset:6px;border-radius:50%;background:rgba(59,130,246,0.4);"></div>
            <div style="position:absolute;inset:12px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;"></div>
          </div>
          <style>@keyframes ping{0%{transform:scale(0.8);opacity:1;}100%{transform:scale(2.2);opacity:0;}}</style>`,
        zIndex: 10,
      })

      if (moveCenter) {
        mapObj.current.setCenter(latlng)
        mapObj.current.setLevel(4)
      }
    })
  }

  return (
      <div style={{ position: 'relative', flex: 1, height: '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'relative' }} />

        <div style={styles.controlBox}>
          <button style={styles.controlBtn}
                  onClick={() => mapObj.current?.setLevel(mapObj.current.getLevel() - 1)}>
            +
          </button>
          <div style={styles.divider} />
          <button style={styles.controlBtn}
                  onClick={() => mapObj.current?.setLevel(mapObj.current.getLevel() + 1)}>
            −
          </button>
          <div style={styles.divider} />
          <button style={styles.controlBtn} onClick={() => showMyLocation(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
          </button>
        </div>
      </div>
  )
}

const styles = {
  controlBox: {
    position: 'absolute', top: '16px', left: '16px',
    display: 'flex', flexDirection: 'column',
    background: '#fff', borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
    overflow: 'hidden', zIndex: 10,
  },
  controlBtn: {
    width: '38px', height: '38px', border: 'none', background: '#fff',
    fontSize: '18px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#374151', fontWeight: '600',
  },
  divider: { height: '1px', background: '#f3f4f6', margin: '0 6px' },
}

export default KakaoMap