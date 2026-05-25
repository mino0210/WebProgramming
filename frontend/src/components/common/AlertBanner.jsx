import { useEffect, useState } from 'react'

function getAlertText(alert) {
  if (alert?.type === 'density') {
    return `${alert.categoryName ? `[${alert.categoryName}] ` : ''}${alert.title || '주변 제보가 집중되고 있습니다.'} — 근처 제보 ${alert.count}건`
  }

  return `${alert?.categoryName ? `[${alert.categoryName}] ` : ''}${alert?.title || '위험 지역을 확인하세요'} — ${alert?.count ? `${alert.count}명이 위험 신고` : '즉시 확인하세요'}`
}

function AlertBanner({ alerts = [] }) {
  const [current, setCurrent] = useState(null)
  const [visible, setVisible] = useState(false)

  const closeBanner = () => {
    setVisible(false)
    window.setTimeout(() => setCurrent(null), 260)
  }

  useEffect(() => {
    if (alerts.length > 0) {
      setCurrent(alerts[0])
      setVisible(false)
      const frame = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }
    return undefined
  }, [alerts])

  useEffect(() => {
    if (!current || !visible) return undefined
    const timer = window.setTimeout(closeBanner, 7000)
    return () => window.clearTimeout(timer)
  }, [current, visible])

  if (!current) return null

  return (
    <div
      className="alert-banner"
      style={{
        ...styles.banner,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={styles.left}>
        <span style={styles.icon}>{current.type === 'density' ? '🔥' : '🚨'}</span>
        <div style={styles.texts}>
          <span style={styles.title}>{current.type === 'density' ? '제보 집중 지역' : '경보 발령'}</span>
          <span style={styles.desc}>{getAlertText(current)}</span>
        </div>
      </div>
      <div style={styles.right}>
        <span style={styles.badge}>{current.type === 'density' ? '밀집' : '긴급'}</span>
        <button style={styles.closeBtn} onClick={closeBanner}>✕</button>
      </div>
    </div>
  )
}

const styles = {
  banner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
    color: '#fff', flexShrink: 0,
    boxShadow: '0 2px 10px rgba(220,38,38,0.22)',
    transition: 'opacity 0.26s ease',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  icon: { fontSize: '24px' },
  texts: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  title: { fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' },
  desc: { fontSize: '14px', fontWeight: '700', opacity: 0.94, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  right: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  badge: {
    background: '#fff', color: '#dc2626',
    fontSize: '12px', fontWeight: '800',
    padding: '3px 10px', borderRadius: '20px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)', border: 'none',
    color: '#fff', width: '28px', height: '28px',
    borderRadius: '50%', cursor: 'pointer',
    fontSize: '13px', fontWeight: '900',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}

export default AlertBanner
