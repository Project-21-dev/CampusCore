import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const StudentAttendance = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.studentId) {
      fetchAttendance()
    }
  }, [user])

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/student/${user.studentId}`)
      const attendanceData = Array.isArray(response.data) ? response.data : []
      setAttendance(attendanceData)

      const presentDays = attendanceData.filter(a => a.status === 'Present').length
      const absentDays = attendanceData.filter(a => a.status === 'Absent').length
      const totalDays = attendanceData.length
      const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0

      setStats({
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage: percentage
      })
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setAttendance([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-info" role="status"></div>
        <p className="mt-3">Loading attendance...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/student/dashboard" className="btn btn-outline-secondary me-3">
            <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
          </Link>
        </div>
        <h1 className="mb-0">
          <i className="bi bi-calendar-check text-info me-2"></i>
          My Attendance
        </h1>
        <span className="badge bg-info fs-6">
          {user?.username}
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card bg-primary text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-calendar-week" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Total Days</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.totalDays}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-check-circle" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Present Days</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.presentDays}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-x-circle" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Absent Days</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.absentDays}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-percent" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Attendance %</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.attendancePercentage}%</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Progress Bar */}
      <div className="card shadow mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">
            <i className="bi bi-graph-up me-2"></i>Attendance Overview
          </h5>
        </div>
        <div className="card-body">
          <div className="progress" style={{ height: '30px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${stats.attendancePercentage}%` }}
            >
              <strong>{stats.attendancePercentage}% Present</strong>
            </div>
            <div 
              className="progress-bar bg-danger" 
              role="progressbar" 
              style={{ width: `${100 - stats.attendancePercentage}%` }}
            >
              {stats.absentDays > 0 && <strong>{(100 - stats.attendancePercentage).toFixed(1)}% Absent</strong>}
            </div>
          </div>
          <div className="mt-3 text-center">
            {stats.attendancePercentage >= 75 ? (
              <span className="badge bg-success fs-6">
                <i className="bi bi-emoji-smile me-2"></i>Good Attendance! Keep it up!
              </span>
            ) : (
              <span className="badge bg-warning text-dark fs-6">
                <i className="bi bi-exclamation-triangle me-2"></i>Attendance below 75%. Please improve!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>Attendance History
          </h5>
          <span className="badge bg-light text-primary">{attendance.length} Records</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: '60px' }}>#</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((record, index) => (
                    <tr key={record.attendanceId}>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <i className="bi bi-calendar3 me-2 text-muted"></i>
                        {record.date}
                      </td>
                      <td>
                        <i className="bi bi-calendar-day me-2 text-muted"></i>
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                          <i className={`bi ${record.status === 'Present' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <i className="bi bi-inbox text-muted" style={{ fontSize: '64px' }}></i>
                      <p className="text-muted mt-3 mb-0">No attendance records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentAttendance
