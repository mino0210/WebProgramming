import LoginForm from '../components/auth/LoginForm'

// 변경: style → className (layout.css의 .auth-page)
function LoginPage() {
  return (
    <div className="auth-page">
      <LoginForm />
    </div>
  )
}
export default LoginPage
