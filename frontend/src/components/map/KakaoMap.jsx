import { useEffect, useMemo, useRef, useState } from 'react'
import { getReports } from '../../api/reportApi'
import HeatmapLayer from './HeatmapLayer'
import { getReportImageUrls } from '../../utils/mediaUrl'

const CATEGORY_COLOR = {
  침수: '#3b82f6',
  화재: '#ef4444',
  교통: '#f59e0b',
  낙석: '#78716c',
  정전: '#eab308',
  가스누출: '#22c55e',
}

const normalizeList = (response) => response?.data?.data ?? response?.data ?? response ?? []
const toNumber = (value) => Number(value)
const getReportId = (pin) => pin?.reportId ?? pin?.id

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getSavedLocation() {
  try {
    const raw = localStorage.getItem('safePinLastLocation')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const lat = Number(parsed.lat)
    const lng = Number(parsed.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat, lng }
  } catch {
    return null
  }
}

function saveLocation(lat, lng) {
  try {
    localStorage.setItem('safePinLastLocation', JSON.stringify({ lat, lng, updatedAt: Date.now() }))
  } catch {
    // localStorage 사용이 불가능한 환경에서는 조용히 무시합니다.
  }
}

function getNearbyCount(target, list, range = 0.01) {
  const targetLat = toNumber(target.latitude ?? target.lat)
  const targetLng = toNumber(target.longitude ?? target.lng)

  if (!Number.isFinite(targetLat) || !Number.isFinite(targetLng)) return 0

  return list.filter((pin) => {
    const lat = toNumber(pin.latitude ?? pin.lat)
    const lng = toNumber(pin.longitude ?? pin.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
    return Math.abs(targetLat - lat) <= range && Math.abs(targetLng - lng) <= range
  }).length
}

function KakaoMap({
  pins = [],
  onMapClick,
  onPinsLoaded,
  onPinClick,
  searchRequest,
  locateRequest,
  onSearchResult,
  heatmapPins,
  focusReportRequest,
  selectedReportId,
}) {
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const markers = useRef([])
  const markerMapRef = useRef(new Map())
  const myMarkerRef = useRef(null)
  const searchMarkerRef = useRef(null)
  const infowindowRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  const heatmapSource = heatmapPins || pins

  const heatmapPoints = useMemo(() => {
    return heatmapSource.map((pin) => {
      const nearbyCount = getNearbyCount(pin, heatmapSource)
      const sympathyCount = Number(pin.sympathyCount || 0)
      return {
        ...pin,
        nearbyCount,
        weight: sympathyCount,
        riskScore: nearbyCount + sympathyCount,
      }
    })
  }, [heatmapSource])

  const drawMyLocation = (kakao, latlng, moveToCenter = false) => {
    if (!mapObj.current) return
    if (myMarkerRef.current) myMarkerRef.current.setMap(null)

    const content = `
      <div style="position:relative;width:40px;height:40px;transform:translate(-50%,-50%)">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:ping 1.5s ease-out infinite;"></div>
        <div style="position:absolute;inset:6px;border-radius:50%;background:rgba(59,130,246,0.4);"></div>
        <div style="position:absolute;inset:12px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;box-shadow:0 0 0 2px #2563eb;"></div>
      </div>
      <style>@keyframes ping{0%{transform:scale(0.8);opacity:1;}100%{transform:scale(2.2);opacity:0;}}</style>`

    myMarkerRef.current = new kakao.maps.CustomOverlay({
      map: mapObj.current,
      position: latlng,
      content,
      zIndex: 10,
    })

    if (moveToCenter) {
      mapObj.current.setCenter(latlng)
      mapObj.current.setLevel(4)
    }
  }


  useEffect(() => {
    window.__safePinRouteTo = (lat, lng, title = 'SafePin 제보 위치') => {
      const safeLat = Number(lat)
      const safeLng = Number(lng)
      if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) return
      const encodedTitle = encodeURIComponent(title || 'SafePin 제보 위치')
      window.open(`https://map.kakao.com/link/to/${encodedTitle},${safeLat},${safeLng}`, '_blank', 'noopener,noreferrer')
    }

    window.__safePinShareReport = async (encodedText) => {
      const shareText = encodedText ? decodeURIComponent(encodedText) : 'SafePin 재난 제보를 확인해주세요.'
      try {
        if (navigator.share) {
          await navigator.share({ title: 'SafePin 재난 제보', text: shareText, url: window.location.href })
        } else {
          await navigator.clipboard.writeText(`${shareText}
${window.location.href}`)
          window.alert('제보 정보가 클립보드에 복사되었습니다.')
        }
      } catch (error) {
        if (error?.name !== 'AbortError') window.alert('공유에 실패했습니다.')
      }
    }

    return () => {
      delete window.__safePinRouteTo
      delete window.__safePinShareReport
    }
  }, [])

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao?.maps) {
        setTimeout(initMap, 300)
        return
      }

      window.kakao.maps.load(() => {
        const { kakao } = window
        if (!mapRef.current || mapObj.current) return

        const saved = getSavedLocation()
        const fallback = saved || { lat: 37.3, lng: 127.0 }

        const createMap = (centerInfo, isCurrentLocation = false) => {
          if (!mapRef.current || mapObj.current) return

          const center = new kakao.maps.LatLng(centerInfo.lat, centerInfo.lng)
          mapObj.current = new kakao.maps.Map(mapRef.current, {
            center,
            level: isCurrentLocation ? 4 : 7,
          })

          kakao.maps.event.addListener(mapObj.current, 'click', (e) => {
            onMapClick?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
            if (infowindowRef.current) infowindowRef.current.close()
          })

          getReports()
            .then((res) => onPinsLoaded?.(normalizeList(res)))
            .catch((err) => console.error('[KakaoMap] 제보 목록 조회 실패:', err))

          setTimeout(() => mapObj.current?.relayout(), 100)
          setMapReady(true)

          if (isCurrentLocation) {
            drawMyLocation(kakao, center, false)
          } else if (saved) {
            drawMyLocation(kakao, center, false)
          }
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            saveLocation(current.lat, current.lng)
            createMap(current, true)
          }, () => {
            createMap(fallback, false)
          }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 })
        } else {
          createMap(fallback, false)
        }
      })
    }

    initMap()
  }, [onMapClick, onPinsLoaded])

  useEffect(() => {
    if (!mapObj.current || !window.kakao?.maps) return
    const { kakao } = window

    markers.current.forEach((marker) => marker.setMap(null))
    markers.current = []
    markerMapRef.current.clear()
    if (infowindowRef.current) infowindowRef.current.close()

    pins.forEach((pin) => {
      const lat = Number(pin.latitude ?? pin.lat)
      const lng = Number(pin.longitude ?? pin.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

      const color = pin.categoryColor || CATEGORY_COLOR[pin.categoryName] || '#8b5cf6'
      const nearbyCount = getNearbyCount(pin, pins)
      const reportId = getReportId(pin)
      const isSelected = selectedReportId != null && reportId != null && String(selectedReportId) === String(reportId)
      const markerWidth = isSelected ? 44 : 34
      const markerHeight = isSelected ? 54 : 42
      const markerAnchorX = markerWidth / 2
      const markerAnchorY = markerHeight
      const circleRadius = isSelected ? 9.5 : 7.5
      const svg = `
        <svg width="${markerWidth}" height="${markerHeight}" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
          ${isSelected ? `<ellipse cx="17" cy="40" rx="10" ry="3" fill="rgba(15,23,42,0.25)"/>` : ''}
          <path d="M17 0C7.61 0 0 7.61 0 17c0 11.16 17 25 17 25s17-13.84 17-25C34 7.61 26.39 0 17 0z" fill="${color}" stroke="${isSelected ? '#ffffff' : 'transparent'}" stroke-width="${isSelected ? '2.4' : '0'}"/>
          <circle cx="17" cy="17" r="${circleRadius}" fill="white"/>
        </svg>`

      const markerImage = new kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        new kakao.maps.Size(markerWidth, markerHeight),
        { offset: new kakao.maps.Point(markerAnchorX, markerAnchorY) }
      )

      const marker = new kakao.maps.Marker({
        map: mapObj.current,
        position: new kakao.maps.LatLng(lat, lng),
        image: markerImage,
        title: pin.title,
        zIndex: isSelected ? 20 : 5,
      })

      const firstImageUrl = getReportImageUrls(pin)[0] || null
      const imageHtml = firstImageUrl
        ? `<img src="${firstImageUrl}"
            style="width:100%;border-radius:8px;margin-top:8px;max-height:140px;object-fit:cover;"
            onerror="this.style.display='none'" />`
        : ''

      const reportText = `${pin.categoryName ? `[${pin.categoryName}] ` : ''}${pin.title || 'SafePin 제보'}${pin.content ? `\n${pin.content}` : ''}\n위치: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      const escapedTitle = escapeHtml(pin.title || '제보')
      const escapedContent = escapeHtml(pin.content || '')
      const escapedCategory = escapeHtml(pin.categoryName || '기타')
      const encodedText = encodeURIComponent(reportText)
      const routeTitle = escapeHtml(pin.title || pin.categoryName || 'SafePin 제보 위치')

      const infowindow = new kakao.maps.InfoWindow({
        content: `
          <div style="padding:14px 16px;min-width:240px;max-width:300px;font-family:'Apple SD Gothic Neo',sans-serif;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
              <span style="background:${color};color:#fff;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:800;">${escapedCategory}</span>
              ${nearbyCount >= 3 ? '<span style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:800;">위험지역</span>' : ''}
            </div>
            <div style="font-size:15px;font-weight:800;color:#0f172a;margin-bottom:6px;">${escapedTitle}</div>
            <div style="font-size:12px;color:#64748b;line-height:1.5;margin-bottom:8px;">${escapedContent}</div>
            ${imageHtml}
            <div style="font-size:11px;color:#94a3b8;margin-top:8px;">⚠️ ${pin.sympathyCount || 0}명이 위험해요 · 주변 ${nearbyCount}건</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;">
              <button onclick="window.__safePinRouteTo(${lat}, ${lng}, '${routeTitle}')" style="border:none;border-radius:9px;background:#2563eb;color:#fff;padding:8px 6px;font-size:12px;font-weight:800;cursor:pointer;">경로</button>
              <button onclick="window.__safePinShareReport('${encodedText}')" style="border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#334155;padding:8px 6px;font-size:12px;font-weight:800;cursor:pointer;">공유</button>
            </div>
          </div>`,
        removable: true,
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        if (infowindowRef.current) infowindowRef.current.close()
        infowindow.open(mapObj.current, marker)
        infowindowRef.current = infowindow
        onPinClick?.(pin)
      })

      markers.current.push(marker)
      if (reportId != null) markerMapRef.current.set(String(reportId), { marker, infowindow, pin })
    })
  }, [pins, onPinClick, selectedReportId])

  useEffect(() => {
    if (!focusReportRequest || !mapObj.current || !window.kakao?.maps) return

    const lat = Number(focusReportRequest.latitude ?? focusReportRequest.lat)
    const lng = Number(focusReportRequest.longitude ?? focusReportRequest.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    const { kakao } = window
    const latlng = new kakao.maps.LatLng(lat, lng)
    mapObj.current.setCenter(latlng)
    mapObj.current.setLevel(4)

    const reportId = getReportId(focusReportRequest)
    const matched = reportId != null ? markerMapRef.current.get(String(reportId)) : null

    if (matched) {
      if (infowindowRef.current) infowindowRef.current.close()
      matched.infowindow.open(mapObj.current, matched.marker)
      infowindowRef.current = matched.infowindow
      onPinClick?.(matched.pin)
    }
  }, [focusReportRequest, pins, onPinClick])

  useEffect(() => {
    if (!searchRequest || !mapObj.current || !window.kakao?.maps) return

    const { kakao } = window

    const moveToPlace = (place) => {
      if (!place) return
      const lat = Number(place.y ?? place.lat ?? place.latitude)
      const lng = Number(place.x ?? place.lng ?? place.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

      const latlng = new kakao.maps.LatLng(lat, lng)
      mapObj.current.setCenter(latlng)
      mapObj.current.setLevel(4)

      if (searchMarkerRef.current) searchMarkerRef.current.setMap(null)
      searchMarkerRef.current = new kakao.maps.Marker({
        map: mapObj.current,
        position: latlng,
        title: place.place_name || place.address_name || '검색 위치',
      })

      onSearchResult?.({ ok: true, place })
    }

    if (searchRequest.place) {
      moveToPlace(searchRequest.place)
      return
    }

    if (!searchRequest.keyword || !window.kakao?.maps?.services) return
    const keyword = searchRequest.keyword.trim()
    if (!keyword) return

    const places = new kakao.maps.services.Places()

    places.keywordSearch(keyword, (data, status) => {
      if (status !== kakao.maps.services.Status.OK || !data?.length) {
        onSearchResult?.({ ok: false, message: '검색 결과가 없습니다.' })
        return
      }

      moveToPlace(data[0])
    })
  }, [searchRequest, onSearchResult])

  useEffect(() => {
    if (!locateRequest || !navigator.geolocation || !mapObj.current || !window.kakao?.maps) return

    navigator.geolocation.getCurrentPosition((pos) => {
      const { kakao } = window
      saveLocation(pos.coords.latitude, pos.coords.longitude)
      const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      drawMyLocation(kakao, latlng, true)
    }, () => {
      onSearchResult?.({ ok: false, message: '현재 위치를 가져오지 못했습니다.' })
    }, { enableHighAccuracy: true, timeout: 5000 })
  }, [locateRequest, onSearchResult])

  const handleZoomIn = () => {
    if (!mapObj.current) return
    mapObj.current.setLevel(mapObj.current.getLevel() - 1)
  }

  const handleZoomOut = () => {
    if (!mapObj.current) return
    mapObj.current.setLevel(mapObj.current.getLevel() + 1)
  }

  const handleMyLocation = () => {
    if (!navigator.geolocation || !mapObj.current || !window.kakao?.maps) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const { kakao } = window
      saveLocation(pos.coords.latitude, pos.coords.longitude)
      const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      drawMyLocation(kakao, latlng, true)
    })
  }

  return (
    <div className="kakao-map-shell" style={styles.shell}>
      <div ref={mapRef} className="kakao-map" style={styles.map} />
      {mapReady && (
        <HeatmapLayer
          map={mapObj.current}
          coordinates={heatmapPoints}
          threshold={3}
        />
      )}
      <div style={styles.controlBox}>
        <button type="button" style={styles.controlBtn} onClick={handleZoomIn}>+</button>
        <div style={styles.divider} />
        <button type="button" style={styles.controlBtn} onClick={handleZoomOut}>−</button>
        <div style={styles.divider} />
        <button type="button" style={styles.controlBtn} onClick={handleMyLocation}>🎯</button>
      </div>
      <div style={styles.heatmapLegend}>
        <span style={styles.legendDot} /> 제보 밀집/공감 위험도
      </div>
    </div>
  )
}

const styles = {
  shell: { position: 'relative', flex: 1, height: '100%' },
  map: { width: '100%', height: '100%' },
  controlBox: {
    position: 'absolute', top: '18px', left: '18px',
    display: 'flex', flexDirection: 'column',
    background: '#fff', borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    overflow: 'hidden', zIndex: 20,
  },
  controlBtn: {
    width: '42px', height: '42px', border: 'none', background: '#fff',
    fontSize: '21px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#374151', fontWeight: '600',
  },
  divider: { height: '1px', background: '#e2e8f0', margin: '0 6px' },
  heatmapLegend: {
    position: 'absolute', left: '16px', bottom: '16px',
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 10px', background: 'rgba(255,255,255,0.94)',
    border: '1px solid #e5e7eb', borderRadius: '10px',
    fontSize: '12px', color: '#374151', fontWeight: '700',
    boxShadow: '0 2px 8px rgba(15,23,42,0.12)', zIndex: 20,
  },
  legendDot: {
    width: '12px', height: '12px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #facc15, #f97316, #ef4444)',
    display: 'inline-block',
  },
}

export default KakaoMap
