import { useEffect, useRef } from 'react'
import { getReports } from '../../api/reportApi'

const CATEGORY_COLOR = {
  침수: '#3b82f6',
  화재: '#ef4444',
  교통: '#f59e0b',
  낙석: '#78716c',
  정전: '#eab308',
  가스누출: '#22c55e',
}

function KakaoMap({ pins = [], onMapClick, onPinsLoaded }) {
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const markers = useRef([])
  const myMarkerRef = useRef(null)
  const infowindowRef = useRef(null)

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

        setTimeout(() => {
          mapObj.current?.relayout()
        }, 100)

        kakao.maps.event.addListener(mapObj.current, 'click', (e) => {
          onMapClick?.({
            lat: e.latLng.getLat(),
            lng: e.latLng.getLng(),
          })

          if (infowindowRef.current) {
            infowindowRef.current.close()
          }
        })

        getReports()
          .then((res) => {
            const reports = res.data?.data ?? res.data ?? []
            onPinsLoaded?.(reports)
          })
          .catch((err) => {
            console.error('제보 목록 조회 실패:', err)
          })

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

    if (infowindowRef.current) {
      infowindowRef.current.close()
    }

    pins.forEach((pin) => {
      if (pin.latitude == null || pin.longitude == null) return

      const color = CATEGORY_COLOR[pin.categoryName] || '#8b5cf6'

      const svg = `
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 10.5 16 24 16 24S32 26.5 32 16C32 7.16 24.84 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="16" r="7" fill="white"/>
        </svg>
      `

      const markerImage = new kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        new kakao.maps.Size(32, 40),
        { offset: new kakao.maps.Point(16, 40) }
      )

      const marker = new kakao.maps.Marker({
        map: mapObj.current,
        position: new kakao.maps.LatLng(pin.latitude, pin.longitude),
        image: markerImage,
        title: pin.title,
      })

      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      const firstImageUrl = pin.imageUrls?.[0]
      const imageSrc = firstImageUrl?.startsWith('http')
        ? firstImageUrl
        : `${apiBase}${firstImageUrl || ''}`

      const imageHtml = firstImageUrl
        ? `<img src="${imageSrc}"
              style="width:100%;border-radius:8px;margin-top:8px;max-height:140px;object-fit:cover;"
              onerror="this.style.display='none'" />`
        : ''

      const infowindow = new kakao.maps.InfoWindow({
        content: `
          <div style="
            padding:14px 16px;min-width:220px;max-width:280px;
            font-family:'Apple SD Gothic Neo',sans-serif;
          ">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
              <span style="
                background:${color};color:#fff;
                padding:2px 8px;border-radius:12px;
                font-size:11px;font-weight:700;
              ">${pin.categoryName || '기타'}</span>
            </div>
            <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:6px;">
              ${pin.title || '제목 없음'}
            </div>
            <div style="font-size:12px;color:#64748b;line-height:1.5;margin-bottom:8px;">
              ${pin.content || ''}
            </div>
            ${imageHtml}
            <div style="font-size:11px;color:#94a3b8;margin-top:8px;">
              ⚠️ ${pin.sympathyCount || 0}명이 위험해요
            </div>
          </div>`,
        removable: true,
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        if (infowindowRef.current) {
          infowindowRef.current.close()
        }

        infowindow.open(mapObj.current, marker)
        infowindowRef.current = infowindow
      })

      markers.current.push(marker)
    })
  }, [pins])

  const showMyLocation = (moveCenter = true) => {
    if (!navigator.geolocation || !mapObj.current || !window.kakao?.maps) return

    navigator.geolocation.getCurrentPosition((pos) => {
      const { kakao } = window
      const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)

      if (myMarkerRef.current) {
        myMarkerRef.current.setMap(null)
      }

      const content = `
        <div style="position:relative;width:40px;height:40px;transform:translate(-50%,-50%)">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:ping 1.5s ease-out infinite;"></div>
          <div style="position:absolute;inset:6px;border-radius:50%;background:rgba(59,130,246,0.4);"></div>
          <div style="position:absolute;inset:12px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;box-shadow:0 0 0 2px #2563eb;"></div>
        </div>
        <style>@keyframes ping{0%{transform:scale(0.8);opacity:1;}100%{transform:scale(2.2);opacity:0;}}</style>
      `

      myMarkerRef.current = new kakao.maps.CustomOverlay({
        map: mapObj.current,
        position: latlng,
        content,
        zIndex: 10,
      })

      if (moveCenter) {
        mapObj.current.setCenter(latlng)
        mapObj.current.setLevel(4)
      }
    })
  }

  const handleZoomIn = () => {
    if (!mapObj.current) return
    mapObj.current.setLevel(mapObj.current.getLevel() - 1)
  }

  const handleZoomOut = () => {
    if (!mapObj.current) return
    mapObj.current.setLevel(mapObj.current.getLevel() + 1)
  }

  return (
    <div style={{ position: 'relative', flex: 1, height: '100%' }}>
      <div ref={mapRef} className="kakao-map" style={{ width: '100%', height: '100%' }} />

      <div style={styles.controlBox}>
        <button style={styles.controlBtn} onClick={handleZoomIn}>+</button>
        <div style={styles.divider} />
        <button style={styles.controlBtn} onClick={handleZoomOut}>−</button>
        <div style={styles.divider} />
        <button style={styles.controlBtn} onClick={() => showMyLocation(true)}>🎯</button>
      </div>
    </div>
  )
}

const styles = {
  controlBox: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    zIndex: 10,
  },
  controlBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    background: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
    fontWeight: '600',
  },
  divider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '0 6px',
  },
}

export default KakaoMap
