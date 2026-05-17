// TODO: 팀원 A 담당 — 제보 카드
/**
 * ReportCard
 * props:
 *  - report: { reportId, title, content, categoryName, sympathyCount, status, createdAt, imageUrls }
 */

const CATEGORY_META = {
    침수: { emoji: '🌊', color: '#3b82f6', bg: '#eff6ff' },
    화재: { emoji: '🔥', color: '#ef4444', bg: '#fef2f2' },
    교통: { emoji: '🚗', color: '#f59e0b', bg: '#fffbeb' },
    낙석: { emoji: '🪨', color: '#6b7280', bg: '#f3f4f6' },
}

function ReportCard({ report }) {
    const meta = CATEGORY_META[report.categoryName] || { emoji: '📌', color: '#8b5cf6', bg: '#f5f3ff' }
    const isResolved = report.status === 'RESOLVED'

    const timeAgo = (dateStr) => {
        if (!dateStr) return ''
        const diff = Date.now() - new Date(dateStr).getTime()
        const m = Math.floor(diff / 60000)
        if (m < 1)  return '방금 전'
        if (m < 60) return `${m}분 전`
        const h = Math.floor(m / 60)
        if (h < 24) return `${h}시간 전`
        return `${Math.floor(h / 24)}일 전`
    }

    return (
        <div style={{ ...styles.card, opacity: isResolved ? 0.6 : 1 }}>

            {/* 카테고리 뱃지 + 시간 */}
            <div style={styles.topRow}>
        <span style={{ ...styles.badge, color: meta.color, background: meta.bg }}>
          {meta.emoji} {report.categoryName}
        </span>
                <span style={styles.time}>{timeAgo(report.createdAt)}</span>
                {isResolved && <span style={styles.resolvedBadge}>✅ 해결됨</span>}
            </div>

            {/* 제목 */}
            <div style={styles.title}>{report.title}</div>

            {/* 내용 */}
            <div style={styles.content}>{report.content}</div>

            {/* 이미지 */}
            {report.imageUrls?.length > 0 && (
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${report.imageUrls[0]}`}
                    alt="제보 이미지"
                    style={styles.image}
                    onError={(e) => { e.target.style.display = 'none' }}
                />
            )}

            {/* 공감 수 */}
            <div style={styles.footer}>
        <span style={styles.sympathyCount}>
          ⚠️ {report.sympathyCount || 0}명이 위험해요
        </span>
            </div>

        </div>
    )
}

const styles = {
    card: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: '7px',
    },
    topRow: {
        display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
    },
    badge: {
        fontSize: '11px', fontWeight: '700',
        padding: '3px 9px', borderRadius: '20px',
    },
    time: { fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' },
    resolvedBadge: {
        fontSize: '11px', color: '#16a34a', background: '#f0fdf4',
        padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
    },
    title: {
        fontSize: '14px', fontWeight: '700', color: '#1e293b', lineHeight: 1.4,
    },
    content: {
        fontSize: '13px', color: '#64748b', lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    image: {
        width: '100%', borderRadius: '8px',
        maxHeight: '140px', objectFit: 'cover', marginTop: '4px',
    },
    footer: {
        display: 'flex', justifyContent: 'flex-end', marginTop: '4px',
    },
    sympathyCount: {
        fontSize: '12px', color: '#ef4444', fontWeight: '600',
    },
}

export default ReportCard