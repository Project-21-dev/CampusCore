import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiStudents, setAiStudents] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsResult, attendanceResult, aiResult] = await Promise.allSettled([
        api.get('/user/students'),
        api.get('/attendance/all'),
        api.get('/analytics/at-risk-students')
      ])

      if (studentsResult.status === 'fulfilled') setStudents(studentsResult.value.data)
      if (attendanceResult.status === 'fulfilled') {
        const rows = Array.isArray(attendanceResult.value.data) ? attendanceResult.value.data : []
        const sorted = [...rows].sort((a, b) => {
          const dateCompare = String(b.date || '').localeCompare(String(a.date || ''))
          return dateCompare !== 0 ? dateCompare : Number(b.attendanceId || 0) - Number(a.attendanceId || 0)
        })
        setRecentAttendance(sorted.slice(0, 10))
      }
      if (aiResult.status === 'fulfilled') {
        setAiStudents(
          aiResult.value.data.filter((student) =>
            student.riskLevel === 'High Risk' || student.riskLevel === 'Medium Risk'
          )
        )
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-speedometer2 text-success me-2"></i>
          Teacher Dashboard
        </h1>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success">Welcome, {user?.username}!</span>
          <Link to="/teacher/profile" className="btn btn-primary">
            <i className="bi bi-person-circle me-2"></i>View Profile
          </Link>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check" style={{ fontSize: '48px' }}></i>
              <h5 className="mt-3">Mark Attendance</h5>
              <Link to="/attendance" className="btn btn-light btn-sm mt-2">
                <i className="bi bi-arrow-right me-1"></i>Go to Attendance
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-people-fill" style={{ fontSize: '48px' }}></i>
              <h5 className="mt-3">Total Students</h5>
              <h2 className="mt-2">{students.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-graph-up" style={{ fontSize: '48px' }}></i>
              <h5 className="mt-3">Upload Results</h5>
              <Link to="/results" className="btn btn-light btn-sm mt-2">
                <i className="bi bi-arrow-right me-1"></i>Go to Results
              </Link>
            </div>
          </div>
        </div>
      </div>


      {/* AI Student Support */}
      <div className="card shadow-sm mb-4" id="analysis">
        <div className="card-header bg-danger text-white">
          <h5 className="mb-0"><i className="bi bi-cpu-fill me-2"></i>Students Requiring Attention</h5>
        </div>
        <div className="card-body">
          {aiStudents.length === 0 ? (
            <p className="text-muted text-center py-3 mb-0">No students are currently flagged as medium or high risk.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead><tr><th>Student</th><th>Class</th><th>AI Risk</th><th>Confidence</th><th>Reasons</th><th>Recommended Action</th></tr></thead>
                <tbody>
                  {aiStudents.slice(0, 10).map((student) => (
                    <tr key={student.studentId}>
                      <td>{student.studentName}<div className="small text-muted">{student.rollNo}</div></td>
                      <td>{student.className}</td>
                      <td><span className={`badge ${student.riskLevel === 'High Risk' ? 'bg-danger' : 'bg-warning text-dark'}`}>{student.riskLevel}</span></td>
                      <td>{student.dataStatus === 'AVAILABLE' ? `${Math.round((student.confidence || 0) * 100)}%` : '-'}</td>
                      <td><small>{(student.reasons || []).slice(0, 2).join(' ')}</small></td>
                      <td><small>{(student.recommendations || [])[0] || '-'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-people-fill me-2"></i>Students
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.studentId}>
                    <td>{student.rollNo}</td>
                    <td>{student.fullName || student.username}</td>
                    <td>{student.className}</td>
                    <td>{student.email || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>Recent Attendance
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No attendance records yet.</td></tr>
                ) : recentAttendance.map((attendance) => (
                  <tr key={attendance.attendanceId}>
                    <td>{attendance.studentName}</td>
                    <td>{attendance.rollNo}</td>
                    <td>{attendance.className}</td>
                    <td>{attendance.date}</td>
                    <td>
                      <span className={`badge ${attendance.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                        {attendance.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard

