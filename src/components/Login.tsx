import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase.ts'

function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) throw error

      if (isSignUp) {
        setError('Check your email for the confirmation link!')
        setLoading(false)
      } else {
        navigate('/')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className={isSignUp && error.includes('email') ? 'success-message' : 'error-message'}>
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <div className="toggle-auth">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="link-button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login