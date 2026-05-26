function makeIcon(iconText) {
  return (_color, size = 18) => (
    <span
      aria-hidden="true"
      style={{
        width: size + 14,
        height: size + 14,
        minWidth: size + 14,
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size,
        lineHeight: 1,
      }}
    >
      {iconText}
    </span>
  )
}

export const CATEGORY_META = {
  침수: { label: '침수', color: '#3b82f6', activeColor: '#2563eb', bg: '#eff6ff', iconText: '💧', icon: makeIcon('💧') },
  화재: { label: '화재', color: '#ef4444', activeColor: '#dc2626', bg: '#fef2f2', iconText: '🔥', icon: makeIcon('🔥') },
  교통: { label: '교통', color: '#f59e0b', activeColor: '#d97706', bg: '#fffbeb', iconText: '🚗', icon: makeIcon('🚗') },
  낙석: { label: '낙석', color: '#78716c', activeColor: '#57534e', bg: '#f5f5f4', iconText: '⛰️', icon: makeIcon('⛰️') },
  정전: { label: '정전', color: '#eab308', activeColor: '#ca8a04', bg: '#fefce8', iconText: '⚡', icon: makeIcon('⚡') },
  가스누출: { label: '가스누출', color: '#22c55e', activeColor: '#16a34a', bg: '#f0fdf4', iconText: '🟢', icon: makeIcon('🟢') },
  기타: { label: '기타', color: '#64748b', activeColor: '#475569', bg: '#f1f5f9', iconText: '📌', icon: makeIcon('📌') },
}

export const DEFAULT_CATEGORY_NAMES = ['침수', '화재', '교통', '낙석', '정전', '가스누출', '기타']

export function getCategoryMeta(name) {
  return CATEGORY_META[name] || CATEGORY_META.기타
}

export function CategoryIcon({ name, size = 18, background = true, style = {} }) {
  const meta = getCategoryMeta(name)
  return (
    <span
      aria-hidden="true"
      style={{
        width: size + 14,
        height: size + 14,
        minWidth: size + 14,
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: background ? meta.bg : 'transparent',
        color: meta.color,
        fontSize: size,
        lineHeight: 1,
        ...style,
      }}
    >
      {meta.iconText}
    </span>
  )
}
