import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(formData.email, formData.password)
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user || !user.role) {
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }
      if (user.role === 'Admin') navigate('/admin/dashboard')
      else if (user.role === 'Teacher') navigate('/teacher/dashboard')
      else if (user.role === 'Student') navigate('/student/dashboard')
      else if (user.role === 'Parent') navigate('/parent/dashboard')
      else navigate('/')
    } else {
      setError(result.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <main className="app-auth-page">
      <div className="container-fluid app-page-shell">
        <div className="app-auth-layout">
          <section className="app-auth-story">
            <Link className="app-auth-brand" to="/"><span className="app-brand-mark"><i className="bi bi-mortarboard-fill"></i></span><strong>CampusCore</strong></Link>
            <div>
              <span className="app-eyebrow light"><i className="bi bi-shield-check"></i> Secure role-based access</span>
              <h1>Welcome back to your school workspace.</h1>
              <p>Access the tools, records and updates designed specifically for your role.</p>
              <div className="app-auth-benefits">
                <span><i className="bi bi-check-circle-fill"></i>Centralised academic information</span>
                <span><i className="bi bi-check-circle-fill"></i>Protected admin, teacher and student access</span>
                <span><i className="bi bi-check-circle-fill"></i>Fast access from any device</span>
              </div>
            </div>
            <small>Connected learning. Clearer administration.</small>
          </section>

          <section className="app-auth-form-panel">
            <div className="app-auth-form-card">
              <div className="app-auth-form-heading">
                <span className="app-auth-icon"><i className="bi bi-box-arrow-in-right"></i></span>
                <h2>Sign in</h2>
                <p>Enter your registered email and password.</p>
              </div>

              {error && <div className="alert alert-danger app-alert"><i className="bi bi-exclamation-circle-fill"></i>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <div className="app-input-group"><i className="bi bi-envelope"></i><input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@school.com" required autoFocus /></div>
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="app-input-group"><i className="bi bi-lock"></i><input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required /></div>
                </div>
                <button type="submit" className="btn app-btn-primary app-auth-submit" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm"></span>Signing in...</> : <>Sign in<i className="bi bi-arrow-right"></i></>}
                </button>
              </form>

              <div className="app-auth-divider"><span>New to CampusCore?</span></div>
              <div className="d-grid gap-3">
                <Link to="/register" className="btn app-btn-outline">Create an account</Link>
                <Link to="/admission" className="app-auth-secondary-link"><i className="bi bi-file-earmark-person"></i>Apply for admission instead</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Login
