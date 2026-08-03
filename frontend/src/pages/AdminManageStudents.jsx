import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const AdminManageStudents = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    rollNo: '',
    className: ''
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const fetchStudents = async () => {
    try {
      const response = await api.get('/user/students')
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setMessage({ type: 'danger', text: 'Failed to load students' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStudent) {
        await api.put(`/user/students/${editingStudent.studentId}`, formData)
        setMessage({ type: 'success', text: 'Student updated successfully!' })
      } else {
        await api.post('/user/students', formData)
        setMessage({ type: 'success', text: 'Student created successfully!' })
      }
      setShowModal(false)
      resetForm()
      fetchStudents()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Operation failed'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleEdit = async (studentId) => {
    try {
      const response = await api.get(`/user/students/${studentId}`)
      const student = response.data
      setFormData({
        username: student.username,
        password: '',
        email: student.email || '',
        phone: student.phone || '',
        rollNo: student.rollNo,
        className: student.className
      })
      setEditingStudent(student)
      setShowModal(true)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to load student data' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleDeleteClick = (studentId) => {
    setStudentToDelete(studentId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return

    try {
      await api.delete(`/user/students/${studentToDelete}`)
      setMessage({ type: 'success', text: 'Student deleted successfully!' })
      setShowDeleteModal(false)
      setStudentToDelete(null)
      fetchStudents()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to delete student' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      phone: '',
      rollNo: '',
      className: ''
    })
    setEditingStudent(null)
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleBulkImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await api.post('/user/students/bulk-import', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImportResult(response.data)
      fetchStudents()
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Bulk import failed'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
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
          <i className="bi bi-people-fill text-primary me-3"></i>
          Student Management
        </h1>
        <div className="d-flex gap-2">
          <label className={`btn btn-outline-primary rounded-pill mb-0 ${importing ? 'disabled' : ''}`}>
            <i className="bi bi-file-earmark-arrow-up me-2"></i>
            {importing ? 'Importing...' : 'Bulk Import CSV'}
            <input type="file" accept=".csv" hidden onChange={handleBulkImport} disabled={importing} />
          </label>
          <button className="btn btn-primary text-white shadow-sm hover-glow px-4 rounded-pill" onClick={openModal}>
            <i className="bi bi-person-plus-fill me-2"></i>Add Student
          </button>
        </div>
      </div>

      {importResult && (
        <div className="alert alert-info glass-panel border-0 mb-4">
          Bulk import: <strong>{importResult.successCount}</strong> added, <strong>{importResult.failCount}</strong> failed.
          {importResult.errors && importResult.errors.length > 0 && (
            <ul className="mb-0 mt-2 small">
              {importResult.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>
      )}

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
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.studentId}>
                    <td><span className="badge bg-light text-dark fw-bold">{student.rollNo}</span></td>
                    <td className="fw-medium">{student.username}</td>
                    <td>{student.className}</td>
                    <td>{student.email || <span className="text-muted small">N/A</span>}</td>
                    <td>{student.phone || <span className="text-muted small">N/A</span>}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-warning border-0 me-2"
                        onClick={() => handleEdit(student.studentId)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square fs-5"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger border-0"
                        onClick={() => handleDeleteClick(student.studentId)}
                        title="Delete"
                      >
                        <i className="bi bi-trash3-fill fs-5"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-3 opacity-25"></i>
                    No students enrolled yet
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
                  <i className="bi bi-person-fill text-primary me-2"></i>
                  {editingStudent ? 'Edit Student Details' : 'Register New Student'}
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
                        Password {editingStudent ? '(Optional)' : '*'}
                      </label>
                      <input
                        type="password"
                        className="form-control border-0 bg-light"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingStudent}
                        placeholder={editingStudent ? 'Leave blank to keep' : 'Enter password'}
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
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">Roll Number *</label>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        value={formData.rollNo}
                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                        required
                        placeholder="Enter roll number"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">Class *</label>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        required
                        placeholder="Enter class name"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm">
                    {editingStudent ? 'Update Details' : 'Create Profile'}
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
                <h4 className="fw-bold mb-2">Delete Student?</h4>
                <p className="text-muted mb-4">Are you sure you want to remove this student? This action is irreversible.</p>
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

export default AdminManageStudents
