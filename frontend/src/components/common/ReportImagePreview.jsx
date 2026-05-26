import { useEffect, useMemo, useState } from 'react'
import { getMediaUrlCandidates } from '../../utils/mediaUrl'

function normalizeSources(source, sources) {
  const merged = []
  if (Array.isArray(sources)) merged.push(...sources)
  if (source) merged.push(source)
  return merged.filter(Boolean)
}

function ReportImagePreview({
  source,
  sources,
  alt = '제보 이미지',
  style,
  className,
  fallback,
  fallbackStyle,
  loading = 'lazy',
}) {
  const candidates = useMemo(() => {
    const urls = []
    normalizeSources(source, sources).forEach((item) => {
      getMediaUrlCandidates(item).forEach((url) => {
        if (url && !urls.includes(url)) urls.push(url)
      })
    })
    return urls
  }, [source, sources])

  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setIndex(0)
    setFailed(false)
  }, [candidates.join('|')])

  if (!candidates.length || failed) {
    return fallback || (
      <div className={className} style={fallbackStyle || style}>
        이미지를 불러오지 못했습니다
      </div>
    )
  }

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((prev) => prev + 1)
          return
        }
        console.warn('[SafePin] 이미지 프리뷰 로딩 실패:', candidates)
        setFailed(true)
      }}
    />
  )
}

export default ReportImagePreview
