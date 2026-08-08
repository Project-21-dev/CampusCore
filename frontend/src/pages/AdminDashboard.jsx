import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    totalAttendance: 0,
    todayAttendance: 0,
    feesCollected: 0,
    feesPending: 0
  })
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes, parentsRes, attendanceRes, feesRes] = await Promise.all([
        api.get('/user/students'),
        api.get('/user/teachers'),
        api.get('/parent/admin/all'),
        api.get('/attendance/all'),
        api.get('/studentmanagement/fee/all')
      ])

      setStudents(studentsRes.data)
      setTeachers(teachersRes.data)
      setParents(Array.isArray(parentsRes.data) ? parentsRes.data : [])
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = attendanceRes.data.filter(
        a => a.date === today
      )

      const feeRows = Array.isArray(feesRes.data) ? feesRes.data : []
      const feesCollected = feeRows.filter((fee) => fee.status === 'Paid').reduce((sum, fee) => sum + Number(fee.amount || 0), 0)
      const feesPending = feeRows.filter((fee) => fee.status !== 'Paid').reduce((sum, fee) => sum + Number(fee.amount || 0), 0)

      setStats({
        students: studentsRes.data.length,
        teachers: teachersRes.data.length,
        parents: Array.isArray(parentsRes.data) ? parentsRes.data.length : 0,
        totalAttendance: attendanceRes.data.length,
        todayAttendance: todayAttendance.length,
        feesCollected,
        feesPending
      })
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
          <i className="bi bi-speedometer2 text-primary me-2"></i>
          Admin Dashboard
        </h1>
        <span className="badge bg-primary">Welcome, {user?.username}!</span>
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <Link to="/admin/students" className="text-decoration-none">
            <div className="card bg-primary text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-people-fill" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Manage Students</h5>
                
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/teachers" className="text-decoration-none">
            <div className="card bg-success text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-person-badge-fill" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Manage Teachers</h5>
                
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/attendance" className="text-decoration-none">
            <div className="card bg-info text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-calendar-check-fill" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Manage Attendance</h5>
                
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-3">
          <Link to="/admin/results" className="text-decoration-none">
            <div className="card bg-warning text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-graph-up" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Manage Results</h5>
              
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Link to="/admin/admissions" className="text-decoration-none">
            <div className="card bg-info text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-file-earmark-person" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Admission Applications</h5>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/enrollment" className="text-decoration-none">
            <div className="card bg-secondary text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-book-fill" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Enrollment Management</h5>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/fees" className="text-decoration-none">
            <div className="card bg-danger text-white h-100">
              <div className="card-body text-center">
                <i className="bi bi-wallet2" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Fee Management</h5>
                <small>Due ₹{stats.feesPending.toFixed(2)} · Collected ₹{stats.feesCollected.toFixed(2)}</small>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <Link to="/admin/parents" className="text-decoration-none">
            <div className="card h-100 border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#fff' }}>
              <div className="card-body text-center">
                <i className="bi bi-person-hearts" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Manage Parents</h5>
                <small>{stats.parents} parent account{stats.parents === 1 ? '' : 's'} · Review and manage child links</small>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <Link to="/admin/analytics" className="text-decoration-none">
            <div className="card h-100" style={{ background: 'linear-gradient(135deg, #6f42c1, #0d6efd)', color: '#fff' }}>
              <div className="card-body text-center">
                <i className="bi bi-bar-chart-fill" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3">Analytics Dashboard</h5>
                <small>Class-wise attendance & performance comparison charts</small>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2">Total Students</h6>
                  <h2 className="mb-0">{stats.students}</h2>
                </div>
                <i className="bi bi-people-fill" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2">Total Teachers</h6>
                  <h2 className="mb-0">{stats.teachers}</h2>
                </div>
                <i className="bi bi-person-badge-fill" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2">Total Attendance</h6>
                  <h2 className="mb-0">{stats.totalAttendance}</h2>
                </div>
                <i className="bi bi-calendar-check-fill" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2">Today's Attendance</h6>
                  <h2 className="mb-0">{stats.todayAttendance}</h2>
                </div>
                <i className="bi bi-calendar-day-fill" style={{ fontSize: '48px', opacity: 0.5 }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
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
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.studentId}>
                    <td>{student.rollNo}</td>
                    <td>{student.fullName || student.username}</td>
                    <td>{student.className}</td>
                    <td>{student.email || '-'}</td>
                    <td>{student.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-person-badge-fill me-2"></i>Teachers
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.teacherId}>
                    <td>{teacher.username}</td>
                    <td>{teacher.subject}</td>
                    <td>{teacher.email || '-'}</td>
                    <td>{teacher.phone || '-'}</td>
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

export default AdminDashboard

