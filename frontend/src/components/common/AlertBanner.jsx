// TODO: 팀원 D 담당
function AlertBanner({ alerts }) {
  if (!alerts.length) return null
  // 변경: style → className (layout.css의 .alert-banner)
  return <div className="alert-banner">⚠️ 경보 발령 중 — 위험 지역을 확인하세요</div>
}
export default AlertBanner
