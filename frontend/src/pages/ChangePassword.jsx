import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const ChangePassword = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setMessage({ type: '', text: '' })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'danger', text: 'New password and confirmation do not match.' })
      return
    }
    setSaving(true)
    try {
      const response = await api.put('/auth/change-password', form)
      setMessage({ type: 'success', text: response.data?.message || 'Password changed successfully.' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Could not change password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <button className="btn btn-link text-decoration-none ps-0 mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2"></i>Back
      </button>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <h2 className="mb-2"><i className="bi bi-shield-lock text-primary me-2"></i>Change Password</h2>
          <p className="text-muted">Students should replace the temporary admission password with a private permanent password after first login.</p>
          {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Current password</label>
              <input type="password" className="form-control" name="currentPassword" value={form.currentPassword} onChange={update} required />
            </div>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input type="password" className="form-control" name="newPassword" value={form.newPassword} onChange={update} minLength="8" required />
              <div className="form-text">Use at least 8 characters with uppercase, lowercase, a number and a special character.</div>
            </div>
            <div className="mb-4">
              <label className="form-label">Confirm new password</label>
              <input type="password" className="form-control" name="confirmPassword" value={form.confirmPassword} onChange={update} minLength="8" required />
            </div>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
