import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyReports, resolveReport } from '../api/reportApi'

const CATEGORY_META = {
    침수:    { icon: '💧', color: '#3b82f6', bg: '#eff6ff' },
    화재:    { icon: '🔥', color: '#ef4444', bg: '#fef2f2' },
    교통:    { icon: '🚗', color: '#f59e0b', bg: '#fffbeb' },
    낙석:    { icon: '⛰️', color: '#78716c', bg: '#f5f5f4' },
    정전:    { icon: '⚡', color: '#eab308', bg: '#fefce8' },
    가스누출: { icon: '💨', color: '#22c55e', bg: '#f0fdf4' },
}

function MyReportsPage() {
    const navigate  = useNavigate()
    const memberId  = localStorage.getItem('memberId')
    const nickname  = localStorage.getItem('nickname') || '사용자'

    const [reports, setReports]   = useState([])
    const [loading, setLoading]   = useState(true)
    const [resolving, setResolving] = useState(null) // 처리 중인 reportId

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
        } catch (e) {
            alert('처리 중 오류가 발생했습니다.')
        } finally {
            setResolving(null)
        }
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

    const activeReports   = reports.filter((r) => r.status === 'ACTIVE')
    const resolvedReports = reports.filter((r) => r.status === 'RESOLVED')

    return (
        <div style={styles.page}>
            {/* 헤더 */}
            <header style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/')}>← 지도로</button>
                <span style={styles.headerTitle}>📋 내 제보 내역</span>
                <span style={styles.nickname}>👤 {nickname}</span>
            </header>

            {/* 통계 */}
            <div style={styles.statsRow}>
                <div style={styles.statBox}>
                    <div style={styles.statNum}>{reports.length}</div>
                    <div style={styles.statLabel}>전체 제보</div>
                </div>
                <div style={styles.statBox}>
                    <div style={{ ...styles.statNum, color: '#ef4444' }}>{activeReports.length}</div>
                    <div style={styles.statLabel}>진행 중</div>
                </div>
                <div style={styles.statBox}>
                    <div style={{ ...styles.statNum, color: '#22c55e' }}>{resolvedReports.length}</div>
                    <div style={styles.statLabel}>해결 완료</div>
                </div>
            </div>

            {/* 제보 목록 */}
            <div style={styles.content}>
                {loading ? (
                    <div style={styles.empty}>불러오는 중...</div>
                ) : reports.length === 0 ? (
                    <div style={styles.empty}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>
                            아직 등록한 제보가 없어요
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                            지도를 클릭해 첫 제보를 등록해보세요!
                        </div>
                        <button style={styles.goMapBtn} onClick={() => navigate('/')}>
                            지도로 이동
                        </button>
                    </div>
                ) : (
                    <div style={styles.list}>
                        {reports.map((report) => {
                            const meta = CATEGORY_META[report.categoryName] || { icon: '📌', color: '#8b5cf6', bg: '#f5f3ff' }
                            const isResolved = report.status === 'RESOLVED'
                            const date = report.createdAt
                                ? new Date(report.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : ''

                            return (
                                <div key={report.id} style={{ ...styles.card, opacity: isResolved ? 0.7 : 1 }}>
                                    {/* 카드 헤더 */}
                                    <div style={styles.cardHeader}>
                    <span style={{ ...styles.categoryBadge, color: meta.color, background: meta.bg }}>
                      {meta.icon} {report.categoryName}
                    </span>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: isResolved ? '#f0fdf4' : '#fef2f2',
                                            color: isResolved ? '#16a34a' : '#ef4444',
                                        }}>
                      {isResolved ? '✅ 해결됨' : '🔴 진행 중'}
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
                                            alt="제보 이미지"
                                            style={styles.cardImage}
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                    )}

                                    {/* 하단 */}
                                    <div style={styles.cardFooter}>
                    <span style={styles.cardMeta}>
                      🕐 {date} &nbsp;|&nbsp; ⚠️ {report.sympathyCount || 0}명
                    </span>
                                        {!isResolved && (
                                            <button
                                                style={styles.resolveBtn}
                                                onClick={() => handleResolve(report.id)}
                                                disabled={resolving === report.id}
                                            >
                                                {resolving === report.id ? '처리 중...' : '✅ 해결 완료'}
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
        minHeight: '100vh', background: '#f8fafc',
        fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '56px',
        background: '#1e3a8a', color: '#fff', flexShrink: 0,
    },
    backBtn: {
        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
        color: '#fff', padding: '6px 14px', borderRadius: '8px',
        fontSize: '13px', cursor: 'pointer', fontWeight: '600',
    },
    headerTitle: { fontSize: '18px', fontWeight: '800' },
    nickname: { fontSize: '13px', color: 'rgba(255,255,255,0.8)' },
    statsRow: {
        display: 'flex', gap: '16px', padding: '20px 24px',
        background: '#fff', borderBottom: '1px solid #e2e8f0',
    },
    statBox: {
        flex: 1, textAlign: 'center', padding: '16px',
        background: '#f8fafc', borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    statNum: { fontSize: '28px', fontWeight: '800', color: '#1e293b' },
    statLabel: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
    content: { padding: '20px 24px' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    empty: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '400px', textAlign: 'center',
    },
    goMapBtn: {
        marginTop: '16px', padding: '10px 24px',
        background: '#1e40af', color: '#fff',
        border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    },
    card: {
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    categoryBadge: {
        fontSize: '12px', fontWeight: '700',
        padding: '4px 10px', borderRadius: '20px',
    },
    statusBadge: {
        fontSize: '11px', fontWeight: '700',
        padding: '4px 10px', borderRadius: '20px',
    },
    cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
    cardContent: { fontSize: '13px', color: '#64748b', lineHeight: 1.6 },
    cardImage: {
        width: '100%', borderRadius: '10px',
        maxHeight: '200px', objectFit: 'cover',
    },
    cardFooter: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '10px', borderTop: '1px solid #f1f5f9',
    },
    cardMeta: { fontSize: '12px', color: '#94a3b8' },
    resolveBtn: {
        padding: '7px 16px', border: 'none', borderRadius: '8px',
        background: '#22c55e', color: '#fff',
        fontSize: '13px', fontWeight: '700', cursor: 'pointer',
    },
}

export default MyReportsPage