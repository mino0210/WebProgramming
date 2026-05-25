const CATEGORY_META = {
  침수:    { color: '#3b82f6', bg: '#eff6ff', icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg> },
  화재:    { color: '#ef4444', bg: '#fef2f2', icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg> },
  교통:    { color: '#f59e0b', bg: '#fffbeb', icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg> },
  낙석:    { color: '#78716c', bg: '#f5f5f4', icon: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 20h20L12 2z"/><circle cx="15" cy="11" r="1.5" fill={c}/><circle cx="10" cy="16" r="1"/></svg> },
  정전:    { color: '#eab308', bg: '#fefce8', icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg> },
  가스누출: { color: '#22c55e', bg: '#f0fdf4', icon: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18M8 18V9h8v9"/><circle cx="12" cy="6" r="1.5"/><circle cx="16" cy="4" r="1"/><circle cx="8" cy="4" r="1"/></svg> },
}

const getDangerLevel = (count) => {
  if (!count || count < 2) return { label: '낮음', color: '#2563eb', bg: '#dbeafe' }
  if (count < 4)            return { label: '보통', color: '#d97706', bg: '#fef3c7' }
  if (count < 6)            return { label: '높음', color: '#ea580c', bg: '#ffedd5' }
  return                           { label: '위험', color: '#dc2626', bg: '#fee2e2' }
}

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function ReportCard({ report }) {
  const meta   = CATEGORY_META[report.categoryName] || { color: '#8b5cf6', bg: '#f5f3ff', icon: () => '📌' }
  const danger = getDangerLevel(report.sympathyCount)
  const isResolved = report.status === 'RESOLVED'

  return (
      <div style={{ ...styles.card, opacity: isResolved ? 0.55 : 1 }}>
        <div style={{ ...styles.iconBox, background: meta.bg }}>
          {meta.icon(meta.color)}
        </div>
        <div style={styles.body}>
          <div style={styles.topRow}>
            <span style={{ ...styles.category, color: meta.color }}>{report.categoryName}</span>
            <span style={styles.time}>{timeAgo(report.createdAt)}</span>
          </div>
          <div style={styles.title}>{report.title}</div>
          <div style={styles.content}>{report.content}</div>
        </div>
        <div style={styles.right}>
          {isResolved ? (
              <span style={{ ...styles.badge, color: '#15803d', background: '#dcfce7' }}>해결됨</span>
          ) : (
              <span style={{ ...styles.badge, color: danger.color, background: danger.bg }}>{danger.label}</span>
          )}
        </div>
      </div>
  )
}

const styles = {
  card: {
    display: 'flex', alignItems: 'flex-start', gap: '13px',
    padding: '15px 18px', borderBottom: '1px solid #f3f4f6',
    background: '#fff', transition: 'background 0.12s',
  },
  iconBox: {
    width: '42px', height: '42px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' },
  category: { fontSize: '13px', fontWeight: '900' },
  time: { fontSize: '12px', fontWeight: '700', color: '#9ca3af' },
  title: {
    fontSize: '15px', fontWeight: '800', color: '#111827',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px',
  },
  content: {
    fontSize: '13px', fontWeight: '650', color: '#6b7280', lineHeight: 1.4,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  right: { flexShrink: 0, alignSelf: 'center' },
  badge: {
    display: 'inline-block', fontSize: '12px', fontWeight: '900',
    padding: '5px 9px', borderRadius: '5px', whiteSpace: 'nowrap',
  },
}

export default ReportCard