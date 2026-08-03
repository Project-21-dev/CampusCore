import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const AdminManageAttendance = () => {
  const { user } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [attendanceRes, studentsRes] = await Promise.all([
        api.get('/attendance/all'),
        api.get('/user/students')
      ])
      setAttendanceRecords(attendanceRes.data)
      setStudents(studentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'danger', text: 'Failed to load data' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRecord) {
        await api.put(`/attendance/${editingRecord.attendanceId}`, formData)
        setMessage({ type: 'success', text: 'Attendance updated successfully!' })
      } else {
        await api.post('/attendance/mark', formData)
        setMessage({ type: 'success', text: 'Attendance created successfully!' })
      }
      setShowModal(false)
      resetForm()
      fetchData()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Operation failed'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleEdit = (record) => {
    setFormData({
      studentId: record.studentId,
      date: record.date,
      status: record.status
    })
    setEditingRecord(record)
    setShowModal(true)
  }

  const handleDeleteClick = (attendanceId) => {
    setRecordToDelete(attendanceId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!recordToDelete) return

    try {
      await api.delete(`/attendance/${recordToDelete}`)
      setMessage({ type: 'success', text: 'Attendance deleted successfully!' })
      setShowDeleteModal(false)
      setRecordToDelete(null)
      fetchData()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to delete attendance' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present'
    })
    setEditingRecord(null)
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
        <div className="spinner-border text-info" role="status"></div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold text-dark">
          <i className="bi bi-calendar-check text-info me-3"></i>
          Attendance Management
        </h1>
        <button className="btn btn-info text-white shadow-sm hover-glow" onClick={openModal}>
          <i className="bi bi-plus-lg me-2"></i>Add Record
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
                <th>Date</th>
                <th>Student Name</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => (
                  <tr key={record.attendanceId}>
                    <td className="fw-medium">{record.date}</td>
                    <td>{record.studentName}</td>
                    <td><span className="badge bg-light text-dark">{record.rollNo}</span></td>
                    <td>{record.className}</td>
                    <td>
                      <span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-warning border-0 me-2"
                        onClick={() => handleEdit(record)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square fs-5"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger border-0"
                        onClick={() => handleDeleteClick(record.attendanceId)}
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
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                    No attendance records found
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
                  {editingRecord ? 'Edit Attendance' : 'New Attendance Record'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small text-muted text-uppercase fw-bold">Select Student</label>
                    <select
                      className="form-select border-0 bg-light"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      required
                    >
                      <option value="">Choose a student...</option>
                      {students.map((student) => (
                        <option key={student.studentId} value={student.studentId}>
                          {student.username} (Roll: {student.rollNo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-7 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">Date</label>
                      <input
                        type="date"
                        className="form-control border-0 bg-light"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-5 mb-3">
                      <label className="form-label small text-muted text-uppercase fw-bold">Status</label>
                      <select
                        className="form-select border-0 bg-light"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-info text-white px-4 rounded-pill shadow-sm">
                    {editingRecord ? 'Update Record' : 'Save Record'}
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
                <i className="bi bi-exclamation-octagon text-danger display-4 mb-3 d-block"></i>
                <h4 className="fw-bold mb-2">Are you sure?</h4>
                <p className="text-muted mb-4">This action cannot be undone. This record will be permanently deleted.</p>
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

export default AdminManageAttendance

