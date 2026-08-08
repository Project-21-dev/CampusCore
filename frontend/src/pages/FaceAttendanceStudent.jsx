import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import WebcamCapture from '../components/WebcamCapture'

const FaceAttendanceStudent = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [enrollment, setEnrollment] = useState({ enrolled: false, enrolledSamples: 0 })
  const [activeSession, setActiveSession] = useState(null)
  const [samples, setSamples] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user?.studentId) refresh()
  }, [user])

  useEffect(() => {
    if (!user?.studentId) return undefined
    const timer = setInterval(() => loadSession(), 5000)
    return () => clearInterval(timer)
  }, [user])

  const loadAttendance = async () => {
    const response = await api.get(`/attendance/student/${user.studentId}`)
    setAttendance(Array.isArray(response.data) ? response.data : [])
  }

  const loadEnrollment = async () => {
    try {
      const response = await api.get('/attendance/face/enrollment')
      setEnrollment(response.data || { enrolled: false, enrolledSamples: 0 })
    } catch (error) {
      console.error(error)
    }
  }

  const loadSession = async () => {
    try {
      const response = await api.get('/attendance/face/session/student')
      setActiveSession(response.status === 204 ? null : response.data)
    } catch (error) {
      setActiveSession(null)
    }
  }

  const refresh = async () => {
    await Promise.all([loadAttendance(), loadEnrollment(), loadSession()])
  }

  const captureEnrollmentSample = (file) => {
    setSamples(previous => {
      if (previous.length >= 5) return previous
      return [...previous, file]
    })
  }

  const submitEnrollment = async () => {
    if (samples.length < 3) {
      Swal.fire('More samples needed', 'Capture at least 3 clear face samples.', 'warning')
      return
    }

    const form = new FormData()
    samples.forEach(file => form.append('images', file))

    setBusy(true)
    try {
      const response = await api.post('/attendance/face/enroll', form)
      setSamples([])
      await loadEnrollment()
      Swal.fire('Face enrolled', response.data?.message || 'Enrollment completed.', 'success')
    } catch (error) {
      Swal.fire('Enrollment failed', error.response?.data?.message || error.response?.data?.detail || error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const verifyAndCheckIn = async (file) => {
    if (!activeSession?.token) {
      Swal.fire('No active session', 'Your teacher has not started attendance for your class.', 'info')
      return
    }

    const form = new FormData()
    form.append('image', file)

    setBusy(true)
    try {
      const response = await api.post(
        `/attendance/face/check-in?sessionToken=${encodeURIComponent(activeSession.token)}`,
        form
      )
      await loadAttendance()
      Swal.fire('Attendance marked', `${response.data.message} Match score: ${Math.round((response.data.score || 0) * 100)}%`, 'success')
    } catch (error) {
      Swal.fire('Check-in failed', error.response?.data?.message || error.response?.data?.detail || error.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const presentDays = attendance.filter(item => item.status === 'Present').length
  const absentDays = attendance.filter(item => item.status === 'Absent').length
  const totalDays = attendance.length
  const percentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0'

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/student/dashboard" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Back
        </Link>
        <h1 className="mb-0"><i className="bi bi-person-bounding-box text-info me-2"></i>Face Attendance</h1>
        <span className="badge bg-info">{user?.displayName || user?.username}</span>
      </div>

      <div className="alert alert-warning">
        Face enrollment is biometric data. Use it only with consent. CampusCore stores cropped enrollment samples locally in the AI service and the folder is excluded from Git.
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">1. Face enrollment</div>
            <div className="card-body">
              <p>
                Status:{' '}
                <span className={`badge ${enrollment.enrolled ? 'bg-success' : 'bg-secondary'}`}>
                  {enrollment.enrolled ? `Enrolled (${enrollment.enrolledSamples} samples)` : 'Not enrolled'}
                </span>
              </p>
              <p className="text-muted small">Look straight at the camera and capture at least 3 samples with small changes in head angle.</p>
              <WebcamCapture
                onCapture={captureEnrollmentSample}
                buttonText={`Capture sample (${samples.length}/3 minimum)`}
                disabled={busy || samples.length >= 5}
              />
              <div className="mt-3 d-flex gap-2">
                <button type="button" className="btn btn-success" onClick={submitEnrollment} disabled={busy || samples.length < 3}>
                  Register / Replace Face
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSamples([])} disabled={busy || samples.length === 0}>
                  Clear captures
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">2. Automatic check-in</div>
            <div className="card-body">
              {activeSession ? (
                <div className="alert alert-success">
                  Attendance session is active for <strong>{activeSession.className}</strong> until{' '}
                  {new Date(activeSession.expiresAt).toLocaleTimeString()}.
                </div>
              ) : (
                <div className="alert alert-secondary">No active attendance session for your class.</div>
              )}

              {enrollment.enrolled && activeSession ? (
                <>
                  <p className="text-muted small">Only your enrolled face is verified. The system does not search the whole student database from this camera image.</p>
                  <WebcamCapture
                    onCapture={verifyAndCheckIn}
                    buttonText="Verify Face & Mark Present"
                    disabled={busy}
                  />
                </>
              ) : (
                <p className="text-muted">Enroll your face first and wait for the teacher to start a session.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><div className="card bg-primary text-white"><div className="card-body text-center"><h6>Total Days</h6><h2>{totalDays}</h2></div></div></div>
        <div className="col-md-3"><div className="card bg-success text-white"><div className="card-body text-center"><h6>Present</h6><h2>{presentDays}</h2></div></div></div>
        <div className="col-md-3"><div className="card bg-danger text-white"><div className="card-body text-center"><h6>Absent</h6><h2>{absentDays}</h2></div></div></div>
        <div className="col-md-3"><div className="card bg-info text-white"><div className="card-body text-center"><h6>Attendance</h6><h2>{percentage}%</h2></div></div></div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">Attendance history</div>
        <div className="table-responsive">
          <table className="table table-striped mb-0">
            <thead><tr><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {attendance.map(record => (
                <tr key={record.attendanceId}>
                  <td>{record.date}</td>
                  <td><span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>{record.status}</span></td>
                </tr>
              ))}
              {attendance.length === 0 && <tr><td colSpan="2" className="text-center py-4 text-muted">No attendance records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FaceAttendanceStudent
