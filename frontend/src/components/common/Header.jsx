// TODO: 팀원 A 담당
import { useNavigate } from 'react-router-dom'

function Header() {

  const navigate = useNavigate()
  const nickname = localStorage.getItem('nickname') || null

  const handleLogout = () => {
    localStorage.removeItem('memberId')
    localStorage.removeItem('nickname')
    navigate('/login')
  }

  return (
      <header style={styles.header}>
        {/* 로고 */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🛡️</div>
          <span style={styles.logoText}>실시간 재난 제보</span>
        </div>

        {/* 네비게이션 */}
        <nav style={styles.nav}>
          {['지도', '제보 내역', '공지사항', '재난 가이드', '통계'].map((menu, i) => (
              <span key={menu} style={{ ...styles.navItem, ...(i === 0 ? styles.navActive : {}) }}>
            {menu}
          </span>
          ))}
        </nav>

        {/* 우측 버튼 */}
        <div style={styles.right}>
          <button style={styles.alarmBtn}>🔔 알림</button>
          {nickname ? (
              <button style={styles.loginBtn} onClick={handleLogout}>
                👤 로그아웃
              </button>
          ) : (
              <button style={styles.loginBtn} onClick={() => navigate('/login')}>
                👤 로그인
              </button>
          )}
        </div>
      </header>
  )

  // 변경: style → className (layout.css의 .header)
  return <header className="header">재난 안전 지도</header>

}

const styles = {
  header: {
    display: 'flex', alignItems: 'center',
    padding: '0 24px', height: '56px',
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    flexShrink: 0, gap: '32px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  logoIcon: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: '#1e40af', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '16px',
  },
  logoText: { fontSize: '18px', fontWeight: '800', color: '#1e293b' },
  nav: { display: 'flex', gap: '4px', flex: 1 },
  navItem: {
    padding: '6px 16px', fontSize: '14px', fontWeight: '500',
    color: '#64748b', cursor: 'pointer', borderRadius: '6px',
    transition: 'all 0.15s',
  },
  navActive: {
    color: '#1e40af', fontWeight: '700',
    borderBottom: '2px solid #1e40af',
    borderRadius: '0',
  },
  right: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  alarmBtn: {
    padding: '6px 14px', border: '1px solid #e2e8f0',
    borderRadius: '8px', background: '#fff',
    fontSize: '13px', cursor: 'pointer', color: '#374151',
  },
  loginBtn: {
    padding: '6px 14px', border: '1px solid #e2e8f0',
    borderRadius: '8px', background: '#fff',
    fontSize: '13px', cursor: 'pointer', color: '#374151',
  },
}

export default Header