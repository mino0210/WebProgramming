import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyReports, resolveReport } from '../api/reportApi'

const CATEGORY_META = {
    침수:    { color: '#3b82f6', bg: '#eff6ff',
        icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg> },
    화재:    { color: '#ef4444', bg: '#fef2f2',
        icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg> },
    교통:    { color: '#f59e0b', bg: '#fffbeb',
        icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg> },
    낙석:    { color: '#78716c', bg: '#f5f5f4',
        icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 20h20L12 2z"/><circle cx="15" cy="11" r="1.5" fill={c}/><circle cx="10" cy="16" r="1"/></svg> },
    정전:    { color: '#eab308', bg: '#fefce8',
        icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill={c}><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg> },
    가스누출: { color: '#22c55e', bg: '#f0fdf4',
        icon: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18M8 18V9h8v9"/><circle cx="12" cy="6" r="1.5"/><circle cx="16" cy="4" r="1"/><circle cx="8" cy="4" r="1"/></svg> },
}

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
)

function MyReportsPage() {
    const navigate  = useNavigate()
    const memberId  = localStorage.getItem('memberId')
    const nickname  = localStorage.getItem('nickname') || '사용자'

    const [reports, setReports]     = useState([])
    const [loading, setLoading]     = useState(true)
    const [resolving, setResolving] = useState(null)

    useEffect(() => {
        if (!memberId) { navigate('/login'); return }
        getMyReports(memberId)
            .then((res) => setReports(res.data?.data || res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [memberId])

    const handleResolve = async (reportId) => {
        if (!window.confirm('이 제보를 해결 완료 처리하시겠습니까?')) return
        setResolving(reportId)
        try {
            await resolveReport(reportId, memberId)
            setReports((prev) =>
                prev.map((r) => r.id === reportId ? { ...r, status: 'RESOLVED' } : r)
            )
        } catch { alert('처리 중 오류가 발생했습니다.') }
        finally { setResolving(null) }
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    const activeReports   = reports.filter((r) => r.status === 'ACTIVE')
    const resolvedReports = reports.filter((r) => r.status === 'RESOLVED')

    return (
        <div style={styles.page}>

            {/* 헤더 */}
            <header style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    지도로
                </button>
                <span style={styles.headerTitle}>제보 내역</span>
                <span style={styles.nickname}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
                    {nickname}
        </span>
            </header>

            {/* 통계 */}
            <div style={styles.statsRow}>
                <div style={styles.statBox}>
                    <div style={styles.statNum}>{reports.length}</div>
                    <div style={styles.statLabel}>전체 제보</div>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statBox}>
                    <div style={{ ...styles.statNum, color: '#ef4444' }}>{activeReports.length}</div>
                    <div style={styles.statLabel}>진행 중</div>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statBox}>
                    <div style={{ ...styles.statNum, color: '#22c55e' }}>{resolvedReports.length}</div>
                    <div style={styles.statLabel}>해결 완료</div>
                </div>
            </div>

            {/* 목록 */}
            <div style={styles.content}>
                {loading ? (
                    <div style={styles.empty}>
                        <div style={{ color: '#9ca3af', fontSize: '14px' }}>불러오는 중...</div>
                    </div>
                ) : reports.length === 0 ? (
                    <div style={styles.empty}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginTop: '16px' }}>
                            아직 등록한 제보가 없어요
                        </div>
                        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>
                            지도를 클릭해 첫 제보를 등록해보세요!
                        </div>
                        <button style={styles.goMapBtn} onClick={() => navigate('/')}>지도로 이동</button>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {reports.map((report) => {
                            const meta = CATEGORY_META[report.categoryName] || { color: '#8b5cf6', bg: '#f5f3ff', icon: () => null }
                            const isResolved = report.status === 'RESOLVED'
                            const date = report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString('ko-KR', {
                                    month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })
                                : ''

                            return (
                                <div key={report.id} style={{ ...styles.card, opacity: isResolved ? 0.65 : 1 }}>

                                    {/* 카드 헤더 */}
                                    <div style={styles.cardHeader}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ ...styles.iconBox, background: meta.bg }}>
                                                {meta.icon(meta.color)}
                                            </div>
                                            <span style={{ ...styles.categoryText, color: meta.color }}>
                        {report.categoryName}
                      </span>
                                        </div>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: isResolved ? '#f0fdf4' : '#fef2f2',
                                            color: isResolved ? '#16a34a' : '#ef4444',
                                        }}>
                      {isResolved && <CheckIcon />}
                                            {isResolved ? '해결됨' : '진행 중'}
                    </span>
                                    </div>

                                    {/* 제목 */}
                                    <div style={styles.cardTitle}>{report.title}</div>

                                    {/* 내용 */}
                                    <div style={styles.cardContent}>{report.content}</div>

                                    {/* 이미지 */}
                                    {report.imageUrls?.length > 0 && (
                                        <img
                                            src={`${apiBase}${report.imageUrls[0]}`}
                                            alt="제보 이미지" style={styles.cardImage}
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                    )}

                                    {/* 하단 */}
                                    <div style={styles.cardFooter}>
                                        <div style={styles.cardMeta}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                                            </svg>
                                            {date}
                                            <span style={styles.metaDot}>·</span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                            </svg>
                                            {report.sympathyCount || 0}명
                                        </div>
                                        {!isResolved && (
                                            <button
                                                style={styles.resolveBtn}
                                                onClick={() => handleResolve(report.id)}
                                                disabled={resolving === report.id}
                                            >
                                                {resolving === report.id ? (
                                                    '처리 중...'
                                                ) : (
                                                    <>
                                                        <CheckIcon />
                                                        해결 완료
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh', background: '#f9fafb',
        fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '56px',
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        position: 'sticky', top: 0, zIndex: 100,
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', border: 'none',
        color: '#4b5563', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    },
    headerTitle: { fontSize: '15px', fontWeight: '700', color: '#111827' },
    nickname: {
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '13px', color: '#6b7280', fontWeight: '500',
    },
    statsRow: {
        display: 'flex', alignItems: 'center',
        padding: '16px 24px', background: '#fff',
        borderBottom: '1px solid #e5e7eb',
    },
    statBox: { flex: 1, textAlign: 'center', padding: '8px 0' },
    statDivider: { width: '1px', height: '32px', background: '#e5e7eb' },
    statNum: { fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: 1 },
    statLabel: { fontSize: '11px', color: '#9ca3af', marginTop: '4px', fontWeight: '500' },
    content: { padding: '20px 24px', maxWidth: '720px', margin: '0 auto' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    empty: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '400px', textAlign: 'center',
    },
    goMapBtn: {
        marginTop: '16px', padding: '9px 22px',
        background: '#1d4ed8', color: '#fff',
        border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    },
    card: {
        background: '#fff', borderRadius: '12px',
        border: '1px solid #e5e7eb', padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    iconBox: {
        width: '28px', height: '28px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    categoryText: { fontSize: '12px', fontWeight: '700' },
    statusBadge: {
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '11px', fontWeight: '700',
        padding: '3px 9px', borderRadius: '9999px',
    },
    cardTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', lineHeight: 1.4 },
    cardContent: { fontSize: '13px', color: '#6b7280', lineHeight: 1.6 },
    cardImage: { width: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover' },
    cardFooter: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '8px', borderTop: '1px solid #f3f4f6',
    },
    cardMeta: {
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '12px', color: '#9ca3af',
    },
    metaDot: { color: '#d1d5db' },
    resolveBtn: {
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 14px', border: 'none', borderRadius: '7px',
        background: '#22c55e', color: '#fff',
        fontSize: '12px', fontWeight: '700', cursor: 'pointer',
    },
}

export default MyReportsPage