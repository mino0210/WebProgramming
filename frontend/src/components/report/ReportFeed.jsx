// TODO: 팀원 A 담당 — 우측 실시간 제보 피드
import ReportCard from './ReportCard'

/**
 * ReportFeed
 * props:
 *  - pins: 제보 목록 배열
 */
function ReportFeed({ pins = [] }) {
  return (
      <div style={styles.wrapper}>

        {/* 헤더 */}
        <div style={styles.header}>
          <span style={styles.headerTitle}>📋 실시간 제보</span>
          <span style={styles.count}>{pins.length}건</span>
        </div>

        {/* 목록 */}
        <div style={styles.list}>
          {pins.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🗺️</div>
                <div>아직 제보가 없습니다.</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  지도를 클릭해 첫 제보를 등록해보세요!
                </div>
              </div>
          ) : (
              pins.map((report) => (
                  <ReportCard key={report.reportId} report={report} />
              ))
          )}
        </div>

      </div>
  )
}

const styles = {
  wrapper: {
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f8fafc',
    overflow: 'hidden',
    borderLeft: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  headerTitle: { fontSize: '15px', fontWeight: '700', color: '#1e293b' },
  count: {
    fontSize: '12px', fontWeight: '600',
    background: '#1e40af', color: '#fff',
    padding: '2px 10px', borderRadius: '20px',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '200px',
    color: '#64748b', fontSize: '14px', textAlign: 'center',
  },
}

export default ReportFeed