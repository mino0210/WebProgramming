/**
 * CategoryFilter - 초안 UI 반영
 * props:
 *  - categories: [{ id, name }]  ← 백엔드 연결 후 사용
 *  - selected: 선택된 categoryName (null이면 전체)
 *  - onChange: (categoryName | null) => void
 */

const CATEGORIES = [
  { name: '전체',   icon: '⊞',  color: '#1e40af', bg: '#1e40af' },
  { name: '침수',   icon: '💧', color: '#3b82f6', bg: '#eff6ff' },
  { name: '화재',   icon: '🔥', color: '#ef4444', bg: '#fef2f2' },
  { name: '교통',   icon: '🚗', color: '#f59e0b', bg: '#fffbeb' },
  { name: '낙석',   icon: '⛰️', color: '#78716c', bg: '#f5f5f4' },
  { name: '기타',   icon: '···', color: '#6b7280', bg: '#f3f4f6' },
]

function CategoryFilter({ selected, onChange }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        {CATEGORIES.map((cat) => {
          const isActive = cat.name === '전체' ? selected === null : selected === cat.name
          const activeColor = cat.name === '전체' ? '#1e40af' : cat.color
          return (
            <button
              key={cat.name}
              style={{
                ...styles.btn,
                background: isActive ? activeColor : '#fff',
                color: isActive ? '#fff' : '#374151',
                borderColor: isActive ? activeColor : '#d1d5db',
                fontWeight: isActive ? '700' : '500',
              }}
              onClick={() => onChange(cat.name === '전체' ? null : cat.name)}
            >
              <span style={{ fontSize: '14px' }}>{cat.icon}</span>
              {cat.name}
            </button>
          )
        })}
      </div>
      <div style={styles.right}>
        <label style={styles.checkLabel}>
          <input type="checkbox" style={{ marginRight: '6px' }} />
          위험 지역만 보기
        </label>
        <span style={styles.infoIcon}>ℹ️</span>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px', background: '#fff',
    borderBottom: '1px solid #e2e8f0', flexShrink: 0,
  },
  left: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  btn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '6px 14px', borderRadius: '20px',
    border: '1.5px solid #d1d5db',
    fontSize: '13px', cursor: 'pointer',
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
  right: { display: 'flex', alignItems: 'center', gap: '6px' },
  checkLabel: { fontSize: '13px', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  infoIcon: { fontSize: '14px', cursor: 'pointer' },
}

export default CategoryFilter
