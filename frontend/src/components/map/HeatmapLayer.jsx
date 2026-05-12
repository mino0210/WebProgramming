import { useEffect, useRef } from 'react'
import h337 from 'heatmap.js'

function getLatitude(item) {
    return item.latitude ?? item.lat
}

function getLongitude(item) {
    return item.longitude ?? item.lng
}

function getWeight(item) {
    return item.sympathyCount ?? item.count ?? item.weight ?? 1
}

function HeatmapLayer({ map, coordinates = [], threshold = 1 }) {
    const containerRef = useRef(null)
    const heatmapRef = useRef(null)

    useEffect(() => {
        if (!map || !window.kakao || !window.kakao.maps) return

        const mapNode = map.getNode?.()
        if (!mapNode) return

        const heatmapContainer = document.createElement('div')
        heatmapContainer.className = 'heatmap-layer'

        // heatmap-layer가 absolute로 올라가야 해서 기준점만 잡아줌
        if (getComputedStyle(mapNode).position === 'static') {
            mapNode.style.position = 'relative'
        }

        mapNode.appendChild(heatmapContainer)

        containerRef.current = heatmapContainer
        heatmapRef.current = h337.create({
            container: heatmapContainer,
            radius: 45,
            maxOpacity: 0.55,
            minOpacity: 0,
            blur: 0.85,
            gradient: {
                0.2: '#ef4444',
                0.5: '#ef4444',
                0.8: '#ef4444',
                1.0: '#ef4444',
            }
        })

        return () => {
            heatmapRef.current = null
            containerRef.current?.remove()
            containerRef.current = null
        }
    }, [map])

    useEffect(() => {
        if (!map || !heatmapRef.current || !containerRef.current) return
        if (!window.kakao || !window.kakao.maps) return

        const renderHeatmap = () => {
            const projection = map.getProjection()
            if (!projection) return

            const points = coordinates
                .map((item) => {
                    const latitude = getLatitude(item)
                    const longitude = getLongitude(item)
                    const weight = getWeight(item)

                    if (!latitude || !longitude) return null
                    if (weight < threshold) return null

                    const latlng = new window.kakao.maps.LatLng(latitude, longitude)
                    const point = projection.containerPointFromCoords(latlng)

                    return {
                        x: Math.round(point.x),
                        y: Math.round(point.y),
                        value: weight,
                    }
                })
                .filter(Boolean)

            const maxValue = Math.max(1, ...points.map((point) => point.value))

            heatmapRef.current.setData({
                min: 0,
                max: maxValue,
                data: points,
            })
        }

        renderHeatmap()

        const events = window.kakao.maps.event

        events.addListener(map, 'center_changed', renderHeatmap)
        events.addListener(map, 'zoom_changed', renderHeatmap)
        events.addListener(map, 'bounds_changed', renderHeatmap)
        window.addEventListener('resize', renderHeatmap)

        return () => {
            events.removeListener(map, 'center_changed', renderHeatmap)
            events.removeListener(map, 'zoom_changed', renderHeatmap)
            events.removeListener(map, 'bounds_changed', renderHeatmap)
            window.removeEventListener('resize', renderHeatmap)
        }
    }, [map, coordinates, threshold])

    return null
}

export default HeatmapLayer