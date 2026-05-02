// TODO: 팀원 D 담당
function AlertBanner({ alerts }) {
  if (!alerts.length) return null
  return <div style={{ background: '#FF4500', color: '#fff', padding: 8 }}>경보 발령 중</div>
}
export default AlertBanner
