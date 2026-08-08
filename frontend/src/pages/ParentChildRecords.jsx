import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ParentChildRecords = ({ mode }) => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [studentId, setStudentId] = useState('')
  const [records, setRecords] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.userId) return
    api.get(`/parent/${user.userId}/children`)
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : []
        setChildren(rows)
        if (rows[0]) setStudentId(String(rows[0].studentId))
      })
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (!studentId) {
      setRecords([])
      setAnalysis(null)
      return
    }

    setLoading(true)
    const load = async () => {
      try {
        if (mode === 'attendance') {
          const res = await api.get(`/attendance/student/${studentId}`)
          setRecords(Array.isArray(res.data) ? res.data : [])
        } else if (mode === 'results') {
          const res = await api.get(`/result/student/${studentId}`)
          setRecords(Array.isArray(res.data) ? res.data : [])
        } else {
          const res = await api.get(`/analytics/student/${studentId}/risk`)
          setAnalysis(res.data || null)
        }
      } catch (error) {
        console.error('Unable to load child records:', error)
        setRecords([])
        setAnalysis(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId, mode])

  const selectedChild = children.find((child) => String(child.studentId) === String(studentId))
  const title = mode === 'attendance' ? 'Child Attendance' : mode === 'results' ? 'Child Results' : 'Child Analysis'

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1><i className={`bi ${mode === 'attendance' ? 'bi-calendar-check' : mode === 'results' ? 'bi-bar-chart' : 'bi-stars'} text-primary me-2`}></i>{title}</h1>
        <Link to="/parent/dashboard" className="btn btn-outline-secondary">Back to Dashboard</Link>
      </div>

      {children.length === 0 ? (
        <div className="alert alert-info">No child is linked to this Parent account yet.</div>
      ) : (
        <>
          <div className="card shadow-sm mb-4"><div className="card-body">
            <label className="form-label fw-bold">Select Child</label>
            <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {children.map((child) => <option key={child.studentId} value={child.studentId}>{child.studentName} — {child.rollNo} — Class {child.className}</option>)}
            </select>
          </div></div>

          {loading ? <div className="text-center py-5"><div className="spinner-border"></div></div> : (
            <>
              {mode === 'attendance' && (
                <div className="card shadow-sm"><div className="card-header bg-info text-white"><h5 className="mb-0">Attendance — {selectedChild?.studentName}</h5></div><div className="card-body p-0"><div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>{records.length ? records.map((row) => <tr key={row.attendanceId}><td>{row.date}</td><td><span className={`badge ${row.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>{row.status}</span></td></tr>) : <tr><td colSpan="2" className="text-center text-muted py-4">No attendance records found</td></tr>}</tbody></table></div></div></div>
              )}

              {mode === 'results' && (
                <div className="card shadow-sm"><div className="card-header bg-success text-white"><h5 className="mb-0">Results — {selectedChild?.studentName}</h5></div><div className="card-body p-0"><div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>Subject</th><th>Marks</th><th>Percentage</th><th>Exam</th><th>Date</th></tr></thead><tbody>{records.length ? records.map((row) => <tr key={row.resultId}><td>{row.subject || '-'}</td><td>{row.marks ?? '-'}</td><td>{row.percentage != null ? `${row.percentage}%` : '-'}</td><td>{row.examType || '-'}</td><td>{row.date || '-'}</td></tr>) : <tr><td colSpan="5" className="text-center text-muted py-4">No result records found</td></tr>}</tbody></table></div></div></div>
              )}

              {mode === 'analysis' && (
                <div className="card shadow-sm"><div className="card-header bg-primary text-white"><h5 className="mb-0">Academic Support Analysis — {selectedChild?.studentName}</h5></div><div className="card-body">
                  {!analysis ? <p className="text-muted mb-0">No analysis is available yet.</p> : <>
                    <h5>Performance Status: <span className={`badge ${analysis.riskLevel === 'High Risk' ? 'bg-danger' : analysis.riskLevel === 'Medium Risk' ? 'bg-warning text-dark' : analysis.riskLevel === 'Low Risk' ? 'bg-success' : 'bg-secondary'}`}>{analysis.riskLevel}</span></h5>
                    {analysis.dataStatus === 'AVAILABLE' && <p><strong>Confidence:</strong> {Math.round(Number(analysis.confidence || 0) * 100)}%</p>}
                    <div className="row g-4"><div className="col-md-6"><h6>Why</h6><ul>{(analysis.reasons || []).map((item, i) => <li key={i}>{item}</li>)}</ul></div><div className="col-md-6"><h6>Recommended Support</h6><ul>{(analysis.recommendations || []).map((item, i) => <li key={i}>{item}</li>)}</ul></div></div>
                  </>}
                </div></div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ParentChildRecords
