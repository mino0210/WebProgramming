import { useState, useEffect } from 'react'

/**
 * AlertBanner
 * props:
 *  - alerts: [{ reportId, title, categoryName, count }]
 */
function AlertBanner({ alerts = [] }) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    if (alerts.length > 0) {
      setCurrent(alerts[0])
      setVisible(true)
    }
  }, [alerts])

  if (!visible || !current) return null

  return (
      <div style={styles.banner}>
        <div style={styles.left}>
          <span style={styles.icon}>🚨</span>
          <div style={styles.texts}>
            <span style={styles.title}>경보 발령</span>
            <span style={styles.desc}>
            {current.categoryName && `[${current.categoryName}] `}
              {current.title || '위험 지역을 확인하세요'} —
              {current.count ? ` ${current.count}명이 위험 신고` : ' 즉시 확인하세요'}
          </span>
          </div>
        </div>
        <div style={styles.right}>
          <span style={styles.badge}>긴급</span>
          <button style={styles.closeBtn} onClick={() => setVisible(false)}>✕</button>
        </div>
      </div>
  )
}

const styles = {
  banner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px',
    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
    color: '#fff', flexShrink: 0,
    animation: 'pulse 2s ease-in-out infinite',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  icon: { fontSize: '22px', animation: 'shake 0.5s ease-in-out infinite' },
  texts: { display: 'flex', flexDirection: 'column', gap: '2px' },
  title: { fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' },
  desc: { fontSize: '12px', opacity: 0.9 },
  right: { display: 'flex', alignItems: 'center', gap: '10px' },
  badge: {
    background: '#fff', color: '#dc2626',
    fontSize: '11px', fontWeight: '800',
    padding: '3px 10px', borderRadius: '20px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)', border: 'none',
    color: '#fff', width: '24px', height: '24px',
    borderRadius: '50%', cursor: 'pointer',
    fontSize: '12px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}

export default AlertBanner