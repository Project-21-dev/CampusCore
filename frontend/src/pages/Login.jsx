import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import classroomImage from '../assets/campuscore-login-classroom.png'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    <main className="campus-login-page">
      <div className="container-fluid app-page-shell">
        <div className="campus-login-shell">
          <section
            className="campus-login-hero"
            style={{ backgroundImage: `url(${classroomImage})` }}
          >
            <div className="campus-login-overlay"></div>

            <div className="campus-login-hero-content">
              <Link className="campus-login-brand" to="/">
                <span className="campus-login-brand-mark">
                  <i className="bi bi-mortarboard-fill"></i>
                </span>
                <span>
                  <strong>CampusCore</strong>
                  <small>Smart campus platform</small>
                </span>
              </Link>

              <div className="campus-login-copy">
                <span className="campus-login-eyebrow">
                  <i className="bi bi-stars"></i>
                  Built for modern schools
                </span>

                <h1>
                  One platform for <span>smarter learning</span> and better student outcomes.
                </h1>

                <p>
                  Bring admissions, attendance, fees, results and intelligent student insights
                  together in one secure campus workspace.
                </p>
              </div>

              <div className="campus-login-role-grid">
                <div>
                  <i className="bi bi-person-badge"></i>
                  <strong>Students</strong>
                  <span>Academics & progress</span>
                </div>
                <div>
                  <i className="bi bi-people"></i>
                  <strong>Parents</strong>
                  <span>Child updates & fees</span>
                </div>
                <div>
                  <i className="bi bi-easel2"></i>
                  <strong>Teachers</strong>
                  <span>Classes & performance</span>
                </div>
                <div>
                  <i className="bi bi-shield-check"></i>
                  <strong>Admins</strong>
                  <span>Campus management</span>
                </div>
              </div>
            </div>
          </section>

          <section className="campus-login-form-side">
            <div className="campus-login-card">
              <div className="campus-login-heading">
                <span className="campus-login-signin-icon">
                  <i className="bi bi-box-arrow-in-right"></i>
                </span>
                <h2>Welcome back</h2>
                <p>Sign in with your registered email and password.</p>
              </div>

              {error && (
                <div className="alert alert-danger app-alert">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <div className="campus-login-input">
                    <i className="bi bi-envelope"></i>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@school.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="campus-login-input campus-login-password">
                    <i className="bi bi-lock"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="campus-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn campus-login-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <i className="bi bi-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>

              <div className="campus-login-divider"><span>New to CampusCore?</span></div>

              <Link to="/register" className="btn campus-parent-account-btn">
                <i className="bi bi-person-plus"></i>
                Create Parent Account
              </Link>

              <div className="campus-login-admission-link">
                <span>Applying as a new student?</span>
                <Link to="/admission">Start admission <i className="bi bi-arrow-up-right"></i></Link>
              </div>

              <div className="campus-login-security-note">
                <i className="bi bi-shield-lock"></i>
                <span>Secure role-based access for students, parents, teachers and administrators.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Login
