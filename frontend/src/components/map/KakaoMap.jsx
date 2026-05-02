import { useEffect, useRef } from 'react'
import { getReports } from '../../api/reportApi'

// TODO: 팀원 A 담당
function KakaoMap({ pins, onMapClick, onPinsLoaded }) {
  const mapRef  = useRef(null)
  const mapObj  = useRef(null)
  const markers = useRef({})

  useEffect(() => {
    const { kakao } = window
    mapObj.current = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.3, 127.0),
      level: 7,
    })
    kakao.maps.event.addListener(mapObj.current, 'click', (e) => {
      onMapClick?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
    })
    getReports().then((res) => onPinsLoaded?.(res.data))
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

  return <div ref={mapRef} style={{ flex: 1, height: '100%' }} />
}

export default KakaoMap
