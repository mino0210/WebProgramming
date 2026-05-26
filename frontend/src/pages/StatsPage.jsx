import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'
import { getCategories } from '../api/reportApi'
import { getAllReports } from '../api/reportApi'
import { CATEGORY_META } from '../utils/categoryMeta'

const normalizeList = (res) => res?.data?.data ?? res?.data ?? res ?? []
const getReportId = (pin) => pin?.reportId ?? pin?.id
const isResolvedReport = (report) => {
  const status = String(report?.status || '').toUpperCase()
  return status === 'RESOLVED' || status === 'DONE' || report?.resolved === true
}
const getCategoryName = (report) => report?.categoryName || report?.category?.name || '기타'
const getTimeLabel = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth))

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}

function StatsPage() {
  const navigate = useNavigate()
  const width = useViewportWidth()
  const isMobile = width <= 768
  const isTablet = width <= 1024

  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(getTimeLabel())

  const load = () => {
    setLoading(true)
    Promise.all([getAllReports(), getCategories()])
      .then(([reportRes, categoryRes]) => {
        setReports(normalizeList(reportRes))
        setCategories(normalizeList(categoryRes))
        setLastUpdated(getTimeLabel())
      })
      .catch((error) => console.error('[StatsPage] 통계 조회 실패:', error))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const total = reports.length
    const active = reports.filter((r) => !isResolvedReport(r)).length
    const resolved = reports.filter((r) => isResolvedReport(r)).length
    const sympathyTotal = reports.reduce((sum, r) => sum + Number(r.sympathyCount || 0), 0)
    const dangerous = reports.filter((r) => Number(r.sympathyCount || 0) >= 3).length

    const baseCategoryNames = categories.length
      ? categories.map((c) => c.name).filter(Boolean)
      : Object.keys(CATEGORY_META).filter((name) => name !== '기타')

    const reportCategoryNames = reports.map(getCategoryName).filter(Boolean)
    const categoryNames = Array.from(new Set([...baseCategoryNames, ...reportCategoryNames, '기타']))

    const byCategory = categoryNames.map((name) => {
      const categoryReports = reports.filter((r) => getCategoryName(r) === name)
      const count = categoryReports.length
      const sympathy = categoryReports.reduce((sum, r) => sum + Number(r.sympathyCount || 0), 0)
      const percent = total ? Math.round((count / total) * 1000) / 10 : 0
      return { name, count, sympathy, percent }
    })

    const maxCategory = Math.max(1, ...byCategory.map((item) => item.count))
    const hotCategory = [...byCategory].sort((a, b) => b.count - a.count)[0]
    const recent = [...reports]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, isMobile ? 4 : 5)

    return { total, active, resolved, sympathyTotal, dangerous, byCategory, maxCategory, hotCategory, recent }
  }, [reports, categories, isMobile])

  const s = getResponsiveStyles(isMobile, isTablet)

  return (
    <div style={s.page}>
      <Header />
      <main style={s.main}>
        <section style={s.hero}>
          <div style={s.heroTextArea}>
            <span style={s.eyebrow}>SafePin Analytics</span>
            <h1 style={s.title}>실시간 제보 현황을 한눈에 확인하세요</h1>
            <p style={s.description}>
              현재 접수된 제보 데이터를 유형, 처리 상태, 공감 반응 기준으로 정리했습니다.
              위험 후보와 최근 흐름을 함께 확인해 지역 상황 변화에 더 빠르게 대응할 수 있습니다.
            </p>
          </div>
          <div style={s.heroActions}>
            <span style={s.updateLabel}>최근 갱신 {lastUpdated}</span>
            <button style={s.primaryBtn} onClick={load}>새로고침</button>
          </div>
        </section>

        <section style={s.kpiGrid}>
          <KpiCard styles={s} label="전체 제보" value={stats.total} hint="지도에 등록된 누적 제보" color="#2563eb" />
          <KpiCard styles={s} label="진행 중" value={stats.active} hint="아직 해결되지 않은 제보" color="#ef4444" />
          <KpiCard styles={s} label="해결 완료" value={stats.resolved} hint="처리 완료된 제보" color="#22c55e" />
          <KpiCard styles={s} label="공감 합계" value={stats.sympathyTotal} hint="위험해요 누적 반응" color="#f59e0b" />
        </section>

        <section style={s.twoCol}>
          <article style={s.panel}>
            <div style={s.panelHeader}>
              <div>
                <h2 style={s.panelTitle}>유형별 제보 분포</h2>
                <p style={s.panelDesc}>실제 등록된 제보 수를 기준으로 재난 유형별 비중을 계산합니다.</p>
              </div>
              <span style={s.pill}>TOP {stats.hotCategory?.count ? stats.hotCategory.name : '-'}</span>
            </div>
            <div style={s.barList}>
              {stats.byCategory.map((item) => {
                const meta = CATEGORY_META[item.name] || CATEGORY_META.기타
                const fillWidth = `${Math.max(item.count > 0 ? 8 : 0, (item.count / stats.maxCategory) * 100)}%`
                return (
                  <div key={item.name} style={s.barRow}>
                    <div style={s.barLabel}>
                      <span style={{ ...s.smallIcon, background: meta.bg, color: meta.color }}>{meta.iconText}</span>
                      <span>{item.name}</span>
                    </div>
                    <div style={s.barTrack} title={`${item.name} ${item.count}건`}>
                      <div style={{ ...s.barFill, width: fillWidth, background: item.count ? meta.color : '#e2e8f0' }} />
                    </div>
                    <strong style={s.barValue}>{item.count}</strong>
                    <span style={s.barPercent}>{item.percent}%</span>
                  </div>
                )
              })}
            </div>
          </article>

          <article style={s.panel}>
            <div style={s.panelHeader}>
              <div>
                <h2 style={s.panelTitle}>위험도 요약</h2>
                <p style={s.panelDesc}>공감 수 3개 이상 제보를 위험 지역 후보로 분류합니다.</p>
              </div>
              <span style={{ ...s.pill, background: '#fef2f2', color: '#dc2626' }}>{stats.dangerous}건</span>
            </div>
            <div style={s.riskBox}>
              <div style={s.riskCircle}>{stats.total ? Math.round((stats.dangerous / stats.total) * 100) : 0}%</div>
              <div>
                <div style={s.riskTitle}>위험 후보 비율</div>
                <p style={s.riskText}>
                  위험 후보는 제보 밀도와 공감 수가 높은 지역을 빠르게 찾아내기 위한 SafePin의 핵심 지표입니다.
                </p>
              </div>
            </div>
            <div style={s.miniGrid}>
              <div style={s.miniCard}><strong>{stats.active}</strong><span>대응 필요</span></div>
              <div style={s.miniCard}><strong>{stats.resolved}</strong><span>해결됨</span></div>
              <div style={s.miniCard}><strong>{stats.sympathyTotal}</strong><span>총 공감</span></div>
            </div>
          </article>
        </section>

        <section style={s.panel}>
          <div style={s.panelHeader}>
            <div>
              <h2 style={s.panelTitle}>최근 제보 흐름</h2>
              <p style={s.panelDesc}>최근 등록된 제보를 기준으로 현장 상황을 빠르게 확인합니다.</p>
            </div>
            <button style={s.secondaryBtn} onClick={() => navigate('/')}>지도에서 보기</button>
          </div>
          {loading ? (
            <div style={s.empty}>통계 데이터를 불러오는 중입니다.</div>
          ) : stats.recent.length === 0 ? (
            <div style={s.empty}>아직 등록된 제보가 없습니다.</div>
          ) : (
            <div style={s.timeline}>
              {stats.recent.map((report) => {
                const categoryName = getCategoryName(report)
                const meta = CATEGORY_META[categoryName] || CATEGORY_META.기타
                const resolved = isResolvedReport(report)
                return (
                  <div key={getReportId(report)} style={s.timelineItem}>
                    <span style={{ ...s.timelineIcon, background: meta.bg, color: meta.color }}>{meta.iconText}</span>
                    <div style={s.timelineBody}>
                      <div style={s.timelineTop}>
                        <strong>{report.title || '제목 없음'}</strong>
                        <span>{report.createdAt ? new Date(report.createdAt).toLocaleString('ko-KR') : ''}</span>
                      </div>
                      <p style={s.timelineText}>{report.content || '상세 내용이 없습니다.'}</p>
                    </div>
                    <span style={{ ...s.status, background: resolved ? '#dcfce7' : '#fee2e2', color: resolved ? '#15803d' : '#dc2626' }}>
                      {resolved ? '해결됨' : '진행 중'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function KpiCard({ styles, label, value, hint, color }) {
  return (
    <article style={styles.kpiCard}>
      <div style={{ ...styles.kpiMark, background: color }} />
      <div style={styles.kpiLabel}>{label}</div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiHint}>{hint}</div>
    </article>
  )
}

function getResponsiveStyles(isMobile, isTablet) {
  return {
    page: { minHeight: '100vh', background: '#f7f9fc', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" },
    main: { maxWidth: '1180px', margin: '0 auto', padding: isMobile ? '18px 14px 34px' : '28px 24px 48px' },
    hero: {
      display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between',
      gap: isMobile ? '18px' : '24px', alignItems: isMobile ? 'stretch' : 'center',
      padding: isMobile ? '22px 18px' : '30px', borderRadius: isMobile ? '20px' : '24px',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 58%, #f0fdf4 100%)',
      border: '1px solid #e5edf8', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
    },
    heroTextArea: { minWidth: 0 },
    eyebrow: { display: 'inline-flex', padding: '5px 10px', borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', fontSize: '12px', fontWeight: 800 },
    title: { margin: '14px 0 10px', fontSize: isMobile ? '25px' : isTablet ? '28px' : '32px', lineHeight: 1.22, color: '#0f172a', letterSpacing: '-0.6px' },
    description: { margin: 0, maxWidth: '760px', fontSize: isMobile ? '14px' : '15px', lineHeight: 1.8, color: '#475569' },
    heroActions: { display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '10px', alignItems: isMobile ? 'center' : 'flex-end', justifyContent: isMobile ? 'space-between' : 'center', flexShrink: 0 },
    updateLabel: { fontSize: '12px', color: '#64748b', fontWeight: 700 },
    primaryBtn: { border: 'none', background: '#2563eb', color: '#fff', borderRadius: '14px', padding: '12px 18px', fontWeight: 800, cursor: 'pointer' },
    secondaryBtn: { border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '12px', padding: '10px 14px', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' },
    kpiGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '14px', marginTop: '18px' },
    kpiCard: { position: 'relative', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: isMobile ? '15px' : '18px', overflow: 'hidden', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)' },
    kpiMark: { position: 'absolute', top: 0, left: 0, right: 0, height: '4px' },
    kpiLabel: { color: '#64748b', fontSize: '12px', fontWeight: 800 },
    kpiValue: { color: '#0f172a', fontSize: isMobile ? '26px' : '30px', fontWeight: 900, marginTop: '8px' },
    kpiHint: { color: '#94a3b8', fontSize: '12px', marginTop: '4px' },
    twoCol: { display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.1fr 0.9fr', gap: '16px', marginTop: '16px' },
    panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: isMobile ? '16px' : '20px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)', marginTop: '16px', minWidth: 0 },
    panelHeader: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '14px', marginBottom: '16px' },
    panelTitle: { margin: 0, color: '#111827', fontSize: isMobile ? '18px' : '19px', letterSpacing: '-0.2px' },
    panelDesc: { margin: '6px 0 0', color: '#64748b', fontSize: '13px', lineHeight: 1.6 },
    pill: { display: 'inline-flex', alignItems: 'center', alignSelf: isMobile ? 'flex-start' : 'auto', borderRadius: '999px', padding: '6px 10px', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap' },
    barList: { display: 'flex', flexDirection: 'column', gap: isMobile ? '15px' : '13px' },
    barRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '96px 1fr 34px 44px' : '110px 1fr 36px 50px',
      gap: isMobile ? '8px' : '12px', alignItems: 'center', minWidth: 0,
    },
    barLabel: { display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: isMobile ? '12px' : '13px', fontWeight: 800, minWidth: 0 },
    smallIcon: { width: '28px', height: '28px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    barTrack: { height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', minWidth: 0 },
    barFill: { height: '100%', borderRadius: '999px', transition: 'width 0.25s ease' },
    barValue: { color: '#111827', fontSize: '13px', textAlign: 'right' },
    barPercent: { color: '#94a3b8', fontSize: '12px', textAlign: 'right', fontWeight: 700 },
    riskBox: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '18px', padding: '16px', borderRadius: '18px', background: '#fff7ed', border: '1px solid #fed7aa' },
    riskCircle: { width: '86px', height: '86px', borderRadius: '50%', background: 'linear-gradient(135deg, #fb923c, #ef4444)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '24px', flexShrink: 0 },
    riskTitle: { color: '#111827', fontWeight: 900, marginBottom: '5px' },
    riskText: { margin: 0, color: '#64748b', fontSize: '13px', lineHeight: 1.7 },
    miniGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' },
    miniCard: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', padding: '12px', borderRadius: '14px', background: '#f8fafc', color: '#64748b', fontSize: '12px' },
    timeline: { display: 'flex', flexDirection: 'column', gap: '10px' },
    timelineItem: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '38px 1fr' : '42px 1fr auto',
      gap: '12px', alignItems: 'center', padding: isMobile ? '12px' : '13px',
      borderRadius: '16px', background: '#f8fafc', border: '1px solid #edf2f7', minWidth: 0,
    },
    timelineIcon: { width: '38px', height: '38px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gridRow: isMobile ? 'span 2' : 'auto' },
    timelineBody: { minWidth: 0 },
    timelineTop: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '5px', color: '#111827', fontSize: '13px' },
    timelineText: { margin: '6px 0 0', color: '#64748b', fontSize: '13px', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis' },
    status: { borderRadius: '999px', padding: '5px 9px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', justifySelf: isMobile ? 'start' : 'auto', gridColumn: isMobile ? '2' : 'auto' },
    empty: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
  }
}

export default StatsPage
