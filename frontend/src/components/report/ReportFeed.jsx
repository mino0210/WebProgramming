import ReportCard from './ReportCard'

function ReportFeed({ pins = [] }) {
  return (
    <div style={styles.wrapper}>
      {/* 헤더 */}
      <div style={styles.header}>
        <span style={styles.title}>최근 제보</span>
        <span style={styles.more}>전체 보기 &gt;</span>
      </div>

      {/* 목록 */}
      <div style={styles.list}>
        {pins.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>아직 제보가 없습니다</div>
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

      {/* 하단 알림 토글 */}
      <div style={styles.alertRow}>
        <span style={styles.alertText}>🔔 새로운 제보 알림 받기</span>
        <div style={styles.toggle}>
          <div style={styles.toggleKnob} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    width: '320px', flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    background: '#fff', borderLeft: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px 10px',
    borderBottom: '1px solid #f1f5f9', flexShrink: 0,
  },
  title: { fontSize: '15px', fontWeight: '700', color: '#1e293b' },
  more: { fontSize: '12px', color: '#3b82f6', cursor: 'pointer' },
  list: {
    flex: 1, overflowY: 'auto',
  },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '200px', textAlign: 'center',
    padding: '20px',
  },
  alertRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid #f1f5f9', flexShrink: 0,
    background: '#f8fafc',
  },
  alertText: { fontSize: '13px', color: '#374151', fontWeight: '500' },
  toggle: {
    width: '42px', height: '24px', borderRadius: '12px',
    background: '#3b82f6', position: 'relative', cursor: 'pointer',
  },
  toggleKnob: {
    position: 'absolute', right: '3px', top: '3px',
    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
  },
}

export default ReportFeed
