import SignUpForm from '../components/auth/SignUpForm'

// 변경: style → className (layout.css의 .auth-page)
function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUpForm />
    </div>
  )
}
export default SignUpPage
