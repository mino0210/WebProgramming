/**
 * ReportCard - 초안 UI 반영
 * props:
 *  - report: { reportId, title, content, categoryName, sympathyCount, status, createdAt, imageUrls }
 */

const CATEGORY_META = {
  침수: { icon: '💧', color: '#3b82f6' },
  화재: { icon: '🔥', color: '#ef4444' },
  교통: { icon: '🚗', color: '#f59e0b' },
  낙석: { icon: '⛰️', color: '#78716c' },
  정전: { icon: '⚡', color: '#eab308' },
  가스누출: { icon: '💨', color: '#22c55e' },
}

// 공감 수 → 위험도
const getDangerLevel = (count) => {
  if (!count || count < 2)  return { label: '낮음',    color: '#3b82f6', bg: '#eff6ff' }
  if (count < 4)             return { label: '보통',    color: '#f59e0b', bg: '#fffbeb' }
  if (count < 6)             return { label: '높음',    color: '#f97316', bg: '#fff7ed' }
  return                            { label: '매우높음', color: '#ef4444', bg: '#fef2f2' }
}

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function ReportCard({ report }) {
  const meta    = CATEGORY_META[report.categoryName] || { icon: '📌', color: '#8b5cf6' }
  const danger  = getDangerLevel(report.sympathyCount)

  return (
    <div style={styles.card}>
      {/* 아이콘 */}
      <div style={{ ...styles.iconBox, color: meta.color }}>
        {meta.icon}
      </div>

      {/* 내용 */}
      <div style={styles.body}>
        <div style={styles.topRow}>
          <span style={{ ...styles.category, color: meta.color }}>{report.categoryName}</span>
          <span style={styles.time}>{timeAgo(report.createdAt)}</span>
        </div>
        <div style={styles.location}>{report.title}</div>
        <div style={styles.content}>{report.content}</div>
      </div>

      {/* 위험도 뱃지 */}
      <div style={{ ...styles.dangerBadge, color: danger.color, background: danger.bg }}>
        {danger.label}
      </div>
    </div>
  )
}

const styles = {
  card: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fff',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  iconBox: {
    fontSize: '22px', flexShrink: 0,
    width: '36px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' },
  category: { fontSize: '12px', fontWeight: '700' },
  time: { fontSize: '11px', color: '#94a3b8' },
  location: {
    fontSize: '13px', fontWeight: '600', color: '#1e293b',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  content: {
    fontSize: '12px', color: '#64748b', lineHeight: 1.4,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
    marginTop: '2px',
  },
  dangerBadge: {
    flexShrink: 0, fontSize: '11px', fontWeight: '700',
    padding: '3px 8px', borderRadius: '6px',
    alignSelf: 'center',
  },
}

export default ReportCard
