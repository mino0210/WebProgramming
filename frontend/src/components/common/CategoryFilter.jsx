const CATEGORY_META = {
    침수:    { color: '#3b82f6', activeColor: '#2563eb' },
    화재:    { color: '#ef4444', activeColor: '#dc2626' },
    교통:    { color: '#f59e0b', activeColor: '#d97706' },
    낙석:    { color: '#78716c', activeColor: '#57534e' },
    정전:    { color: '#eab308', activeColor: '#ca8a04' },
    가스누출: { color: '#22c55e', activeColor: '#16a34a' },
}

const CATEGORY_ICONS = {
    침수: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg>,
    화재: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>,
    교통: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
    낙석: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 20h20L12 2z"/><circle cx="15" cy="11" r="1.5" fill={c}/><circle cx="10" cy="16" r="1"/></svg>,
    정전: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c}><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
    가스누출: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18M8 18V9h8v9"/><circle cx="12" cy="6" r="1.5"/><circle cx="16" cy="4" r="1"/><circle cx="8" cy="4" r="1"/></svg>,
}

function CategoryFilter({ categories = [], selected, onChange }) {
    return (
        <div style={styles.wrapper}>
            <div style={styles.left}>
                <button
                    style={{
                        ...styles.btn,
                        background: selected === null ? '#1d4ed8' : '#fff',
                        color: selected === null ? '#fff' : '#374151',
                        border: selected === null ? '1.5px solid #1d4ed8' : '1.5px solid #e5e7eb',
                    }}
                    onClick={() => onChange(null)}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>
                    </svg>
                    전체
                </button>

                {categories.map((cat) => {
                    const meta = CATEGORY_META[cat.name] || { color: '#8b5cf6', activeColor: '#7c3aed' }
                    const isActive = selected === cat.id
                    const icon = CATEGORY_ICONS[cat.name]
                    return (
                        <button
                            key={cat.id}
                            style={{
                                ...styles.btn,
                                background: isActive ? meta.activeColor : '#fff',
                                color: isActive ? '#fff' : '#374151',
                                border: isActive ? `1.5px solid ${meta.activeColor}` : '1.5px solid #e5e7eb',
                            }}
                            onClick={() => onChange(cat.id)}
                        >
                            {icon && icon(isActive ? '#fff' : meta.color)}
                            {cat.name}
                        </button>
                    )
                })}
            </div>

            <div style={styles.right}>
                <label style={styles.checkLabel}>
                    <input type="checkbox" style={{ marginRight: '6px', accentColor: '#1d4ed8' }} />
                    위험 지역만 보기
                </label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ cursor: 'pointer' }}>
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
            </div>
        </div>
    )
}

const styles = {
    wrapper: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 20px', background: '#fff',
        borderBottom: '1px solid #e5e7eb', flexShrink: 0,
    },
    left: { display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' },
    btn: {
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 13px', borderRadius: '9999px',
        fontSize: '13px', fontWeight: '600',
        cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap',
    },
    right: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
    checkLabel: {
        fontSize: '13px', color: '#4b5563', cursor: 'pointer',
        display: 'flex', alignItems: 'center', fontWeight: '500',
    },
}

export default CategoryFilter