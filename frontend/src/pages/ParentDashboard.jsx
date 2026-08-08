import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ParentDashboard = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [linkForm, setLinkForm] = useState({ childRollNo: '', relation: 'Guardian' })
  const [linking, setLinking] = useState(false)
  const [aiByStudentId, setAiByStudentId] = useState({})

  useEffect(() => {
    if (user?.userId) {
      fetchChildren()
    }
  }, [user])

  const fetchChildren = async () => {
    try {
      const childrenRes = await api.get(`/parent/${user.userId}/children`)
      const childData = Array.isArray(childrenRes.data) ? childrenRes.data : []
      setChildren(childData)

      const riskResults = await Promise.allSettled(
        childData.map((child) => api.get(`/analytics/student/${child.studentId}/risk`))
      )
      const predictions = {}
      riskResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data) {
          predictions[childData[index].studentId] = result.value.data
        }
      })
      setAiByStudentId(predictions)
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async (e) => {
    e.preventDefault()
    setLinking(true)
    try {
      await api.post(`/parent/${user.userId}/link`, linkForm)
      setMessage({ type: 'success', text: 'Child linked successfully!' })
      setLinkForm({ childRollNo: '', relation: 'Guardian' })
      fetchChildren()
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Failed to link child' })
    } finally {
      setLinking(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const handleUnlink = async (linkId) => {
    if (!window.confirm('Remove this child from your account?')) return
    try {
      await api.delete(`/parent/${user.userId}/link/${linkId}`)
      fetchChildren()
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to unlink child' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
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
    <div className="container py-5">
      <h1 className="mb-4">
        <i className="bi bi-people-fill text-primary me-2"></i>
        Parent Dashboard
      </h1>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0"><i className="bi bi-link-45deg me-2"></i>Link Another Child</h5>
        </div>
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={handleLink}>
            <div className="col-md-5">
              <label className="form-label">Child's Roll Number</label>
              <input
                type="text"
                className="form-control"
                value={linkForm.childRollNo}
                onChange={(e) => setLinkForm({ ...linkForm, childRollNo: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Relation</label>
              <select
                className="form-select"
                value={linkForm.relation}
                onChange={(e) => setLinkForm({ ...linkForm, relation: e.target.value })}
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" type="submit" disabled={linking}>
                {linking ? 'Linking...' : 'Link Child'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="alert alert-info">
          No children linked yet. Use the form above with your child's roll number to get started.
        </div>
      ) : (
        <div className="row g-4" id="children">
          {children.map((child) => (
            <div className="col-md-6" key={child.linkId}>
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-person-fill me-2"></i>
                    {child.studentName} <small className="text-muted">({child.relation})</small>
                  </h5>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleUnlink(child.linkId)}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                <div className="card-body">
                  <p className="mb-2"><strong>Roll No:</strong> {child.rollNo}</p>
                  <p className="mb-3"><strong>Class:</strong> {child.className}</p>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className={`fw-bold fs-4 ${child.attendancePercentage < 75 ? 'text-danger' : 'text-success'}`}>
                        {child.attendancePercentage}%
                      </div>
                      <div className="text-muted small">Attendance</div>
                    </div>
                    <div className="col-4">
                      <div className={`fw-bold fs-4 ${child.pendingFeeAmount > 0 ? 'text-warning' : 'text-success'}`}>
                        ₹{child.pendingFeeAmount}
                      </div>
                      <div className="text-muted small">Fee Due</div>
                    </div>
                    <div className="col-4">
                      <div className={`fw-bold fs-4 ${child.averageResultPercentage < 40 ? 'text-danger' : 'text-primary'}`}>
                        {child.averageResultPercentage}%
                      </div>
                      <div className="text-muted small">Avg Result</div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 border-top mt-3 pt-3">
                    <Link to="/fees" className="btn btn-sm btn-warning"><i className="bi bi-wallet2 me-1"></i>Fees</Link>
                    <Link to="/parent/attendance" className="btn btn-sm btn-outline-info"><i className="bi bi-calendar-check me-1"></i>Attendance</Link>
                    <Link to="/parent/results" className="btn btn-sm btn-outline-success"><i className="bi bi-bar-chart me-1"></i>Results</Link>
                    <Link to="/parent/analysis" className="btn btn-sm btn-outline-primary"><i className="bi bi-stars me-1"></i>Analysis</Link>
                  </div>
                  {aiByStudentId[child.studentId] && (() => {
                    const prediction = aiByStudentId[child.studentId]
                    const unavailable = prediction.dataStatus && prediction.dataStatus !== 'AVAILABLE'
                    return (
                      <div className="border-top mt-3 pt-3" id="analysis">
                        <h6 className="mb-2"><i className="bi bi-stars me-2"></i>Academic Support Status</h6>
                        <p className="mb-2">
                          <strong>Status:</strong>{' '}
                          <span className={`badge ${prediction.riskLevel === 'High Risk' ? 'bg-danger' : prediction.riskLevel === 'Medium Risk' ? 'bg-warning text-dark' : prediction.riskLevel === 'Low Risk' ? 'bg-success' : 'bg-secondary'}`}>
                            {prediction.riskLevel}
                          </span>
                        </p>
                        {!unavailable && (
                          <>
                            <div className="small mb-2"><strong>Why:</strong> {(prediction.reasons || []).join(' ')}</div>
                            <div className="small"><strong>Recommended support:</strong> {(prediction.recommendations || []).join(' ')}</div>
                          </>
                        )}
                        {unavailable && <div className="small text-muted">{(prediction.reasons || []).join(' ')}</div>}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ParentDashboard
