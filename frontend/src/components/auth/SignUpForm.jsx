import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * 회원가입 폼 컴포넌트 — feature/frontend-auth 담당 (팀원 B)
 * SignUpPage.jsx 안에서 사용
 *
 * [수정 이력] SignUpPage 코드가 잘못 들어있던 것 정정
 */
function SignUpForm() {
  const navigate        = useNavigate()
  const { handleSignUp } = useAuth()

  const [form, setForm] = useState({ loginId:'', password:'', passwordCheck:'', nickname:'', gender:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.loginId || !form.password || !form.nickname || !form.gender) return '모든 항목을 입력해주세요.'
    if (form.loginId.length < 4)         return '아이디는 4자 이상이어야 합니다.'
    if (form.password.length < 6)        return '비밀번호는 6자 이상이어야 합니다.'
    if (form.password !== form.passwordCheck) return '비밀번호가 일치하지 않습니다.'
    if (form.nickname.length > 15)       return '닉네임은 15자 이하여야 합니다.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      await handleSignUp({ loginId: form.loginId, password: form.password,
                           nickname: form.nickname, gender: form.gender })
      alert('회원가입이 완료되었습니다. 로그인해주세요.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>회원가입</h2>

      <div style={styles.field}>
        <label style={styles.label}>아이디</label>
        <input name="loginId" value={form.loginId} onChange={handleChange}
          placeholder="4~20자 영문, 숫자" autoComplete="username" style={styles.input} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>비밀번호</label>
        <input type="password" name="password" value={form.password} onChange={handleChange}
          placeholder="6자 이상" autoComplete="new-password" style={styles.input} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>비밀번호 확인</label>
        <input type="password" name="passwordCheck" value={form.passwordCheck} onChange={handleChange}
          placeholder="비밀번호를 한 번 더 입력" autoComplete="new-password"
          style={{ ...styles.input, borderColor: form.passwordCheck
            ? form.password === form.passwordCheck ? '#22c55e' : '#ef4444'
            : '#d1d5db' }} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>닉네임</label>
        <input name="nickname" value={form.nickname} onChange={handleChange}
          placeholder="지도에 표시될 이름 (15자 이하)" style={styles.input} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>성별</label>
        <div style={styles.genderGroup}>
          {[{ value:'MALE', label:'남성' }, { value:'FEMALE', label:'여성' }, { value:'OTHER', label:'기타' }]
            .map((opt) => (
              <label key={opt.value} style={{ ...styles.genderOpt,
                background:  form.gender === opt.value ? '#2563eb' : '#f9fafb',
                color:       form.gender === opt.value ? '#fff'    : '#374151',
                borderColor: form.gender === opt.value ? '#2563eb' : '#d1d5db' }}>
                <input type="radio" name="gender" value={opt.value}
                  checked={form.gender === opt.value} onChange={handleChange}
                  style={{ display:'none' }} />
                {opt.label}
              </label>
            ))}
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? '처리 중...' : '가입하기'}
      </button>

      <p style={styles.link}>
        이미 계정이 있으신가요?{' '}
        <span onClick={() => navigate('/login')} style={styles.linkText}>로그인</span>
      </p>
    </form>
  )
}

const styles = {
  form:       { display:'flex', flexDirection:'column', gap:16, width:'100%', maxWidth:400,
                margin:'0 auto', padding:'40px 32px', background:'#fff',
                borderRadius:12, border:'1px solid #e5e7eb' },
  title:      { fontSize:22, fontWeight:600, textAlign:'center', marginBottom:8, color:'#111' },
  field:      { display:'flex', flexDirection:'column', gap:6 },
  label:      { fontSize:13, fontWeight:500, color:'#374151' },
  input:      { padding:'10px 12px', fontSize:14, border:'1px solid #d1d5db', borderRadius:8, outline:'none' },
  genderGroup:{ display:'flex', gap:8 },
  genderOpt:  { flex:1, padding:'9px 0', textAlign:'center', fontSize:13, fontWeight:500,
                border:'1px solid', borderRadius:8, cursor:'pointer' },
  error:      { fontSize:13, color:'#ef4444', margin:0 },
  button:     { padding:'12px', fontSize:15, fontWeight:600, color:'#fff',
                background:'#2563eb', border:'none', borderRadius:8, cursor:'pointer' },
  link:       { fontSize:13, textAlign:'center', color:'#6b7280', margin:0 },
  linkText:   { color:'#2563eb', cursor:'pointer', fontWeight:500 },
}

export default SignUpForm
