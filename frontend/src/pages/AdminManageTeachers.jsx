import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const AdminManageTeachers = () => {
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    subject: ''
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/user/teachers')
      setTeachers(response.data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setMessage({ type: 'danger', text: 'Failed to load teachers' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTeacher) {
        await api.put(`/user/teachers/${editingTeacher.teacherId}`, formData)
        setMessage({ type: 'success', text: 'Teacher updated successfully!' })
      } else {
        await api.post('/user/teachers', formData)
        setMessage({ type: 'success', text: 'Teacher created successfully!' })
      }
      setShowModal(false)
      resetForm()
      fetchTeachers()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Operation failed'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleEdit = async (teacherId) => {
    try {
      const response = await api.get(`/user/teachers/${teacherId}`)
      const teacher = response.data
      setFormData({
        username: teacher.username,
        password: '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        subject: teacher.subject
      })
      setEditingTeacher(teacher)
      setShowModal(true)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to load teacher data' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleDeleteClick = (teacherId) => {
    setTeacherToDelete(teacherId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!teacherToDelete) return

    try {
      await api.delete(`/user/teachers/${teacherToDelete}`)
      setMessage({ type: 'success', text: 'Teacher deleted successfully!' })
      setShowDeleteModal(false)
      setTeacherToDelete(null)
      fetchTeachers()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to delete teacher' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      phone: '',
      subject: ''
    })
    setEditingTeacher(null)
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in-up">
      <div className="mb-4">
        <button className="btn btn-link text-decoration-none text-muted p-0 hover-glow" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold text-dark">
          <i className="bi bi-person-badge-fill text-success me-3"></i>
          Teacher Management
        </h1>
        <button className="btn btn-success text-white shadow-sm hover-glow px-4 rounded-pill" onClick={openModal}>
          <i className="bi bi-person-plus-fill me-2"></i>Add Teacher
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} glass-panel border-0 mb-4 fade show`} role="alert">
          <div className="d-flex align-items-center">
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-3 fs-4`}></i>
            <div>{message.text}</div>
            <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        </div>
      )}

      <div className="glass-panel p-4">
        <div className="table-responsive">
          <table className="table modern-table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher.teacherId}>
                    <td className="fw-medium">{teacher.username}</td>
                    <td><span className="badge bg-light text-success border border-success-subtle px-3">{teacher.subject}</span></td>
                    <td>{teacher.email || <span className="text-muted small">N/A</span>}</td>
                    <td>{teacher.phone || <span className="text-muted small">N/A</span>}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-warning border-0 me-2"
                        onClick={() => handleEdit(teacher.teacherId)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square fs-5"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger border-0"
                        onClick={() => handleDeleteClick(teacher.teacherId)}
                        title="Delete"
                      >
                        <i className="bi bi-trash3-fill fs-5"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <i className="bi bi-person-workspace fs-1 d-block mb-3 opacity-25"></i>
                    No teachers registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-modal border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-badge-fill text-success me-2"></i>
                  {editingTeacher ? 'Edit Teacher Details' : 'Register New Teacher'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">Username *</label>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">
                        Password {editingTeacher ? '(Optional)' : '*'}
                      </label>
                      <input
                        type="password"
                        className="form-control border-0 bg-light"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingTeacher}
                        placeholder={editingTeacher ? 'Keep current if blank' : 'Set password'}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control border-0 bg-light"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">Phone</label>
                      <input
                        type="tel"
                        className="form-control border-0 bg-light"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted text-uppercase fw-bold">Subject Specialization *</label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enter subject"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4 rounded-pill shadow-sm">
                    {editingTeacher ? 'Update Profile' : 'Register Teacher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content glass-modal border-0 shadow-lg text-center p-4">
              <div className="modal-body">
                <i className="bi bi-person-x-fill text-danger display-4 mb-3 d-block"></i>
                <h4 className="fw-bold mb-2">Remove Teacher?</h4>
                <p className="text-muted mb-4">Are you sure you want to delete this teacher profile? This cannot be undone.</p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light flex-grow-1 rounded-pill"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger flex-grow-1 rounded-pill shadow-sm"
                    onClick={confirmDelete}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminManageTeachers

