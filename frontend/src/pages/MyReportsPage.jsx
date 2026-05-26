import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'
import { getAllReports, resolveReport } from '../api/reportApi'
import { CATEGORY_META } from '../utils/categoryMeta'
import { getReportImageUrls } from '../utils/mediaUrl'
import ReportImagePreview from '../components/common/ReportImagePreview'

const DEFAULT_CATEGORIES = ['전체', '침수', '화재', '교통', '낙석', '정전', '가스누출', '기타']

const statusMeta = {
  all: { label: '전체', color: '#2563eb', bg: '#eff6ff' },
  active: { label: '진행 중', color: '#ef4444', bg: '#fef2f2' },
  resolved: { label: '해결 완료', color: '#16a34a', bg: '#f0fdf4' },
}

function IconDocument() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h6" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </svg>
  )
}

function SmallCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function formatDate(value) {
  if (!value) return '등록 시간 없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '등록 시간 없음'
  return date.toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getReportId(report) {
  return report.reportId ?? report.id
}

function normalizeCategory(categoryName) {
  return CATEGORY_META[categoryName] ? categoryName : '기타'
}

function isResolvedReport(report) {
  return report.status === 'RESOLVED' || report.resolved === true
}

function getImageUrls(report) {
  return getReportImageUrls(report)
}

function SummaryCard({ type, icon, label, value, description }) {
  return (
    <section className={`reports-summary-card reports-summary-card--${type}`}>
      <div className="reports-summary-icon">{icon}</div>
      <div>
        <p className="reports-summary-label">{label}</p>
        <strong className="reports-summary-value">{value}</strong>
        <span className="reports-summary-desc">{description}</span>
      </div>
    </section>
  )
}

function MyReportsPage() {
  const navigate = useNavigate()
  const memberId = localStorage.getItem('memberId')
  const nickname = localStorage.getItem('nickname') || '사용자'

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [sortType, setSortType] = useState('latest')

  useEffect(() => {
    if (!memberId) {
      navigate('/login')
      return
    }

    setLoading(true)
    getAllReports()
      .then((res) => {
        const list = res.data?.data ?? res.data ?? []
        setReports(Array.isArray(list) ? list : [])
      })
      .catch((error) => {
        console.error('제보 내역 조회 실패:', error)
        setReports([])
      })
      .finally(() => setLoading(false))
  }, [memberId, navigate])

  const activeReports = useMemo(() => reports.filter((report) => !isResolvedReport(report)), [reports])
  const resolvedReports = useMemo(() => reports.filter(isResolvedReport), [reports])

  const categoryList = useMemo(() => {
    const used = reports.map((report) => normalizeCategory(report.categoryName))
    const merged = [...new Set([...DEFAULT_CATEGORIES, ...used])]
    return merged.filter((item) => item === '전체' || item === '기타' || used.includes(item) || DEFAULT_CATEGORIES.includes(item))
  }, [reports])

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return reports
      .filter((report) => {
        if (statusFilter === 'active' && isResolvedReport(report)) return false
        if (statusFilter === 'resolved' && !isResolvedReport(report)) return false
        if (categoryFilter !== '전체' && normalizeCategory(report.categoryName) !== categoryFilter) return false

        if (!keyword) return true
        return [report.title, report.content, report.categoryName, report.address, report.locationName]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(keyword))
      })
      .sort((a, b) => {
        if (sortType === 'sympathy') return (b.sympathyCount || 0) - (a.sympathyCount || 0)
        if (sortType === 'category') return String(a.categoryName || '').localeCompare(String(b.categoryName || ''), 'ko')
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return sortType === 'oldest' ? aTime - bTime : bTime - aTime
      })
  }, [reports, search, statusFilter, categoryFilter, sortType])

  const categoryCounts = useMemo(() => {
    return reports.reduce((acc, report) => {
      const name = normalizeCategory(report.categoryName)
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
  }, [reports])

  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3)
  }, [reports])

  const mainCategoryStats = useMemo(() => {
    const candidates = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    return candidates.length > 0 ? candidates : [['기타', 0]]
  }, [categoryCounts])

  const donutStyle = useMemo(() => {
    if (reports.length === 0) return { background: 'conic-gradient(#e5e7eb 0 360deg)' }
    let cursor = 0
    const segments = mainCategoryStats.map(([name, count]) => {
      const meta = CATEGORY_META[name] || CATEGORY_META.기타
      const start = cursor
      const end = cursor + (count / reports.length) * 360
      cursor = end
      return `${meta.color} ${start}deg ${end}deg`
    })
    return { background: `conic-gradient(${segments.join(', ')}, #e5e7eb ${cursor}deg 360deg)` }
  }, [mainCategoryStats, reports.length])

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setCategoryFilter('전체')
    setSortType('latest')
  }

  const handleResolve = async (reportId) => {
    if (!reportId) return
    if (!window.confirm('이 제보를 해결 완료 처리하시겠습니까?')) return
    setResolving(reportId)
    try {
      await resolveReport(reportId, memberId)
      setReports((prev) => prev.map((report) => (
        getReportId(report) === reportId ? { ...report, status: 'RESOLVED' } : report
      )))
    } catch (error) {
      console.error('제보 해결 처리 실패:', error)
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setResolving(null)
    }
  }

  const renderReportCard = (report) => {
    const categoryName = normalizeCategory(report.categoryName)
    const meta = CATEGORY_META[categoryName] || CATEGORY_META.기타
    const reportId = getReportId(report)
    const isResolved = isResolvedReport(report)
    const imageUrls = getImageUrls(report)
    const hasImage = imageUrls.length > 0
    const locationText = report.address || report.locationName || report.region || '위치 정보 없음'

    return (
      <article key={reportId} className={`reports-history-card ${isResolved ? 'is-resolved' : ''}`}>
        <div className="reports-history-thumb">
          {hasImage ? (
            <ReportImagePreview
              sources={imageUrls}
              alt="제보 이미지"
              fallback={(
                <div className="reports-history-empty-thumb">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8" cy="9" r="1.6" />
                    <path d="M21 16l-5.5-5.5L7 19" />
                  </svg>
                </div>
              )}
            />
          ) : (
            <div className="reports-history-empty-thumb">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8" cy="9" r="1.6" />
                <path d="M21 16l-5.5-5.5L7 19" />
              </svg>
            </div>
          )}
        </div>

        <div className="reports-history-body">
          <div className="reports-card-topline">
            <span className="reports-category-badge" style={{ color: meta.color, background: meta.bg }}>
              {meta.icon(meta.color)}
              {categoryName}
            </span>
            <span className={`reports-status-pill ${isResolved ? 'is-done' : 'is-active'}`}>
              {isResolved ? '해결 완료' : '진행 중'}
            </span>
          </div>

          <h2>{report.title || '제목 없는 제보'}</h2>
          <p>{report.content || '상세 내용이 입력되지 않았습니다.'}</p>

          <div className="reports-meta-row">
            <span>🕐 {formatDate(report.createdAt)}</span>
            <span>📍 {locationText}</span>
            <span>♡ {report.sympathyCount || 0}명</span>
          </div>
        </div>

        <div className="reports-card-actions">
          <button
            className="reports-ghost-btn"
            type="button"
            onClick={() => navigate('/', {
              state: {
                focusReport: {
                  ...report,
                  reportId,
                  latitude: report.latitude ?? report.lat,
                  longitude: report.longitude ?? report.lng,
                },
              },
            })}
          >
            지도에서 보기
          </button>
          {!isResolved ? (
            <button
              className="reports-resolve-btn"
              type="button"
              onClick={() => handleResolve(reportId)}
              disabled={resolving === reportId}
            >
              {resolving === reportId ? '처리 중...' : <><SmallCheck /> 해결 완료</>}
            </button>
          ) : (
            <span className="reports-done-mark"><SmallCheck /> 처리 완료</span>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="reports-page">
      <Header />

      <main className="reports-page-inner">
        <section className="reports-hero">
          <div>
            <span className="reports-eyebrow">SafePin Reports</span>
            <h1>제보 내역을 한눈에 관리하세요</h1>
            <p>
              데이터베이스에 등록된 전체 재난 제보를 기준으로 현황과 처리 상태를 정리합니다.
              검색·필터·정렬을 활용해 필요한 제보를 빠르게 확인할 수 있습니다.
            </p>
          </div>
          <button type="button" className="reports-hero-btn" onClick={() => navigate('/')}>지도에서 보기</button>
        </section>
        <section className="reports-summary-grid">
          <SummaryCard
            type="total"
            icon={<IconDocument />}
            label="전체 제보"
            value={reports.length}
            description="DB에 등록된 전체 제보 수"
          />
          <SummaryCard
            type="active"
            icon={<IconClock />}
            label="진행 중"
            value={activeReports.length}
            description="현재 처리 중인 제보"
          />
          <SummaryCard
            type="resolved"
            icon={<IconCheck />}
            label="해결 완료"
            value={resolvedReports.length}
            description="해결이 완료된 제보"
          />
        </section>

        <section className="reports-filter-panel">
          <label className="reports-search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="제목 또는 내용을 검색하세요"
            />
          </label>

          <div className="reports-filter-group">
            <span className="reports-filter-label">상태 필터</span>
            <div className="reports-chip-row">
              {Object.entries(statusMeta).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className={`reports-chip ${statusFilter === key ? 'is-selected' : ''}`}
                  style={statusFilter === key ? { color: item.color, background: item.bg, borderColor: item.bg } : undefined}
                  onClick={() => setStatusFilter(key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="reports-filter-group reports-filter-group--wide">
            <span className="reports-filter-label">카테고리 필터</span>
            <div className="reports-chip-row reports-chip-row--scroll">
              {categoryList.map((category) => {
                const meta = CATEGORY_META[category] || CATEGORY_META.기타
                const isAll = category === '전체'
                const selected = categoryFilter === category
                return (
                  <button
                    key={category}
                    type="button"
                    className={`reports-chip reports-category-chip ${selected ? 'is-selected' : ''}`}
                    style={selected ? { color: isAll ? '#2563eb' : meta.color, background: isAll ? '#eff6ff' : meta.bg } : undefined}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {!isAll && <span>{meta.iconText}</span>}
                    {category}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="reports-sort-group">
            <span className="reports-filter-label">정렬</span>
            <select value={sortType} onChange={(event) => setSortType(event.target.value)}>
              <option value="latest">최근 등록 순</option>
              <option value="oldest">오래된 순</option>
              <option value="sympathy">공감 많은 순</option>
              <option value="category">카테고리 순</option>
            </select>
          </div>

          <button type="button" className="reports-reset-btn" onClick={resetFilters}>↻ 필터 초기화</button>
        </section>

        <section className="reports-content-grid">
          <section className="reports-list-column">
            {loading ? (
              <div className="reports-empty-card">제보 내역을 불러오는 중입니다...</div>
            ) : filteredReports.length === 0 ? (
              <div className="reports-empty-card">
                <strong>조건에 맞는 제보가 없습니다.</strong>
                <span>검색어를 지우거나 필터를 초기화해 다시 확인해보세요.</span>
                <button type="button" onClick={resetFilters}>필터 초기화</button>
              </div>
            ) : (
              filteredReports.map(renderReportCard)
            )}
          </section>

          <aside className="reports-side-column">
            <section className="reports-side-card">
              <div className="reports-side-title">↻ 최근 활동</div>
              <div className="reports-activity-list">
                {recentReports.length === 0 ? (
                  <p className="reports-muted">최근 활동이 없습니다.</p>
                ) : recentReports.map((report) => {
                  const categoryName = normalizeCategory(report.categoryName)
                  const meta = CATEGORY_META[categoryName] || CATEGORY_META.기타
                  const isResolved = isResolvedReport(report)
                  return (
                    <button key={getReportId(report)} type="button" className="reports-activity-item" onClick={() => setSearch(report.title || '')}>
                      <span className="reports-activity-icon" style={{ color: meta.color, background: meta.bg }}>{meta.icon(meta.color)}</span>
                      <span>
                        <strong>{report.title || '제목 없는 제보'}</strong>
                        <small>{formatDate(report.createdAt)}</small>
                      </span>
                      <em className={isResolved ? 'is-done' : 'is-active'}>{isResolved ? '완료' : '진행 중'}</em>
                    </button>
                  )
                })}
              </div>
              <button type="button" className="reports-side-link" onClick={resetFilters}>전체 제보 보기 ›</button>
            </section>

            <section className="reports-side-card">
              <div className="reports-side-title">◷ 카테고리 분포</div>
              <div className="reports-donut-row">
                <div className="reports-donut" style={donutStyle}>
                  <div>
                    <strong>{reports.length}</strong>
                    <span>전체</span>
                  </div>
                </div>
                <div className="reports-legend">
                  {mainCategoryStats.map(([category, count]) => {
                    const meta = CATEGORY_META[category] || CATEGORY_META.기타
                    const percent = reports.length ? Math.round((count / reports.length) * 1000) / 10 : 0
                    return (
                      <div key={category}>
                        <span style={{ background: meta.color }} />
                        <em>{category}</em>
                        <strong>{count} ({percent}%)</strong>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="reports-side-card reports-tip-card">
              <div className="reports-side-title">☼ 이용 안내</div>
              <strong>해결 대기 중인 제보를 우선 확인하세요.</strong>
              <p>빠른 확인과 상세한 설명은 문제 해결에 큰 도움이 됩니다.</p>
              <button type="button" onClick={() => setStatusFilter('active')}>제보 관리 팁 보기 ›</button>
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default MyReportsPage
