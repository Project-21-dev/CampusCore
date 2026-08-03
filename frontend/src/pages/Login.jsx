import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      switch (user.role) {
        case 'Admin':
          navigate('/admin/dashboard')
          break
        case 'Teacher':
          navigate('/teacher/dashboard')
          break
        case 'Student':
          navigate('/student/dashboard')
          break
        default:
          navigate('/')
      }
    } else {
      setError(result.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page-bg">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg auth-card">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-box-arrow-in-right text-primary" style={{ fontSize: '64px' }}></i>
                  <h2 className="mt-3">Login</h2>
                  <p className="text-muted">Welcome back! Please login to your account.</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope me-2"></i>Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <i className="bi bi-lock me-2"></i>Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>Login
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-2">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none fw-bold">
                      <i className="bi bi-person-plus-fill me-1"></i>Create Account
                    </Link>
                  </p>
                  <hr />
                  <div className="d-grid gap-2">
                    <Link to="/register" className="btn btn-outline-primary">
                      <i className="bi bi-person-plus-fill me-2"></i>New User? Register Here
                    </Link>
                    <Link to="/admission" className="btn btn-outline-success">
                      <i className="bi bi-file-earmark-person me-2"></i>Apply for Admission
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

