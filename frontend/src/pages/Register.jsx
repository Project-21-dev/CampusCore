import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    childRollNo: '',
    relation: 'Guardian'
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '', api: '' }))
  }

  const validate = () => {
    const next = {}
    if (!/^[A-Za-z][A-Za-z0-9_.]*$/.test(formData.username.trim())) {
      next.username = 'Username must start with a letter and use only letters, numbers, _ or .'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = 'Enter a valid email address'
    }
    if (formData.phone && !/^(\+91)?[6-9][0-9]{9}$/.test(formData.phone.trim())) {
      next.phone = 'Enter a valid Indian phone number'
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/.test(formData.password)) {
      next.password = 'Use 8+ characters with uppercase, lowercase, number and special character'
    }
    if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = 'Passwords do not match'
    }
    if (!formData.childRollNo.trim()) {
      next.childRollNo = "Your child's roll number is required"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setSuccess('')
    const result = await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      password: formData.password,
      role: 'Parent',
      childRollNo: formData.childRollNo.trim(),
      relation: formData.relation
    })

    if (result.success) {
      setSuccess('Parent account created successfully. Please log in with your email and password.')
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } else {
      setErrors({ api: result.message || 'Registration failed' })
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-bg app-register-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg auth-card">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="register-icon-wrapper mb-3"><i className="bi bi-people-fill"></i></div>
                  <h2 className="register-title">Create Parent Account</h2>
                  <p className="register-subtitle">Link your account to an already admitted student using the student's roll number.</p>
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-shield-check me-2"></i>
                  Student accounts are created after admission approval. Teacher accounts are created by Admin. Public signup is for Parents only.
                </div>

                {success && <div className="alert alert-success">{success}</div>}
                {errors.api && <div className="alert alert-danger">{errors.api}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Username *</label>
                      <input name="username" className={`form-control ${errors.username ? 'is-invalid' : ''}`} value={formData.username} onChange={handleChange} required />
                      {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={formData.email} onChange={handleChange} required />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input name="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Relationship *</label>
                      <select name="relation" className="form-select" value={formData.relation} onChange={handleChange}>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Child's Roll Number *</label>
                    <input name="childRollNo" className={`form-control ${errors.childRollNo ? 'is-invalid' : ''}`} value={formData.childRollNo} onChange={handleChange} required />
                    {errors.childRollNo && <div className="invalid-feedback">{errors.childRollNo}</div>}
                    <small className="text-muted">The student must already exist in CampusCore after admission approval.</small>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <input type="password" name="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} value={formData.password} onChange={handleChange} required />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password *</label>
                      <input type="password" name="confirmPassword" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} value={formData.confirmPassword} onChange={handleChange} required />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>

                  <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Parent Account'}
                  </button>
                </form>

                <div className="text-center mt-4">
                  Already have an account? <Link to="/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
