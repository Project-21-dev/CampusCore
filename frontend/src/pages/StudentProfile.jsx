import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const StudentProfile = () => {
  const { studentId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [studentId])

  const fetchProfile = async () => {
    try {
      const id = studentId || user?.studentId
      if (!id) return

      const response = await api.get(`/studentmanagement/profile/${id}`)
      setProfile(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
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

  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Student profile not found</div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">
        <i className="bi bi-person-badge text-primary me-2"></i>
        Student Profile
      </h1>

      <div className="row g-4">
        {/* Student Information */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>Student Information
              </h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td><strong>Name:</strong></td>
                    <td>{profile.student.username}</td>
                  </tr>
                  <tr>
                    <td><strong>Roll Number:</strong></td>
                    <td>{profile.student.rollNo}</td>
                  </tr>
                  <tr>
                    <td><strong>Class:</strong></td>
                    <td>{profile.student.className}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{profile.student.email || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>Phone:</strong></td>
                    <td>{profile.student.phone || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enrollment Information */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-book me-2"></i>Enrollment Details
              </h5>
            </div>
            <div className="card-body">
              {profile.enrollment ? (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td><strong>Academic Year:</strong></td>
                      <td>{profile.enrollment.academicYear}</td>
                    </tr>
                    <tr>
                      <td><strong>Class:</strong></td>
                      <td>{profile.enrollment.className}</td>
                    </tr>
                    <tr>
                      <td><strong>Section:</strong></td>
                      <td>{profile.enrollment.section}</td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <span className={`badge ${profile.enrollment.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {profile.enrollment.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">No enrollment information available</p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-calendar-check" style={{ fontSize: '48px' }}></i>
              <h5 className="mt-3">Attendance</h5>
              <h2>{profile.attendance.percentage}%</h2>
              <p className="mb-0">{profile.attendance.presentDays} / {profile.attendance.totalDays} days</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-cash-coin" style={{ fontSize: '48px' }}></i>
              <h5 className="mt-3">Fee Status</h5>
              <h2>₹{profile.fees.pending}</h2>
              <p className="mb-0">Pending out of ₹{profile.fees.total}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-graph-up" style={{ fontSize: '48px' }}></i>
              <h5 className="mt-3">Average Marks</h5>
              <h2>{profile.results.averageMarks.toFixed(1)}</h2>
              <p className="mb-0">{profile.results.count} results recorded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile

