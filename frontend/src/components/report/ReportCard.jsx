import { getCategoryMeta } from '../../utils/categoryMeta'
import { getReportImageUrls } from '../../utils/mediaUrl'
import ReportImagePreview from '../common/ReportImagePreview'

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
  const meta   = getCategoryMeta(report.categoryName)
  const danger = getDangerLevel(report.sympathyCount)
  const isResolved = report.status === 'RESOLVED'
  const imageUrls = getReportImageUrls(report)
  const hasImage = imageUrls.length > 0

  return (
      <div style={{ ...styles.card, opacity: isResolved ? 0.55 : 1 }}>
        {hasImage ? (
          <ReportImagePreview
            sources={imageUrls}
            alt="제보 썸네일"
            style={styles.thumbnail}
            fallback={(
              <div style={{ ...styles.iconBox, background: meta.bg }}>
                {meta.icon(meta.color)}
              </div>
            )}
          />
        ) : (
          <div style={{ ...styles.iconBox, background: meta.bg }}>
            {meta.icon(meta.color)}
          </div>
        )}
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
  thumbnail: { width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e5e7eb', background: '#f8fafc' },
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
