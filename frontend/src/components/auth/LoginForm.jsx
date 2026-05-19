import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * 로그인 폼 컴포넌트 — feature/frontend-auth 담당 (팀원 B)
 * LoginPage.jsx 안에서 사용
 *
 * [수정 이력] LoginPage 코드가 잘못 들어있던 것 정정
 */
function LoginForm() {
  const navigate        = useNavigate()
  const { handleLogin } = useAuth()

  const [form, setForm]       = useState({ loginId: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.loginId || !form.password) { setError('아이디와 비밀번호를 입력해주세요.'); return }
    setLoading(true)
    try {
      await handleLogin(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>로그인</h2>

      <div style={styles.field}>
        <label style={styles.label}>아이디</label>
        <input name="loginId" value={form.loginId} onChange={handleChange}
          placeholder="아이디 입력" autoComplete="username" style={styles.input} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>비밀번호</label>
        <input type="password" name="password" value={form.password} onChange={handleChange}
          placeholder="비밀번호 입력" autoComplete="current-password" style={styles.input} />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? '로그인 중...' : '로그인'}
      </button>

      <p style={styles.link}>
        계정이 없으신가요?{' '}
        <span onClick={() => navigate('/signup')} style={styles.linkText}>회원가입</span>
      </p>
    </form>
  )
}

const styles = {
  form:     { display:'flex', flexDirection:'column', gap:16, width:'100%', maxWidth:400,
              margin:'0 auto', padding:'40px 32px', background:'#fff',
              borderRadius:12, border:'1px solid #e5e7eb' },
  title:    { fontSize:22, fontWeight:600, textAlign:'center', marginBottom:8, color:'#111' },
  field:    { display:'flex', flexDirection:'column', gap:6 },
  label:    { fontSize:13, fontWeight:500, color:'#374151' },
  input:    { padding:'10px 12px', fontSize:14, border:'1px solid #d1d5db', borderRadius:8, outline:'none' },
  error:    { fontSize:13, color:'#ef4444', margin:0 },
  button:   { padding:'12px', fontSize:15, fontWeight:600, color:'#fff',
              background:'#2563eb', border:'none', borderRadius:8, cursor:'pointer' },
  link:     { fontSize:13, textAlign:'center', color:'#6b7280', margin:0 },
  linkText: { color:'#2563eb', cursor:'pointer', fontWeight:500 },
}

export default LoginForm
