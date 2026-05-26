import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import KakaoMap from '../components/map/KakaoMap'
import ReportFeed from '../components/report/ReportFeed'
import ReportModal from '../components/report/ReportModal'
import CategoryFilter from '../components/common/CategoryFilter'
import AlertBanner from '../components/common/AlertBanner'
import Header from '../components/common/Header'
import { useWebSocket } from '../hooks/useWebSocket'
import { getReports, getCategories } from '../api/reportApi'

const normalizeList = (response) => response?.data?.data ?? response?.data ?? response ?? []
const normalizeItem = (response) => response?.data?.data ?? response?.data ?? response ?? null
const getReportId = (pin) => pin?.reportId ?? pin?.id
const DENSITY_RANGE = 0.01
const DENSITY_THRESHOLD = 3

function getNearbyCount(target, list, range = DENSITY_RANGE) {
  const targetLat = Number(target?.latitude ?? target?.lat)
  const targetLng = Number(target?.longitude ?? target?.lng)

  if (!Number.isFinite(targetLat) || !Number.isFinite(targetLng)) return 0

  return list.filter((pin) => {
    const lat = Number(pin.latitude ?? pin.lat)
    const lng = Number(pin.longitude ?? pin.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
    return Math.abs(targetLat - lat) <= range && Math.abs(targetLng - lng) <= range
  }).length
}

function getNearbyPins(target, list, range = DENSITY_RANGE) {
  const targetLat = Number(target?.latitude ?? target?.lat)
  const targetLng = Number(target?.longitude ?? target?.lng)
  if (!Number.isFinite(targetLat) || !Number.isFinite(targetLng)) return []

  return list.filter((pin) => {
    const lat = Number(pin?.latitude ?? pin?.lat)
    const lng = Number(pin?.longitude ?? pin?.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
    return Math.abs(targetLat - lat) <= range && Math.abs(targetLng - lng) <= range
  })
}

function getRiskScore(target, list, range = DENSITY_RANGE) {
  const nearby = getNearbyPins(target, list, range)
  const sympathy = Number(target?.sympathyCount || 0)
  const maxSympathy = Math.max(sympathy, ...nearby.map((pin) => Number(pin?.sympathyCount || 0)), 0)
  return {
    nearby,
    count: nearby.length,
    score: maxSympathy + nearby.length,
  }
}

function collectDangerAreaIds(list, range = DENSITY_RANGE, threshold = DENSITY_THRESHOLD) {
  const dangerIds = new Set()

  list.forEach((seed) => {
    const risk = getRiskScore(seed, list, range)
    if (risk.score >= threshold) {
      risk.nearby.forEach((pin) => {
        const id = getReportId(pin)
        if (id != null) dangerIds.add(String(id))
      })
    }
  })

  return dangerIds
}

function getCurrentLatLng() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      try {
        localStorage.setItem('safePinLastLocation', JSON.stringify({ ...latLng, updatedAt: Date.now() }))
      } catch {
        // localStorage 사용 불가 환경에서는 무시합니다.
      }
      resolve(latLng)
    }, () => resolve(null), { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 })
  })
}

function MapPage() {
  const location = useLocation()
  const [pins, setPins] = useState([])
  const [alerts, setAlerts] = useState([])
  const [alertsEnabled, setAlertsEnabled] = useState(() => localStorage.getItem('safePinAlertsEnabled') !== 'false')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dangerOnly, setDangerOnly] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [clickedLatLng, setClickedLatLng] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedPin, setSelectedPin] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchRequest, setSearchRequest] = useState(null)
  const [locateRequest, setLocateRequest] = useState(0)
  const [focusReportRequest, setFocusReportRequest] = useState(null)
  const [searchCandidates, setSearchCandidates] = useState([])
  const [showSearchCandidates, setShowSearchCandidates] = useState(false)
  const densityAlertKeysRef = useRef(new Set())

  useEffect(() => {
    localStorage.setItem('safePinAlertsEnabled', alertsEnabled ? 'true' : 'false')
  }, [alertsEnabled])

  const addAlert = useCallback((alert) => {
    if (!alertsEnabled || !alert) return
    const alertId = alert.id || `${alert.type || 'alert'}-${alert.reportId || Date.now()}-${alert.count || 0}`
    setAlerts((prev) => [{ ...alert, id: alertId, receivedAt: new Date().toISOString() }, ...prev].slice(0, 8))
  }, [alertsEnabled])

  const maybeAddDensityAlert = useCallback((pin, nextPins) => {
    if (!pin) return
    const risk = getRiskScore(pin, nextPins)
    if (risk.score < DENSITY_THRESHOLD) return

    const reportId = getReportId(pin) || `${pin.latitude ?? pin.lat}-${pin.longitude ?? pin.lng}`
    const key = `${reportId}-risk-shown`
    if (densityAlertKeysRef.current.has(key)) return

    densityAlertKeysRef.current.add(key)
    addAlert({
      type: 'density',
      reportId,
      title: pin.title || '주변 제보 집중 발생',
      categoryName: pin.categoryName,
      count: risk.count,
      score: risk.score,
    })
  }, [addAlert])

  const loadReports = useCallback(() => {
    getReports(selectedCategory)
      .then((res) => {
        setPins(normalizeList(res))
        setLastUpdated(new Date())
      })
      .catch((error) => console.error('[MapPage] 제보 조회 실패:', error))
  }, [selectedCategory])

  useEffect(() => {
    const focusReport = location.state?.focusReport
    if (!focusReport) return

    setSelectedCategory(null)
    setDangerOnly(false)
    setSelectedPin(focusReport)
    setFocusReportRequest({ ...focusReport, requestedAt: Date.now() })
    window.history.replaceState({}, document.title, window.location.pathname)
  }, [location.state])

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(normalizeList(res)))
      .catch((error) => console.error('[MapPage] 카테고리 조회 실패:', error))
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    const keyword = searchKeyword.trim()
    if (keyword.length < 2 || !window.kakao?.maps?.services) {
      setSearchCandidates([])
      return undefined
    }

    const timer = window.setTimeout(() => {
      const places = new window.kakao.maps.services.Places()
      places.keywordSearch(keyword, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && Array.isArray(data)) {
          setSearchCandidates(data.slice(0, 6))
        } else {
          setSearchCandidates([])
        }
      })
    }, 220)

    return () => window.clearTimeout(timer)
  }, [searchKeyword])

  useWebSocket({
    onNewPin: (pin) => {
      setPins((prev) => {
        const reportId = getReportId(pin)
        if (reportId && prev.some((item) => getReportId(item) === reportId)) return prev
        const next = [pin, ...prev]
        maybeAddDensityAlert(pin, next)
        return next
      })
      setLastUpdated(new Date())
    },
    onSympathy: (data) => {
      setPins((prev) => {
        const next = prev.map((p) =>
          getReportId(p) === data.reportId
            ? { ...p, sympathyCount: data.count }
            : p
        )
        const matched = next.find((pin) => getReportId(pin) === data.reportId)
        maybeAddDensityAlert(matched, next)
        return next
      })
    },
    onAlert: addAlert,
  })

  const handlePinsUpdate = (result) => {
    const data = normalizeItem(result)
    if (!data) return

    setPins((prev) => {
      const next = prev.map((p) =>
        getReportId(p) === data.reportId
          ? { ...p, sympathyCount: data.count }
          : p
      )
      const matched = next.find((pin) => getReportId(pin) === data.reportId)
      maybeAddDensityAlert(matched, next)
      return next
    })
  }

  const handleResolved = (reportId) => {
    setPins((prev) =>
      prev.map((p) =>
        getReportId(p) === reportId
          ? { ...p, status: 'RESOLVED' }
          : p
      )
    )
  }

  const dangerAreaIds = useMemo(() => collectDangerAreaIds(pins), [pins])

  const visiblePins = useMemo(() => {
    return pins.filter((pin) => {
      if (selectedCategory && Number(pin.categoryId) === Number(selectedCategory)) {
        // pass
      } else if (selectedCategory && pin.categoryId == null) {
        const cat = categories.find((item) => Number(item.id) === Number(selectedCategory))
        if (cat && pin.categoryName !== cat.name) return false
      } else if (selectedCategory && pin.categoryId != null && Number(pin.categoryId) !== Number(selectedCategory)) {
        return false
      }

      if (!dangerOnly) return true
      const reportId = getReportId(pin)
      return Number(pin.sympathyCount || 0) >= DENSITY_THRESHOLD || dangerAreaIds.has(String(reportId))
    })
  }, [pins, selectedCategory, dangerOnly, categories, dangerAreaIds])

  const handleRefresh = () => loadReports()

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const keyword = searchKeyword.trim()
    if (!keyword) return

    const firstCandidate = searchCandidates[0]
    setShowSearchCandidates(false)
    setSearchRequest({ keyword, place: firstCandidate || null, requestedAt: Date.now() })
  }

  const handleSearchCandidateSelect = (place) => {
    if (!place) return
    setSearchKeyword(place.place_name || place.address_name || '')
    setShowSearchCandidates(false)
    setSearchRequest({ keyword: place.place_name || place.address_name || '', place, requestedAt: Date.now() })
  }

  const openReportAtCurrentLocation = async () => {
    const current = await getCurrentLatLng()
    setClickedLatLng(current || { lat: 37.3, lng: 127.0 })
    setModalOpen(true)
  }

  const handleSearchResult = useCallback((result) => {
    if (!result) return
    // 검색/현재 위치 상태 문구는 UI에 노출하지 않습니다.
  }, [])

  const handleSubmitted = (response) => {
    const newPin = normalizeItem(response)
    if (!newPin) return

    setPins((prev) => {
      const reportId = getReportId(newPin)
      if (reportId && prev.some((item) => getReportId(item) === reportId)) return prev
      const next = [newPin, ...prev]
      maybeAddDensityAlert(newPin, next)
      return next
    })
    setLastUpdated(new Date())
    setSelectedPin(newPin)
  }

  const pad = (n) => n.toString().padStart(2, '0')
  const timeStr = `${pad(lastUpdated.getHours())}:${pad(lastUpdated.getMinutes())}`
  return (
    <div className="map-page" style={styles.page}>
      <Header />
      <AlertBanner alerts={alerts} />

      <form className="search-row" style={styles.searchRow} onSubmit={handleSearchSubmit}>
        <div className="search-box" style={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            style={styles.searchInput}
            placeholder="지역명 또는 주소 검색"
            value={searchKeyword}
            onFocus={() => setShowSearchCandidates(true)}
            onBlur={() => window.setTimeout(() => setShowSearchCandidates(false), 160)}
            onChange={(e) => {
              setSearchKeyword(e.target.value)
              setShowSearchCandidates(true)
            }}
          />
          <button type="submit" style={styles.searchBtn}>검색</button>

          {showSearchCandidates && searchCandidates.length > 0 && (
            <div style={styles.searchCandidates}>
              {searchCandidates.map((place) => (
                <button
                  key={place.id || `${place.x}-${place.y}-${place.place_name}`}
                  type="button"
                  style={styles.searchCandidateItem}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSearchCandidateSelect(place)
                  }}
                >
                  <span style={styles.candidateName}>{place.place_name}</span>
                  <span style={styles.candidateAddress}>{place.road_address_name || place.address_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" style={styles.locationBtn} onClick={() => setLocateRequest((prev) => prev + 1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          내 위치
        </button>
        <button
          type="button"
          style={styles.reportBtn}
          onClick={openReportAtCurrentLocation}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          제보하기
        </button>
        </form>

      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
        dangerOnly={dangerOnly}
        onDangerOnlyChange={setDangerOnly}
      />


      <div className="main-layout" style={styles.main}>
        <div className="map-panel" style={styles.mapArea}>
          <KakaoMap
            pins={visiblePins}
            onMapClick={(latLng) => { setClickedLatLng(latLng); setModalOpen(true) }}
            onPinsLoaded={setPins}
            onPinClick={(pin) => setSelectedPin(pin)}
            searchRequest={searchRequest}
            locateRequest={locateRequest}
            onSearchResult={handleSearchResult}
            heatmapPins={pins}
            focusReportRequest={focusReportRequest}
            selectedReportId={getReportId(selectedPin)}
          />
        </div>
        <ReportFeed
          pins={visiblePins}
          selectedPin={selectedPin}
          onPinSelect={setSelectedPin}
          onPinsUpdate={handlePinsUpdate}
          onResolved={handleResolved}
          alertsEnabled={alertsEnabled}
          onToggleAlerts={() => setAlertsEnabled((prev) => !prev)}
        />
      </div>

      <footer className="app-footer" style={styles.footer}>
        <span style={styles.footerItem}>🛡️ 안전이 최우선입니다</span>
        <span style={styles.footerDivider}>|</span>
        <span style={styles.footerItem}>긴급상황 시 <strong style={{ color: '#fff', marginLeft: '4px' }}>119</strong></span>
        <span style={styles.footerDivider}>|</span>
        <span style={styles.footerItem}>💬 재난문자 수신 설정</span>
        <span style={styles.footerDivider}>|</span>
        <span style={styles.footerItem}>📞 문의: 010-9296-7530</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          데이터 업데이트: {timeStr}
          <button style={styles.refreshBtn} onClick={handleRefresh} title="새로고침">🔄</button>
        </span>
      </footer>

      {modalOpen && (
        <ReportModal
          latLng={clickedLatLng}
          onClose={() => setModalOpen(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  )
}

const styles = {
  page: {
    display: 'flex', flexDirection: 'column',
    height: '100vh', overflow: 'hidden',
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    background: '#f8fafc',
  },
  searchRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px 26px', background: 'linear-gradient(180deg, #ffffff, #f8fbff)',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
    flexShrink: 0,
    position: 'relative',
  },
  searchBox: {
    flex: 1, display: 'flex', alignItems: 'center',
    border: '1.8px solid #dbeafe', borderRadius: '16px',
    padding: '0 10px 0 16px', background: '#fff', height: '52px', gap: '11px',
    boxShadow: '0 8px 22px rgba(37,99,235,0.06)',
    position: 'relative',
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    background: 'transparent', fontSize: '16px', fontWeight: '700', color: '#334155',
    cursor: 'text',
  },
  searchBtn: {
    border: 'none', borderRadius: '10px', background: '#2563eb', color: '#fff',
    fontSize: '16px', fontWeight: '900', padding: '11px 18px', cursor: 'pointer',
    boxShadow: '0 6px 14px rgba(37,99,235,0.18)',
  },
  searchCandidates: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '60px',
    padding: '8px',
    background: '#fff',
    border: '1px solid #dbeafe',
    borderRadius: '14px',
    boxShadow: '0 16px 34px rgba(15,23,42,0.16)',
    zIndex: 80,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  searchCandidateItem: {
    border: 'none',
    background: '#fff',
    borderRadius: '10px',
    padding: '10px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  candidateName: { fontSize: '14px', fontWeight: '900', color: '#0f172a' },
  candidateAddress: { fontSize: '12px', fontWeight: '700', color: '#64748b' },
  locationBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '0 20px', height: '48px',
    border: '1.5px solid #3b82f6', borderRadius: '10px',
    background: '#fff', color: '#3b82f6',
    fontSize: '15px', fontWeight: '900', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  reportBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '0 24px', height: '52px',
    border: 'none', borderRadius: '14px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
    fontSize: '14px', fontWeight: '900', cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 10px 22px rgba(239,68,68,0.24)',
  },
  main: { flex: 1, display: 'flex', overflow: 'hidden', padding: '14px 14px 0', gap: '14px', background: '#eef4fb' },
  mapArea: { flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '18px', border: '1px solid #dbeafe', boxShadow: '0 16px 38px rgba(15,23,42,0.10)', background: '#fff' },
  footer: {
    display: 'flex', alignItems: 'center',
    padding: '8px 20px', background: '#0f172a', color: '#94a3b8',
    fontSize: '13px', fontWeight: '700', flexShrink: 0, gap: '10px', flexWrap: 'wrap',
  },
  footerItem: { whiteSpace: 'nowrap' },
  footerDivider: { color: '#334155' },
  refreshBtn: {
    background: 'none', border: 'none',
    color: '#94a3b8', fontSize: '18px',
    cursor: 'pointer', padding: '2px',
  },
}

export default MapPage
