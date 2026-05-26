import { CategoryIcon, getCategoryMeta } from '../../utils/categoryMeta'

function CategoryFilter({ categories = [], selected, onChange, dangerOnly = false, onDangerOnlyChange }) {
  return (
    <div className="category-filter" style={styles.wrapper}>
      <div style={styles.left}>
        <button
          type="button"
          style={{
            ...styles.btn,
            background: selected === null ? '#1d4ed8' : '#fff',
            color: selected === null ? '#fff' : '#374151',
            border: selected === null ? '1.5px solid #1d4ed8' : '1.5px solid #e5e7eb',
          }}
          onClick={() => onChange?.(null)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>
          </svg>
          전체
        </button>

        {categories.map((cat) => {
          const meta = getCategoryMeta(cat.name)
          const isActive = selected === cat.id
          return (
            <button
              type="button"
              key={cat.id}
              style={{
                ...styles.btn,
                background: isActive ? meta.activeColor : '#fff',
                color: isActive ? '#fff' : '#374151',
                border: isActive ? `1.5px solid ${meta.activeColor}` : '1.5px solid #e5e7eb',
              }}
              onClick={() => onChange?.(cat.id)}
            >
              <CategoryIcon name={cat.name} size={14} background={false} style={{ color: isActive ? '#fff' : meta.color, width: 20, height: 20, minWidth: 20 }} />
              {cat.name}
            </button>
          )
        })}
      </div>

      <div style={styles.right}>
        <label style={styles.checkLabel} title="공감 4개 이상 또는 주변 제보 3건 이상만 표시">
          <input
            type="checkbox"
            checked={dangerOnly}
            onChange={(e) => onDangerOnlyChange?.(e.target.checked)}
            style={{ marginRight: '6px', accentColor: '#1d4ed8' }}
          />
          위험 지역만 보기
        </label>
        <span style={styles.help}>공감·밀도 기준</span>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px', background: '#fff',
    borderBottom: '1px solid #e5e7eb', flexShrink: 0,
    gap: '14px',
  },
  left: { display: 'flex', gap: '9px', flexWrap: 'wrap', alignItems: 'center' },
  btn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 17px', borderRadius: '9999px',
    fontSize: '15px', fontWeight: '800',
    cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap',
  },
  right: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  checkLabel: {
    fontSize: '14px', color: '#334155', cursor: 'pointer',
    display: 'flex', alignItems: 'center', fontWeight: '800',
    whiteSpace: 'nowrap',
  },
  help: { fontSize: '12px', fontWeight: '700', color: '#94a3b8', whiteSpace: 'nowrap' },
}

export default CategoryFilter
