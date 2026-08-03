import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [results, setResults] = useState([])
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (user?.studentId) {
      fetchData()
      fetchNotifications()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [attendanceRes, resultsRes] = await Promise.all([
        api.get(`/attendance/student/${user.studentId}`),
        api.get(`/result/student/${user.studentId}`)
      ])

      // Ensure data is an array, default to empty array if not
      const attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : []
      const resultsData = Array.isArray(resultsRes.data) ? resultsRes.data : []

      setAttendance(attendanceData)
      setResults(resultsData)

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
      console.error('Error fetching data:', error)
      // Set empty arrays on error
      setAttendance([])
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/unread/${user.userId}`)
      setNotifications(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`)
      setNotifications(notifications.filter(n => n.notificationId !== id))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Get attendance status for a date
  const getAttendanceStatus = (day) => {
    if (!attendance || attendance.length === 0) return null

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const checkDate = new Date(year, month, day)

    // Format: YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const record = attendance.find(att => {
      if (!att.date) return false
      // Direct match
      if (att.date === dateStr) return true
      // Parse date if different format
      const attDate = new Date(att.date)
      return attDate.getFullYear() === year &&
        attDate.getMonth() === month &&
        attDate.getDate() === day
    })

    return record?.status || null
  }

  // Generate calendar data
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) days.push(null)
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) days.push(d)

    return days
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonthFn = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

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
          <i className="bi bi-speedometer2 text-info me-2"></i>
          Student Dashboard
        </h1>
        <div>
          <button
            className="btn btn-outline-primary me-2 position-relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="bi bi-bell"></i>
            {notifications.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notifications.length}
              </span>
            )}
          </button>
          <Link to={`/student/profile/${user?.studentId}`} className="btn btn-primary me-2">
            <i className="bi bi-person-badge me-2"></i>View Profile
          </Link>
          <span className="badge bg-info">Welcome, {user?.username}!</span>
        </div>
      </div>

      {/* Notifications Dropdown/Panel */}
      {showNotifications && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 small"><i className="bi bi-bell-fill me-2"></i>Recent Notifications</h5>
            <button className="btn btn-sm btn-close btn-close-white" onClick={() => setShowNotifications(false)}></button>
          </div>
          <div className="list-group list-group-flush">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.notificationId} className="list-group-item d-flex justify-content-between align-items-center bg-light">
                  <div>
                    <span className="badge bg-danger me-2">{n.type}</span>
                    <span className="small">{n.message}</span>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => markAsRead(n.notificationId)}
                    title="Mark as read"
                  >
                    <i className="bi bi-check2"></i>
                  </button>
                </div>
              ))
            ) : (
              <div className="list-group-item text-center text-muted py-3 small">No new notifications</div>
            )}
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Link to={`/student/profile/${user?.studentId}`} className="text-decoration-none">
            <div className="card bg-primary text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-person-badge" style={{ fontSize: '48px' }}></i>
                <h6 className="mt-3">My Profile</h6>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/fees" className="text-decoration-none">
            <div className="card bg-warning text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-cash-coin" style={{ fontSize: '48px' }}></i>
                <h6 className="mt-3">Fee Status</h6>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/student/attendance" className="text-decoration-none">
            <div className="card bg-info text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-calendar-check" style={{ fontSize: '48px' }}></i>
                <h6 className="mt-3">Attendance</h6>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/student/results" className="text-decoration-none">
            <div className="card bg-success text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-graph-up" style={{ fontSize: '48px' }}></i>
                <h6 className="mt-3">Results</h6>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              <h5 className="mt-3">Total Days</h5>
              <h2 className="mb-0">{stats.totalDays}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-check-circle" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              <h5 className="mt-3">Present Days</h5>
              <h2 className="mb-0">{stats.presentDays}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <i className="bi bi-x-circle" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              <h5 className="mt-3">Absent Days</h5>
              <h2 className="mb-0">{stats.absentDays}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-percent" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              <h5 className="mt-3">Attendance %</h5>
              <h2 className="mb-0">{stats.attendancePercentage}%</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Attendance Calendar */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-calendar3 me-2"></i>Attendance Calendar
          </h5>
          <div className="btn-group">
            <button className="btn btn-light btn-sm" onClick={prevMonth}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <button className="btn btn-light btn-sm" disabled>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </button>
            <button className="btn btn-light btn-sm" onClick={nextMonthFn}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Legend */}
          <div className="d-flex justify-content-center gap-4 mb-3">
            <span><span className="badge bg-success me-1">●</span> Present</span>
            <span><span className="badge bg-danger me-1">●</span> Absent</span>
            <span><span className="badge bg-warning me-1">●</span> Holiday</span>
            <span><span className="badge bg-secondary me-1">●</span> No Record</span>
          </div>

          {/* Calendar Grid */}
          <div className="table-responsive">
            <table className="table table-bordered text-center mb-0">
              <thead className="table-light">
                <tr>
                  <th>Sun</th>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                  <th>Thu</th>
                  <th>Fri</th>
                  <th>Sat</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const days = getCalendarDays()
                  const rows = []
                  for (let i = 0; i < days.length; i += 7) {
                    rows.push(days.slice(i, i + 7))
                  }
                  return rows.map((week, weekIdx) => (
                    <tr key={weekIdx}>
                      {week.map((day, dayIdx) => {
                        const status = day ? getAttendanceStatus(day) : null
                        const isSunday = dayIdx === 0 // Sunday is first column
                        const isToday = day &&
                          currentMonth.getMonth() === new Date().getMonth() &&
                          currentMonth.getFullYear() === new Date().getFullYear() &&
                          day === new Date().getDate()

                        return (
                          <td
                            key={dayIdx}
                            className={`
                              ${!day ? '' :
                                isSunday ? 'table-warning' :
                                  status === 'Present' ? 'table-success' :
                                    status === 'Absent' ? 'table-danger' : ''}
                              ${isToday ? 'border-primary border-3' : ''}
                            `}
                            style={{
                              height: '50px',
                              verticalAlign: 'middle',
                              fontWeight: isToday ? 'bold' : 'normal'
                            }}
                            title={day ? (isSunday ? 'Holiday (Sunday)' : status || 'No record') : ''}
                          >
                            {day && (
                              <div>
                                <span>{day}</span>
                                {isSunday ? (
                                  <div>
                                    <small className="text-warning">
                                      <i className="bi bi-sun-fill"></i>
                                    </small>
                                  </div>
                                ) : status && (
                                  <div>
                                    <small className={status === 'Present' ? 'text-success' : 'text-danger'}>
                                      <i className={`bi ${status === 'Present' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                                    </small>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      {/* Fill remaining cells if week is incomplete */}
                      {week.length < 7 && [...Array(7 - week.length)].map((_, idx) => (
                        <td key={`empty-${idx}`} style={{ height: '50px' }}></td>
                      ))}
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>Academic Results
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-hover">
                  <thead className="sticky-top bg-light">
                    <tr>
                      <th>Subject</th>
                      <th>Exam Type</th>
                      <th>Marks</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length > 0 ? (
                      results.map((result) => (
                        <tr key={result.resultId}>
                          <td>{result.subject}</td>
                          <td>
                            <span className="badge bg-secondary">{result.examType || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="badge bg-info">{result.marks}</span>
                          </td>
                          <td>{result.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No results available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
