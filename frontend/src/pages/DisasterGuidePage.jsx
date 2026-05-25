import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'

const categories = [
  {
    name: '침수',
    icon: '💧',
    color: '#3b82f6',
    bg: '#eff6ff',
    summary: '집중호우·배수 불량·하천 범람으로 도로와 지하공간이 물에 잠기는 상황입니다.',
    examples: ['지하차도·지하주차장 물 고임', '맨홀 역류', '도로 통행 불가'],
    actions: ['지하공간 진입 금지', '전기 차단 후 대피', '물살이 빠른 도로는 우회'],
  },
  {
    name: '화재',
    icon: '🔥',
    color: '#ef4444',
    bg: '#fef2f2',
    summary: '건물·산림·차량 등에서 연기나 불꽃이 확인되는 위험 상황입니다.',
    examples: ['건물 외벽 연기', '쓰레기장·차량 화재', '산불 확산'],
    actions: ['119 신고', '연기 반대 방향 대피', '엘리베이터 사용 금지'],
  },
  {
    name: '교통',
    icon: '🚗',
    color: '#f59e0b',
    bg: '#fffbeb',
    summary: '사고·정체·도로 통제 등 이동 안전에 영향을 주는 상황입니다.',
    examples: ['교차로 사고', '도로 낙하물', '긴급 공사 통제'],
    actions: ['속도 줄이기', '우회 경로 선택', '2차 사고 주의'],
  },
  {
    name: '낙석',
    icon: '⛰️',
    color: '#78716c',
    bg: '#f5f5f4',
    summary: '비탈면·공사장·산길에서 돌이나 토사가 떨어지는 상황입니다.',
    examples: ['절개지 돌 떨어짐', '토사 유출', '등산로 붕괴 조짐'],
    actions: ['해당 구간 즉시 이탈', '차량 정차 금지', '추가 붕괴 가능성 공유'],
  },
  {
    name: '정전',
    icon: '⚡',
    color: '#eab308',
    bg: '#fefce8',
    summary: '건물·도로·상가 일대 전력 공급이 중단된 상황입니다.',
    examples: ['신호등 미작동', '엘리베이터 정지', '상가 일대 전력 장애'],
    actions: ['촛불 사용 자제', '엘리베이터 구조 요청', '교차로 서행'],
  },
  {
    name: '가스누출',
    icon: '🟢',
    color: '#22c55e',
    bg: '#f0fdf4',
    summary: '가스 냄새·배관 파손·누출 의심 등 폭발 위험이 있는 상황입니다.',
    examples: ['도시가스 냄새', '공사 중 배관 파손', '실내 가스 경보음'],
    actions: ['스위치 조작 금지', '창문 개방 후 대피', '가스 밸브 잠금'],
  },
]

const guideSteps = [
  { title: '1. 위험 확인', body: '위험이 보이면 먼저 본인의 안전거리를 확보합니다.' },
  { title: '2. 지도 제보', body: '현재 위치 또는 지도 클릭 위치에 카테고리와 상황을 간단히 남깁니다.' },
  { title: '3. 주변 공유', body: '공감 수와 제보 밀도가 높아지면 주변 사용자에게 위험 알림이 표시됩니다.' },
]

function DisasterGuidePage() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <Header />
      <main style={styles.main}>
        <section style={styles.hero}>
          <div>
            <span style={styles.eyebrow}>SafePin Guide</span>
            <h1 style={styles.title}>재난 상황, 빠르게 보고 안전하게 공유하세요</h1>
            <p style={styles.description}>
              SafePin은 사용자의 실시간 제보를 지도 위에 표시해 주변 위험을 빠르게 파악하도록 돕는 웹 서비스입니다.
              아래 가이드는 제보 전 확인해야 할 기준과 카테고리별 대표 대응 방법을 정리한 안내입니다.
            </p>
          </div>
          <button style={styles.primaryBtn} onClick={() => navigate('/')}>지도에서 제보하기</button>
        </section>

        <section style={styles.stepsGrid}>
          {guideSteps.map((step) => (
            <article key={step.title} style={styles.stepCard}>
              <div style={styles.stepTitle}>{step.title}</div>
              <p style={styles.stepBody}>{step.body}</p>
            </article>
          ))}
        </section>

        <section style={styles.infoPanel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.sectionTitle}>재난이란?</h2>
            <span style={styles.panelTag}>생활 안전 중심</span>
          </div>
          <p style={styles.panelText}>
            재난은 자연현상, 시설 문제, 사고 등으로 인해 사람의 생명·신체·재산에 피해를 줄 수 있는 상황을 말합니다.
            SafePin에서는 일상 이동 중 바로 확인 가능한 침수, 화재, 교통, 낙석, 정전, 가스누출을 핵심 유형으로 분류합니다.
          </p>
        </section>

        <section>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>카테고리별 대표 사례와 행동 요령</h2>
            <p style={styles.sectionDesc}>제보를 등록할 때 가장 가까운 유형을 선택하면 지도와 통계에서 더 정확하게 분류됩니다.</p>
          </div>
          <div style={styles.categoryGrid}>
            {categories.map((item) => (
              <article key={item.name} style={styles.categoryCard}>
                <div style={styles.categoryTop}>
                  <span style={{ ...styles.categoryIcon, background: item.bg, color: item.color }}>{item.icon}</span>
                  <div>
                    <h3 style={styles.categoryName}>{item.name}</h3>
                    <p style={styles.categorySummary}>{item.summary}</p>
                  </div>
                </div>
                <div style={styles.listGroup}>
                  <div style={styles.listTitle}>대표 사례</div>
                  {item.examples.map((text) => <div key={text} style={styles.listItem}>• {text}</div>)}
                </div>
                <div style={styles.listGroup}>
                  <div style={styles.listTitle}>행동 요령</div>
                  {item.actions.map((text) => <div key={text} style={styles.listItem}>• {text}</div>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f7f9fc', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" },
  main: { maxWidth: '1180px', margin: '0 auto', padding: '28px 24px 48px' },
  hero: {
    display: 'flex', justifyContent: 'space-between', gap: '24px', alignItems: 'center',
    padding: '32px', borderRadius: '24px', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #fff7ed 100%)',
    border: '1px solid #e5edf8', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)'
  },
  eyebrow: { display: 'inline-flex', padding: '5px 10px', borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', fontSize: '12px', fontWeight: 800 },
  title: { margin: '14px 0 10px', fontSize: '32px', lineHeight: 1.22, color: '#0f172a', letterSpacing: '-0.6px' },
  description: { margin: 0, maxWidth: '760px', fontSize: '15px', lineHeight: 1.8, color: '#475569' },
  primaryBtn: { flexShrink: 0, border: 'none', background: '#2563eb', color: '#fff', borderRadius: '14px', padding: '14px 20px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.22)' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '18px' },
  stepCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '18px', boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)' },
  stepTitle: { fontSize: '15px', fontWeight: 800, color: '#111827' },
  stepBody: { margin: '8px 0 0', color: '#64748b', fontSize: '13px', lineHeight: 1.7 },
  infoPanel: { marginTop: '24px', background: '#111827', color: '#fff', borderRadius: '22px', padding: '24px 26px', boxShadow: '0 14px 32px rgba(17, 24, 39, 0.18)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  panelTag: { background: 'rgba(255,255,255,0.12)', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', fontWeight: 700 },
  panelText: { margin: '12px 0 0', color: '#d1d5db', lineHeight: 1.8, fontSize: '14px' },
  sectionHeader: { marginTop: '30px', marginBottom: '16px' },
  sectionTitle: { margin: 0, fontSize: '22px', color: '#111827', letterSpacing: '-0.3px' },
  sectionDesc: { margin: '8px 0 0', color: '#64748b', fontSize: '14px' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  categoryCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '18px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)' },
  categoryTop: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  categoryIcon: { width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
  categoryName: { margin: 0, fontSize: '17px', color: '#111827' },
  categorySummary: { margin: '5px 0 0', color: '#64748b', fontSize: '13px', lineHeight: 1.6 },
  listGroup: { marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' },
  listTitle: { fontSize: '12px', color: '#334155', fontWeight: 800, marginBottom: '6px' },
  listItem: { color: '#64748b', fontSize: '13px', lineHeight: 1.7 },
}

export default DisasterGuidePage
