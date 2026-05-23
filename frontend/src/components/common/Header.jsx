import { useNavigate, useLocation } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const nickname = localStorage.getItem('nickname') || null

  const handleLogout = () => {
    localStorage.removeItem('memberId')
    localStorage.removeItem('nickname')
    navigate('/login')
  }

  const navItems = [
    { label: '지도',       path: '/' },
    { label: '제보 내역',  path: '/my-reports' },
    { label: '공지사항',   path: null },
    { label: '재난 가이드', path: null },
    { label: '통계',       path: null },
  ]

  return (
      <header style={styles.header}>
        {/* 로고 */}
        <div style={styles.logo} onClick={() => navigate('/')}>
          {/* 🛡️ 파란 테두리 방패 아이콘으로 변경 */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span style={styles.logoText}>실시간 재난 제보</span>
        </div>

        {/* 네비게이션 */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
                <span
                    key={item.label}
                    style={{
                      ...styles.navItem,
                      color: !item.path ? '#d1d5db' : isActive ? '#1d4ed8' : '#4b5563',
                      borderBottom: isActive ? '2px solid #1d4ed8' : '2px solid transparent',
                      cursor: item.path ? 'pointer' : 'default',
                      fontWeight: isActive ? '700' : '400',
                    }}
                    onClick={() => item.path && navigate(item.path)}
                >
              {item.label}
            </span>
            )
          })}
        </nav>

        {/* 우측 */}
        <div style={styles.right}>
          <button style={styles.iconBtn}>
            <div style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={styles.badge}>3</span>
            </div>
            알림
          </button>

          {nickname ? (
              <button style={styles.iconBtn} onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                로그아웃
              </button>
          ) : (
              <button style={styles.iconBtn} onClick={() => navigate('/login')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
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
    padding: '0 24px', height: '56px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: 0, gap: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '9px',
    cursor: 'pointer', flexShrink: 0,
  },
  logoText: {
    fontSize: '17px', fontWeight: '800',
    color: '#111827', letterSpacing: '-0.3px',
  },
  nav: { display: 'flex', flex: 1 },
  navItem: {
    padding: '0 16px', fontSize: '14px',
    height: '56px', display: 'flex', alignItems: 'center',
    transition: 'color 0.15s', whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  right: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 },
  iconBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', border: 'none',
    background: 'none', color: '#4b5563',
    fontSize: '13px', cursor: 'pointer', fontWeight: '500',
    borderRadius: '8px',
    transition: 'background 0.12s',
  },
  badge: {
    position: 'absolute', top: '-5px', right: '-6px',
    background: '#ef4444', color: '#fff',
    fontSize: '9px', fontWeight: '800',
    width: '14px', height: '14px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}

export default Header