import { useEffect, useRef } from 'react'

const DEFAULT_RANGE = 0.01

function getLatitude(item) {
  return Number(item?.latitude ?? item?.lat)
}

function getLongitude(item) {
  return Number(item?.longitude ?? item?.lng)
}

function getReportId(item) {
  return item?.reportId ?? item?.id
}

function getWeight(item) {
  return Number(item?.sympathyCount ?? item?.count ?? item?.weight ?? 1) || 1
}

function getDistanceMeters(a, b) {
  const lat1 = getLatitude(a)
  const lng1 = getLongitude(a)
  const lat2 = getLatitude(b)
  const lng2 = getLongitude(b)

  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return 0

  const earthRadius = 6371000
  const toRad = (value) => (value * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const rLat1 = toRad(lat1)
  const rLat2 = toRad(lat2)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) ** 2

  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

function makeClusters(points, range = DEFAULT_RANGE) {
  const validPoints = points
    .map((item) => ({
      ...item,
      _lat: getLatitude(item),
      _lng: getLongitude(item),
      _weight: getWeight(item),
    }))
    .filter((item) => Number.isFinite(item._lat) && Number.isFinite(item._lng))

  const visited = new Set()
  const clusters = []

  validPoints.forEach((seed, seedIndex) => {
    const seedId = getReportId(seed) ?? seedIndex
    if (visited.has(seedId)) return

    const group = validPoints.filter((candidate, candidateIndex) => {
      const candidateId = getReportId(candidate) ?? candidateIndex
      const near = Math.abs(seed._lat - candidate._lat) <= range && Math.abs(seed._lng - candidate._lng) <= range
      if (near) visited.add(candidateId)
      return near
    })

    const totalWeight = group.reduce((sum, item) => sum + Math.max(1, item._weight), 0)
    const centerLat = group.reduce((sum, item) => sum + item._lat, 0) / group.length
    const centerLng = group.reduce((sum, item) => sum + item._lng, 0) / group.length
    const maxSympathy = Math.max(...group.map((item) => item._weight), 0)
    const maxDistance = Math.max(
      ...group.map((item) => getDistanceMeters({ latitude: centerLat, longitude: centerLng }, item)),
      0
    )

    clusters.push({
      center: { latitude: centerLat, longitude: centerLng },
      count: group.length,
      weight: Math.max(totalWeight, maxSympathy),
      maxSympathy,
      radius: Math.max(350, Math.min(1800, maxDistance + 360)),
      points: group,
    })
  })

  return clusters
}

function getRiskStyle(cluster, threshold) {
  const score = Math.max(cluster.count, cluster.maxSympathy, cluster.weight / 2)

  if (score >= threshold + 3) {
    return { fillColor: '#ef4444', opacity: 0.2 }
  }

  if (score >= threshold + 1) {
    return { fillColor: '#f97316', opacity: 0.18 }
  }

  return { fillColor: '#f59e0b', opacity: 0.16 }
}

function drawSoftHeatCircle(map, center, radius, style) {
  const layers = [
    { radius: radius * 1.08, opacity: style.opacity * 0.38 },
    { radius: radius * 0.82, opacity: style.opacity * 0.62 },
    { radius: radius * 0.55, opacity: style.opacity },
  ]

  return layers.map((layer) => {
    const circle = new window.kakao.maps.Circle({
      center,
      radius: layer.radius,
      strokeWeight: 0,
      strokeOpacity: 0,
      fillColor: style.fillColor,
      fillOpacity: layer.opacity,
      zIndex: 1,
    })

    circle.setMap(map)
    return circle
  })
}

function HeatmapLayer({ map, coordinates = [], threshold = 3, range = DEFAULT_RANGE }) {
  const overlaysRef = useRef([])

  useEffect(() => {
    if (!map || !window.kakao?.maps) return undefined

    overlaysRef.current.forEach((overlay) => overlay.setMap(null))
    overlaysRef.current = []

    const clusters = makeClusters(coordinates, range).filter((cluster) => {
      return cluster.count >= threshold || cluster.maxSympathy >= threshold
    })

    clusters.forEach((cluster) => {
      const style = getRiskStyle(cluster, threshold)
      const center = new window.kakao.maps.LatLng(cluster.center.latitude, cluster.center.longitude)
      const circles = drawSoftHeatCircle(map, center, cluster.radius, style)
      overlaysRef.current.push(...circles)
    })

    return () => {
      overlaysRef.current.forEach((overlay) => overlay.setMap(null))
      overlaysRef.current = []
    }
  }, [map, coordinates, threshold, range])

  return null
}

export default HeatmapLayer
