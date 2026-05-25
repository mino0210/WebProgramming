import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'

const CATEGORIES = [
  {
    id: 'flood',
    name: '침수',
    color: '#3b82f6',
    bg: '#eff6ff',
    darkBg: '#1e3a8a',
    emoji: '🌊',
    icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill={c}><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg>,
    tagline: '집중호우·하천범람·지하침수',
    desc: '폭우나 하천 범람으로 낮은 지역, 지하공간, 지하차도에 물이 차오르는 재난입니다. 매년 여름 집중호우 시즌에 특히 주의가 필요합니다.',
    stat: '연평균 피해액 1조 2천억 원 (국민안전처)',
    beforeList: [
      '침수 위험 지역(저지대·지하공간) 사전 파악',
      '기상청 앱에서 호우 경보 알림 설정',
      '비상용품(손전등, 라디오, 비상식량) 3일치 준비',
      '중요 서류와 귀중품 높은 곳에 보관',
      '자동차 침수 방지 위해 고지대 주차 계획 수립',
    ],
    duringList: [
      '지하공간·저지대 즉시 대피 — 물이 무릎 높이 이상이면 탈출 불가',
      '침수된 도로 절대 진입 금지 (성인도 30cm 유속에 쓸릴 수 있음)',
      '전기 차단 후 대피 — 누전·감전 위험',
      '라디오·방재 앱으로 대피 명령 실시간 청취',
      '대피 시 엘리베이터 대신 계단 이용',
    ],
    afterList: [
      '침수된 집에 들어가기 전 가스 밸브 잠금 확인',
      '침수된 식품·음용수 절대 섭취 금지',
      '오염된 물 접촉 시 손발 즉시 세척',
      '구조물 안전 확인 후 귀가',
    ],
    emergencyTip: '지하차도 진입 중 침수 시 창문을 열고 탈출하세요. 차 문은 수압으로 열리지 않을 수 있습니다.',
  },
  {
    id: 'fire',
    name: '화재',
    color: '#ef4444',
    bg: '#fef2f2',
    darkBg: '#7f1d1d',
    emoji: '🔥',
    icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill={c}><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>,
    tagline: '주거화재·전기화재·산불',
    desc: '가정 내 부주의, 전기 합선, 가스 누출 등으로 발생합니다. 초기 진화가 핵심이며, 3분 이내 대응이 인명 피해를 결정합니다.',
    stat: '국내 연간 화재 4만여 건, 사망자 300여 명 (소방청)',
    beforeList: [
      '가정용 소화기 비치 및 사용법 숙지',
      '화재경보기·연기감지기 설치 및 주기적 점검',
      '대피 경로 2개 이상 사전 확인',
      '전기장판·멀티탭 과부하 방지',
      '취침 전 가스 밸브 잠금 습관화',
    ],
    duringList: [
      '큰 소리로 "불이야!" 외쳐 주변에 알림',
      '초기 화재 — 소화기로 진화 시도 (30초 내 불 크기가 기준)',
      '연기가 많으면 자세 낮추고 코·입 막고 대피',
      '엘리베이터 절대 사용 금지 — 계단으로 대피',
      '문 손잡이가 뜨거우면 열지 말고 창문으로 구조 요청',
    ],
    afterList: [
      '소방관 허가 없이 화재 현장 출입 금지',
      '연기 흡입 시 즉시 병원 방문',
      '화재보험 신고 및 피해 사진 촬영',
    ],
    emergencyTip: '연기 속에서는 바닥을 기어 대피하세요. 연기는 위로 올라가기 때문에 낮은 곳의 공기가 더 깨끗합니다.',
  },
  {
    id: 'traffic',
    name: '교통',
    color: '#f59e0b',
    bg: '#fffbeb',
    darkBg: '#78350f',
    emoji: '🚗',
    icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill={c}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
    tagline: '다중추돌·도로결빙·도로함몰',
    desc: '교통사고, 도로 결빙, 낙석, 노면 함몰 등으로 이동이 제한되거나 2차 피해가 발생하는 상황입니다.',
    stat: '하루 평균 교통사고 580건, 사망자 8명 (도로교통공단)',
    beforeList: [
      '블랙박스 및 비상삼각대 상시 구비',
      '겨울철 타이어 교체 및 체인 준비',
      '비상연락망(보험사·견인서비스) 저장',
      '긴급출동 서비스 가입 여부 확인',
    ],
    duringList: [
      '사고 발생 시 차량 후방 100m에 삼각대 설치',
      '비상등 켜고 가드레일 밖으로 대피',
      '부상자 있을 경우 119 즉시 신고',
      '2차 사고 방지 위해 차도 위 머물지 않기',
      '블랙박스 영상 보존',
    ],
    afterList: [
      '보험사에 사고 접수 (사진·영상 증거 제출)',
      '목격자 연락처 확보',
      '교통안전공단 교통사고 피해 지원 신청',
    ],
    emergencyTip: '추돌 사고 직후 차에서 내릴 때는 반드시 후방을 확인하세요. 2차 추돌이 더 위험합니다.',
  },
  {
    id: 'rockfall',
    name: '낙석',
    color: '#78716c',
    bg: '#f5f5f4',
    darkBg: '#292524',
    emoji: '🪨',
    icon: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 20h20L12 2z"/><circle cx="15" cy="11" r="1.5" fill={c}/><circle cx="10" cy="16" r="1"/></svg>,
    tagline: '산악낙석·절개지붕괴·토사유출',
    desc: '집중호우나 지진 후 산사면·절개지에서 돌이나 흙이 무너져 내리는 재난입니다. 예측이 어려워 사전 대피가 중요합니다.',
    stat: '연평균 토사재해 사망자 20여 명 (산림청)',
    beforeList: [
      '거주지 인근 급경사지 위험 등급 확인 (급경사지 안전관리 시스템)',
      '비탈면·절개지 균열·변색 징후 상시 관찰',
      '폭우 예보 시 위험 지역 접근 자제',
      '대피장소 및 경로 사전 숙지',
    ],
    duringList: [
      '굉음이나 진동 느껴지면 즉시 수직 방향으로 대피',
      '낙석 방향을 등지고 빠르게 이동',
      '바위 뒤·지형지물 뒤로 몸 피하기',
      '119 또는 지자체 재난 신고센터(120) 신고',
    ],
    afterList: [
      '현장 복구 전 추가 낙석 위험 지역 접근 금지',
      '지자체 현황 파악 후 귀가',
      '시설 피해는 지자체 재난 피해 신고',
    ],
    emergencyTip: '산 근처에서 갑자기 흙 냄새가 강해지거나 작은 돌들이 굴러 내려오면 즉시 대피하세요.',
  },
  {
    id: 'blackout',
    name: '정전',
    color: '#eab308',
    bg: '#fefce8',
    darkBg: '#713f12',
    emoji: '⚡',
    icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill={c}><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
    tagline: '대규모정전·송전선 단선·낙뢰',
    desc: '전력 공급이 중단되면 냉난방·의료기기·신호등 등 도시 기반시설 전체가 영향을 받습니다. 특히 혹한·혹서기 정전은 생명 위험과 직결됩니다.',
    stat: '연간 자연재해 정전 건수 2만여 건 (한국전력)',
    beforeList: [
      '손전등·보조배터리·라디오 상시 구비',
      '냉장고 식품 보존 기준 온도 숙지',
      '의료기기(산소호흡기 등) 사용자는 한전에 사전 등록',
      '비상연락망 종이에 출력해두기',
    ],
    duringList: [
      '불필요한 전기제품 플러그 분리 (복전 시 과부하 방지)',
      '냉장고 문 최소한으로 열기 (4시간 유지 가능)',
      '신호등 꺼진 교차로 — 4거리 모두 정지 후 서행 통과',
      '엘리베이터 갇힘 시 비상 버튼 누르고 대기',
    ],
    afterList: [
      '가전제품 전원 서서히 연결 (한꺼번에 연결 금지)',
      '복전 후 냉장고 식품 상태 확인',
      '정전 피해는 한전(123) 신고',
    ],
    emergencyTip: '정전 시 양초 대신 손전등을 사용하세요. 양초는 화재 위험이 있습니다.',
  },
  {
    id: 'gas',
    name: '가스누출',
    color: '#22c55e',
    bg: '#f0fdf4',
    darkBg: '#14532d',
    emoji: '💨',
    icon: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18M8 18V9h8v9"/><circle cx="12" cy="6" r="1.5"/><circle cx="16" cy="4" r="1"/><circle cx="8" cy="4" r="1"/></svg>,
    tagline: '도시가스누출·LPG폭발·일산화탄소',
    desc: '가스 누출은 폭발 또는 질식 위험을 동반합니다. 특히 냄새가 없는 일산화탄소는 더욱 위험하며, 초기 대처가 생사를 가릅니다.',
    stat: '연간 가스 사고 약 100건, LPG 사고 60% 차지 (한국가스안전공사)',
    beforeList: [
      '가스 누출 감지기 설치 (특히 1인 가구)',
      '밸브 잠금 위치 및 방법 가족 모두 숙지',
      '정기 가스시설 안전 점검 신청 (가스공사 무료)',
      '보일러실 환기 상태 주기적 확인',
    ],
    duringList: [
      '가스 냄새 맡으면 즉시 코·입 막고 환기',
      '절대 전기 스위치·콘센트 조작 금지 (스파크→폭발)',
      '가스 밸브 잠금 → 창문 열기 → 즉시 대피',
      '엘리베이터 사용 금지 — 계단으로 대피',
      '건물 밖에서 119 및 도시가스(1544-4500) 신고',
    ],
    afterList: [
      '가스 전문가 점검 후에만 가스 재사용',
      '가스공사 안전 점검 신청',
      '환기 충분히 된 후 귀가',
    ],
    emergencyTip: '가스 누출 시 절대 라이터·담배에 불을 붙이지 마세요. 정전일 때도 촛불은 폭발 원인이 됩니다.',
  },
]

const EMERGENCY_NUMBERS = [
  { num: '119', label: '소방·구급', color: '#ef4444', bg: '#fef2f2' },
  { num: '112', label: '경찰신고', color: '#3b82f6', bg: '#eff6ff' },
  { num: '120', label: '재난신고', color: '#f59e0b', bg: '#fffbeb' },
  { num: '1588-9119', label: '재난안전', color: '#8b5cf6', bg: '#f5f3ff' },
  { num: '1544-4500', label: '도시가스', color: '#22c55e', bg: '#f0fdf4' },
  { num: '123', label: '한전(정전)', color: '#eab308', bg: '#fefce8' },
]

function GuidePage() {
  const navigate = useNavigate()
  const [selectedCat, setSelectedCat] = useState('flood')
  const [activeTab, setActiveTab] = useState('before') // before | during | after

  const cat = CATEGORIES.find((c) => c.id === selectedCat)

  return (
    <div style={styles.page}>
      <Header />

      {/* 히어로 배너 */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>재난 대응 가이드</div>
          <h1 style={styles.heroTitle}>재난이란 무엇인가요?</h1>
          <p style={styles.heroDesc}>
            재난은 인명·재산 피해를 일으키는 자연적·사회적 현상으로, <strong>사전 준비와 초기 대응</strong>이 피해 규모를 크게 줄입니다.<br/>
            SafePin 재난 가이드는 시민 제보 데이터를 바탕으로 주요 재난 유형별 행동 요령을 제공합니다.
          </p>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}><strong>6가지</strong> 재난 유형</div>
            <div style={styles.heroStatDiv}/>
            <div style={styles.heroStat}><strong>3단계</strong> 행동 요령</div>
            <div style={styles.heroStatDiv}/>
            <div style={styles.heroStat}><strong>실시간</strong> 제보 연동</div>
          </div>
        </div>
      </div>

      {/* 비상 연락처 */}
      <div style={styles.emergencySection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg>
            긴급 연락처
          </div>
          <div style={styles.emergencyGrid}>
            {EMERGENCY_NUMBERS.map((e) => (
              <div key={e.num} style={{ ...styles.emergencyCard, background: e.bg, border: `1px solid ${e.color}22` }}>
                <div style={{ ...styles.emergencyNum, color: e.color }}>{e.num}</div>
                <div style={styles.emergencyLabel}>{e.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div style={styles.catSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            재난 유형 선택
          </div>
          <div style={styles.catGrid}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                style={{
                  ...styles.catBtn,
                  background: selectedCat === c.id ? c.color : '#fff',
                  color: selectedCat === c.id ? '#fff' : '#374151',
                  border: `2px solid ${selectedCat === c.id ? c.color : '#e5e7eb'}`,
                  boxShadow: selectedCat === c.id ? `0 4px 14px ${c.color}40` : 'none',
                }}
                onClick={() => { setSelectedCat(c.id); setActiveTab('before') }}
              >
                <span style={{ fontSize: '22px' }}>{c.emoji}</span>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{c.name}</span>
                <span style={{
                  fontSize: '11px',
                  color: selectedCat === c.id ? 'rgba(255,255,255,0.8)' : '#9ca3af',
                  marginTop: '2px',
                }}>
                  {c.tagline.split('·')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 가이드 */}
      {cat && (
        <div style={styles.detailSection}>
          <div style={styles.sectionInner}>
            {/* 카드 헤더 */}
            <div style={{ ...styles.detailCard }}>
              <div style={{ ...styles.detailHeader, background: `linear-gradient(135deg, ${cat.darkBg}, ${cat.color})` }}>
                <div style={styles.detailHeaderLeft}>
                  <div style={styles.detailEmoji}>{cat.emoji}</div>
                  <div>
                    <div style={styles.detailName}>{cat.name} 재난</div>
                    <div style={styles.detailTagline}>{cat.tagline}</div>
                  </div>
                </div>
                <div style={styles.detailStatBadge}>{cat.stat}</div>
              </div>

              {/* 개요 */}
              <div style={styles.detailOverview}>
                <div style={styles.overviewIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <p style={styles.overviewText}>{cat.desc}</p>
              </div>

              {/* 탭 */}
              <div style={styles.tabs}>
                {[
                  { key: 'before', label: '📋 사전 준비', sub: '평소에' },
                  { key: 'during', label: '🚨 발생 시', sub: '즉각 행동' },
                  { key: 'after', label: '✅ 사후 조치', sub: '안정화' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    style={{
                      ...styles.tab,
                      background: activeTab === tab.key ? cat.color : 'transparent',
                      color: activeTab === tab.key ? '#fff' : '#6b7280',
                      borderBottom: activeTab === tab.key ? `3px solid ${cat.color}` : '3px solid transparent',
                    }}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span style={{ fontWeight: '700' }}>{tab.label}</span>
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>{tab.sub}</span>
                  </button>
                ))}
              </div>

              {/* 가이드 내용 */}
              <div style={styles.guideList}>
                {(activeTab === 'before' ? cat.beforeList : activeTab === 'during' ? cat.duringList : cat.afterList).map((item, i) => (
                  <div key={i} style={styles.guideItem}>
                    <div style={{ ...styles.guideNum, background: cat.bg, color: cat.color }}>
                      {i + 1}
                    </div>
                    <div style={styles.guideText}>{item}</div>
                  </div>
                ))}
              </div>

              {/* 긴급 팁 */}
              <div style={{ ...styles.emergencyTip, borderLeft: `4px solid ${cat.color}`, background: cat.bg }}>
                <div style={{ ...styles.tipLabel, color: cat.color }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={cat.color}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  핵심 대처법
                </div>
                <div style={styles.tipText}>{cat.emergencyTip}</div>
              </div>

              {/* CTA */}
              <div style={styles.detailCta}>
                <button style={{ ...styles.ctaBtn, background: cat.color }} onClick={() => navigate('/')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  지도에서 {cat.name} 제보 보기
                </button>
                <button style={styles.ctaOutlineBtn} onClick={() => navigate('/stats')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  {cat.name} 통계 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 안내 */}
      <div style={styles.bottomNote}>
        <div style={styles.sectionInner}>
          <div style={styles.noteBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>본 가이드는 국민재난안전포털, 소방청, 행정안전부 지침을 바탕으로 제작되었습니다. 실제 상황에서는 현장 상황을 최우선 판단하세요.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', background: '#f8fafc',
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
  sectionInner: { maxWidth: '860px', margin: '0 auto', padding: '0 24px' },
  // 히어로
  hero: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
    padding: '40px 0 36px',
  },
  heroInner: { maxWidth: '860px', margin: '0 auto', padding: '0 24px' },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)',
    fontSize: '12px', fontWeight: '700', padding: '5px 12px',
    borderRadius: '9999px', marginBottom: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  heroTitle: { fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 10px' },
  heroDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: '0 0 20px' },
  heroStats: { display: 'flex', alignItems: 'center', gap: '16px' },
  heroStat: { fontSize: '13px', color: 'rgba(255,255,255,0.8)' },
  heroStatDiv: { width: '1px', height: '14px', background: 'rgba(255,255,255,0.3)' },
  // 비상연락
  emergencySection: { padding: '24px 0 8px' },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', fontWeight: '700', color: '#374151',
    marginBottom: '12px',
  },
  emergencyGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px',
  },
  emergencyCard: {
    borderRadius: '10px', padding: '12px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    textAlign: 'center',
  },
  emergencyNum: { fontSize: '15px', fontWeight: '800' },
  emergencyLabel: { fontSize: '11px', color: '#6b7280', fontWeight: '500' },
  // 카테고리
  catSection: { padding: '16px 0 8px' },
  catGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px',
  },
  catBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '14px 8px', borderRadius: '12px',
    cursor: 'pointer', transition: 'all 0.15s',
    gap: '4px',
  },
  // 상세
  detailSection: { padding: '16px 0 32px' },
  detailCard: {
    background: '#fff', borderRadius: '16px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
  },
  detailHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '24px',
    flexWrap: 'wrap', gap: '12px',
  },
  detailHeaderLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  detailEmoji: { fontSize: '40px', lineHeight: 1 },
  detailName: { fontSize: '20px', fontWeight: '800', color: '#fff' },
  detailTagline: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '3px' },
  detailStatBadge: {
    background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)',
    fontSize: '11px', fontWeight: '600', padding: '6px 12px',
    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
    alignSelf: 'center',
  },
  detailOverview: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '16px 24px', background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
  },
  overviewIcon: {
    width: '24px', height: '24px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: '1px',
  },
  overviewText: { fontSize: '13px', color: '#4b5563', lineHeight: 1.7, margin: 0 },
  tabs: {
    display: 'flex', borderBottom: '1px solid #e5e7eb',
  },
  tab: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 8px', border: 'none', cursor: 'pointer',
    gap: '2px', transition: 'all 0.15s',
  },
  guideList: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    padding: '20px 24px',
  },
  guideItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
  },
  guideNum: {
    width: '26px', height: '26px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '800', flexShrink: 0,
  },
  guideText: {
    fontSize: '14px', color: '#374151', lineHeight: 1.6, paddingTop: '3px',
  },
  emergencyTip: {
    margin: '0 24px 20px', borderRadius: '10px',
    padding: '14px 16px',
  },
  tipLabel: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', fontWeight: '700', marginBottom: '6px',
  },
  tipText: { fontSize: '13px', color: '#374151', lineHeight: 1.6 },
  detailCta: {
    display: 'flex', gap: '10px', padding: '16px 24px',
    borderTop: '1px solid #f3f4f6', flexWrap: 'wrap',
  },
  ctaBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 18px', border: 'none', borderRadius: '10px',
    color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
  },
  ctaOutlineBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 18px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
    background: '#fff', color: '#4b5563', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
  },
  // 하단
  bottomNote: { padding: '0 0 32px' },
  noteBox: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '14px 16px', background: '#eff6ff',
    border: '1px solid #bfdbfe', borderRadius: '10px',
    fontSize: '12px', color: '#1d4ed8', lineHeight: 1.6,
  },
}

export default GuidePage
