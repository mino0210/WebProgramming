// TODO: 팀원 A 담당
/**
 * CategoryFilter
 * props:
 *  - categories: [{ id, name }]
 *  - selected: 현재 선택된 categoryName (null이면 전체)
 *  - onChange: (categoryName | null) => void
 */

const CATEGORY_EMOJI = {
  침수: '🌊',
  화재: '🔥',
  교통: '🚗',
  낙석: '🪨',
};

function CategoryFilter({ categories = [], selected, onChange }) {
  return (
      <div style={styles.wrapper}>
        <button
            style={{ ...styles.btn, ...(selected === null ? styles.btnActive : {}) }}
            onClick={() => onChange(null)}
        >
          🗺️ 전체
        </button>
        {categories.map((cat) => (
            <button
                key={cat.id}
                style={{ ...styles.btn, ...(selected === cat.name ? styles.btnActive : {}) }}
                onClick={() => onChange(cat.name)}
            >
              {CATEGORY_EMOJI[cat.name] || '📌'} {cat.name}
            </button>
        ))}
      </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '10px 14px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
  },
  btn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1.5px solid #cbd5e1',
    background: '#f8fafc',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnActive: {
    background: '#1e40af',
    borderColor: '#1e40af',
    color: '#ffffff',
    fontWeight: '700',
  },
};

export default CategoryFilter;