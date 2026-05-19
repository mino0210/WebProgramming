import { useEffect, useRef } from 'react'
import { getReports } from '../../api/reportApi'

function KakaoMap({ pins, onMapClick, onPinsLoaded }) {
  const mapRef  = useRef(null)
  const mapObj  = useRef(null)
  const markers = useRef({})

  useEffect(() => {
    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(initMap, 300)
        return
      }
      const { kakao } = window
      mapObj.current = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(37.3, 127.0),
        level: 7,
      })
      setTimeout(() => {
        mapObj.current.relayout()
      }, 100)
      kakao.maps.event.addListener(mapObj.current, 'click', (e) => {
        onMapClick?.({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })
      })
      getReports().then((res) => onPinsLoaded?.(res.data))
    }
    initMap()
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

  return <div ref={mapRef} className="kakao-map" style={{ width: '100%', height: '600px', display: 'block' }} />
}

export default KakaoMap