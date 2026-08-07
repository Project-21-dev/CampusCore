import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../services/api'

const FaceAttendanceTeacher = () => {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [session, setSession] = useState(null)
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await api.get('/user/classes')
        setClasses(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error(error)
      }
    }
    loadClasses()
  }, [])

  useEffect(() => {
    if (!selectedClass) {
      setStudents([])
      setSession(null)
      return
    }
    refreshClassData()
  }, [selectedClass])

  useEffect(() => {
    if (!selectedClass) return undefined
    const timer = setInterval(refreshClassData, 5000)
    return () => clearInterval(timer)
  }, [selectedClass])

  const refreshClassData = async () => {
    try {
      const [studentRes, attendanceRes, sessionRes] = await Promise.all([
        api.get(`/user/students/class/${encodeURIComponent(selectedClass)}`),
        api.get('/attendance/all'),
        api.get(`/attendance/face/session/class/${encodeURIComponent(selectedClass)}`)
      ])
      setStudents(Array.isArray(studentRes.data) ? studentRes.data : [])
      setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : [])
      setSession(sessionRes.status === 204 ? null : sessionRes.data)
    } catch (error) {
      console.error('Failed to refresh face attendance:', error)
    }
  }

  const startSession = async () => {
    if (!selectedClass) {
      Swal.fire('Select a class', 'Choose a class before starting attendance.', 'warning')
      return
    }
    setLoading(true)
    try {
      const response = await api.post(
        `/attendance/face/session?className=${encodeURIComponent(selectedClass)}&durationMinutes=${durationMinutes}`
      )
      setSession(response.data)
      await refreshClassData()
      Swal.fire('Session started', 'Students can now verify their face and check in.', 'success')
    } catch (error) {
      Swal.fire('Could not start session', error.response?.data?.message || error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const closeSession = async () => {
    if (!session?.sessionId) return
    const result = await Swal.fire({
      title: 'Close attendance session?',
      text: 'Students who have not checked in will be marked Absent.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Close and finalize'
    })
    if (!result.isConfirmed) return

    try {
      await api.post(`/attendance/face/session/${session.sessionId}/close`)
      setSession(null)
      await refreshClassData()
      Swal.fire('Finalized', 'Remaining students were marked Absent.', 'success')
    } catch (error) {
      Swal.fire('Could not close session', error.response?.data?.message || error.message, 'error')
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const attendanceMap = useMemo(() => {
    const map = {}
    attendance
      .filter(item => item.date === today && item.className === selectedClass)
      .forEach(item => { map[item.studentId] = item.status })
    return map
  }, [attendance, selectedClass, today])

  const presentCount = students.filter(student => attendanceMap[student.studentId] === 'Present').length

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/teacher/dashboard" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back
          </Link>
        </div>
        <h1 className="mb-0">
          <i className="bi bi-person-bounding-box text-primary me-2"></i>
          Face Attendance
        </h1>
        <span className="badge bg-primary">Teacher</span>
      </div>

      <div className="alert alert-info">
        The teacher only starts the session. Students verify their own enrolled face on their logged-in account.
        Present attendance is recorded automatically; when the session is finalized, students who did not check in are marked Absent.
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={event => setSelectedClass(event.target.value)}
              >
                <option value="">Select class</option>
                {classes.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Session duration</label>
              <select
                className="form-select"
                value={durationMinutes}
                onChange={event => setDurationMinutes(Number(event.target.value))}
                disabled={Boolean(session)}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
            <div className="col-md-3 d-grid">
              {session ? (
                <button type="button" className="btn btn-danger" onClick={closeSession}>
                  <i className="bi bi-stop-circle me-2"></i>Close & Finalize
                </button>
              ) : (
                <button type="button" className="btn btn-success" onClick={startSession} disabled={loading || !selectedClass}>
                  <i className="bi bi-play-circle me-2"></i>Start Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {session && (
        <div className="alert alert-success">
          <strong>Session active for {session.className}.</strong>{' '}
          Expires at {new Date(session.expiresAt).toLocaleTimeString()}.
          <div className="small mt-1">The session token is kept inside the application and is not intended to be shared.</div>
        </div>
      )}

      {selectedClass && (
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white d-flex justify-content-between">
            <span>Live attendance — {selectedClass}</span>
            <span>{presentCount}/{students.length} present</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student</th>
                  <th>Status today</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const status = attendanceMap[student.studentId]
                  return (
                    <tr key={student.studentId}>
                      <td>{student.rollNo}</td>
                      <td>{student.username}</td>
                      <td>
                        {status ? (
                          <span className={`badge ${status === 'Present' ? 'bg-success' : 'bg-danger'}`}>{status}</span>
                        ) : (
                          <span className="badge bg-secondary">Waiting for face check-in</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {students.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-4 text-muted">No students in this class.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default FaceAttendanceTeacher
