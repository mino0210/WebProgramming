import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getReports } from '../../api/reportApi'

const normalizeList = (response) => response?.data?.data ?? response?.data ?? response ?? []

function isResolved(report) {
  const status = String(report?.status || '').toUpperCase()
  return status === 'RESOLVED' || status === 'DONE' || report?.resolved === true
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const nickname = localStorage.getItem('nickname') || null
  const [reports, setReports] = useState([])
  const [alertOpen, setAlertOpen] = useState(false)
  const alertRef = useRef(null)

  useEffect(() => {
    let mounted = true
    getReports()
      .then((res) => {
        if (mounted) setReports(normalizeList(res))
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!alertRef.current) return
      if (!alertRef.current.contains(event.target)) setAlertOpen(false)
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alertItems = useMemo(() => {
    const dangerReports = reports
      .filter((report) => !isResolved(report))
      .filter((report) => Number(report.sympathyCount || 0) >= 3)
      .slice(0, 5)

    if (dangerReports.length > 0) return dangerReports

    return reports
      .filter((report) => !isResolved(report))
      .slice(0, 5)
  }, [reports])

  const alertCount = alertItems.length

  const handleLogout = () => {
    localStorage.removeItem('memberId')
    localStorage.removeItem('nickname')
    navigate('/login')
  }

  const navItems = [
    { label: '지도', path: '/' },
    { label: '제보 내역', path: '/my-reports' },
    { label: '재난 가이드', path: '/guide' },
    { label: '통계', path: '/stats' },
  ]

  return (
    <header style={styles.header}>
      <div style={styles.logo} onClick={() => navigate('/')}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span style={styles.logoText}>SafePin</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <span
              key={item.label}
              style={{
                ...styles.navItem,
                color: isActive ? '#1d4ed8' : '#4b5563',
                borderBottom: isActive ? '2px solid #1d4ed8' : '2px solid transparent',
                fontWeight: isActive ? '900' : '700',
              }}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </span>
          )
        })}
      </nav>

      <div style={styles.right}>
        <div ref={alertRef} style={styles.alertArea}>
          <button style={styles.iconBtn} onClick={() => setAlertOpen((prev) => !prev)}>
            <div style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {alertCount > 0 && <span style={styles.badge}>{alertCount}</span>}
            </div>
            알림
          </button>

          {alertOpen && (
            <div style={styles.alertDropdown}>
              <div style={styles.alertHeader}>
                <strong>실시간 알림</strong>
                <span>{alertCount}건</span>
              </div>
              <div style={styles.alertList}>
                {alertItems.length === 0 ? (
                  <div style={styles.emptyAlert}>
                    현재 확인할 위험 알림이 없습니다.
                  </div>
                ) : (
                  alertItems.map((report) => (
                    <button
                      key={report.reportId ?? report.id}
                      style={styles.alertItem}
                      onClick={() => {
                        setAlertOpen(false)
                        navigate('/')
                      }}
                    >
                      <span style={styles.alertDot} />
                      <span style={styles.alertBody}>
                        <strong>{report.title || '제보 제목 없음'}</strong>
                        <small>{report.categoryName || '기타'} · 공감 {report.sympathyCount || 0}명</small>
                      </span>
                      <span style={styles.alertStatus}>{isResolved(report) ? '완료' : '진행'}</span>
                    </button>
                  ))
                )}
              </div>
              <button
                style={styles.alertFooter}
                onClick={() => {
                  setAlertOpen(false)
                  navigate('/my-reports')
                }}
              >
                제보 내역에서 전체 확인
              </button>
            </div>
          )}
        </div>

        {nickname ? (
          <button style={styles.iconBtn} onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            로그아웃
          </button>
        ) : (
          <button style={styles.iconBtn} onClick={() => navigate('/login')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            로그인
          </button>
        )}
      </div>
    </header>
  )
}

const styles = {
  header: {
    display: 'flex', alignItems: 'center',
    padding: '0 30px', height: '66px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0, gap: '40px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'relative',
    zIndex: 200,
  },
  logo: { display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', flexShrink: 0 },
  logoText: { fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.3px' },
  nav: { display: 'flex', flex: 1 },
  navItem: {
    padding: '0 19px', fontSize: '16px', height: '66px',
    display: 'flex', alignItems: 'center', transition: 'color 0.15s',
    whiteSpace: 'nowrap', boxSizing: 'border-box', cursor: 'pointer',
  },
  right: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  alertArea: { position: 'relative' },
  iconBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
    border: 'none', background: 'none', color: '#4b5563', fontSize: '15px',
    cursor: 'pointer', fontWeight: '700', borderRadius: '8px', transition: 'background 0.12s',
  },
  badge: {
    position: 'absolute', top: '-5px', right: '-6px', background: '#ef4444',
    color: '#fff', fontSize: '10px', fontWeight: '900', width: '16px', height: '16px',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  alertDropdown: {
    position: 'absolute', right: 0, top: '44px', width: '340px', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '16px',
    boxShadow: '0 18px 40px rgba(15,23,42,0.18)', overflow: 'hidden', zIndex: 300,
  },
  alertHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
    fontSize: '14px', color: '#0f172a',
  },
  alertList: { display: 'flex', flexDirection: 'column', maxHeight: '280px', overflowY: 'auto' },
  emptyAlert: { padding: '24px 16px', color: '#64748b', fontSize: '13px', fontWeight: '700', textAlign: 'center' },
  alertItem: {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px',
    border: 'none', borderBottom: '1px solid #f1f5f9', background: '#fff', textAlign: 'left', cursor: 'pointer',
  },
  alertDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 5px #fee2e2', flexShrink: 0 },
  alertBody: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0, color: '#0f172a' },
  alertStatus: { padding: '3px 8px', borderRadius: '999px', background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: '900' },
  alertFooter: {
    width: '100%', padding: '12px 14px', border: 'none', background: '#f8fbff',
    color: '#2563eb', fontSize: '13px', fontWeight: '900', cursor: 'pointer',
  },
}

export default Header
