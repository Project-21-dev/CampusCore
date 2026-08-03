import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TeacherProfile = () => {
  const { teacherId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    qualification: '',
    email: '',
    phone: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchProfile()
  }, [teacherId])

  const fetchProfile = async () => {
    try {
      const id = teacherId || user?.teacherId
      if (!id) return

      const response = await api.get(`/teachermanagement/profile/${id}`)
      setProfile(response.data)
      // Initialize form data with current profile
      setFormData({
        subject: response.data.teacher.subject || '',
        qualification: response.data.teacher.qualification || '',
        email: response.data.teacher.email || '',
        phone: response.data.teacher.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditMode(true)
  }

  const handleCancel = () => {
    setEditMode(false)
    // Reset form data to current profile
    setFormData({
      subject: profile.teacher.subject || '',
      qualification: profile.teacher.qualification || '',
      email: profile.teacher.email || '',
      phone: profile.teacher.phone || ''
    })
    setMessage({ type: '', text: '' })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const id = teacherId || user?.teacherId
      await api.put(`/user/teachers/${id}`, formData)

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditMode(false)
      fetchProfile()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to update profile. Please try again.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Teacher profile not found</div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-person-badge text-primary me-2"></i>
          Teacher Profile
        </h1>
        {!editMode && (
          <button className="btn btn-warning" onClick={handleEdit}>
            <i className="bi bi-pencil-fill me-2"></i>Edit Profile
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Teacher Information */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>Teacher Information
              </h5>
            </div>
            <div className="card-body">
              {!editMode ? (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td><strong>Name:</strong></td>
                      <td>{profile.teacher.username}</td>
                    </tr>
                    <tr>
                      <td><strong>Subject:</strong></td>
                      <td>{profile.teacher.subject || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Qualification:</strong></td>
                      <td>{profile.teacher.qualification || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{profile.teacher.email || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Phone:</strong></td>
                      <td>{profile.teacher.phone || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label"><strong>Name:</strong></label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.teacher.username}
                      disabled
                    />
                    <small className="text-muted">Name cannot be changed</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Subject:</strong></label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter subject"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Qualification:</strong></label>
                    <input
                      type="text"
                      className="form-control"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="Enter qualification"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Email:</strong></label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><strong>Phone:</strong></label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      <i className="bi bi-check-circle me-2"></i>Save Changes
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      <i className="bi bi-x-circle me-2"></i>Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>Status
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center py-4">
                <i className="bi bi-person-check" style={{ fontSize: '64px', color: '#28a745' }}></i>
                <h4 className="mt-3">{profile.stats.status}</h4>
                <p className="text-muted">Currently teaching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherProfile
