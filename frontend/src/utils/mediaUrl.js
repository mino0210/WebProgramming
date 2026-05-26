export function getApiBaseUrl() {
  const envBase = (import.meta.env.VITE_API_BASE_URL || '').trim()
  const normalize = (value) => String(value || '').replace(/\/+$/, '')

  const fromCurrentHost = () => {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:8080`
    }
    return 'http://localhost:8080'
  }

  if (!envBase) return fromCurrentHost()
  if (envBase.startsWith('/')) return fromCurrentHost()

  try {
    const url = new URL(envBase)
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : ''
    const isNetworkHost = currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1'

    if (isNetworkHost && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      url.hostname = currentHost
    }

    return normalize(url.origin)
  } catch {
    return normalize(envBase)
  }
}

function getRawMediaValue(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.imageUrl || value.fileUrl || value.filePath || value.path || value.savedName || value.originalName || ''
}

export function getMediaUrl(value) {
  return getMediaUrlCandidates(value)[0] || null
}

export function getMediaUrlCandidates(value) {
  const rawValue = getRawMediaValue(value)
  const raw = String(rawValue || '').trim()
  if (!raw) return []

  const apiBase = getApiBaseUrl()
  const values = []
  const push = (url) => {
    if (url && !values.includes(url)) values.push(url)
  }

  const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      const pathname = url.pathname || ''

      if (url.port === '5173' && pathname.startsWith('/images/')) {
        url.port = '8080'
      }

      if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        const networkUrl = new URL(url.toString())
        networkUrl.hostname = currentHost
        networkUrl.port = '8080'
        push(networkUrl.toString())
      }

      if (pathname.startsWith('/images/')) {
        push(`${apiBase}${pathname}`)
        push(`${currentProtocol}//${currentHost}:8080${pathname}`)
      }

      push(url.toString())
    } catch {
      push(raw)
    }
    return values
  }

  let path = raw
  if (path.startsWith('/images/')) {
    push(`${apiBase}${path}`)
    push(`${currentProtocol}//${currentHost}:8080${path}`)
    return values
  }

  if (path.startsWith('images/')) {
    path = `/${path}`
    push(`${apiBase}${path}`)
    push(`${currentProtocol}//${currentHost}:8080${path}`)
    return values
  }

  if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
    path = path.startsWith('/') ? path : `/${path}`
    push(`${apiBase}${path}`)
    push(`${currentProtocol}//${currentHost}:8080${path}`)
    return values
  }

  const fileName = path.replace(/^\/+/, '')
  push(`${apiBase}/images/${fileName}`)
  push(`${currentProtocol}//${currentHost}:8080/images/${fileName}`)
  return values
}

export function getFirstReportImageUrl(report) {
  return getReportImageUrls(report)[0] || null
}

export function getReportImageUrls(report) {
  if (!report) return []

  const list = []
  if (Array.isArray(report.imageUrls)) list.push(...report.imageUrls)
  if (Array.isArray(report.images)) list.push(...report.images)
  if (Array.isArray(report.reportImages)) list.push(...report.reportImages)
  if (report.imageUrl) list.push(report.imageUrl)
  if (report.imagePath) list.push(report.imagePath)
  if (report.filePath) list.push(report.filePath)
  if (report.thumbnailUrl) list.push(report.thumbnailUrl)

  return list
    .map(getMediaUrl)
    .filter(Boolean)
    .filter((url, index, arr) => arr.indexOf(url) === index)
}
