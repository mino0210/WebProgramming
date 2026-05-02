import { toggleSympathy } from '../../api/sympathyApi'
// TODO: 팀원 D 담당
function SympathyButton({ reportId, count, memberId }) {
  return <button onClick={() => toggleSympathy(reportId, memberId)}>위험해요 {count}</button>
}
export default SympathyButton
