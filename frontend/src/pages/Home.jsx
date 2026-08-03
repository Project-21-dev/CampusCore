import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'Admin':
        return '/admin/dashboard'
      case 'Teacher':
        return '/teacher/dashboard'
      case 'Student':
        return '/student/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                <i className="bi bi-mortarboard-fill me-3 text-warning"></i>
                Welcome to <br></br>Smart School System
              </h1>
              <p className="lead mb-4">
                A modern, comprehensive school management system designed to streamline
                attendance tracking, academic records, and communication.
              </p>
              {!user ? (
                <div>
                  <Link to="/admission" className="btn btn-light btn-lg me-3">
                    <i className="bi bi-file-earmark-person me-2"></i>Apply for Admission
                  </Link>
                </div>
              ) : (
                <Link to={getDashboardLink()} className="btn btn-light btn-lg">
                  <i className="bi bi-speedometer2 me-2"></i>Go to Dashboard
                </Link>
              )}
            </div>
            <div className="col-lg-6 text-center">
              <i className="bi bi-mortarboard" style={{ fontSize: '200px', opacity: 0.3 }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">
            <i className="bi bi-star-fill text-warning me-2"></i>
            Key Features
          </h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-calendar-check text-primary" style={{ fontSize: '48px' }}></i>
                  <h4 className="mt-3">📅 Attendance Management</h4>
                  <p className="text-muted">
                    Easy-to-use attendance tracking with automatic notifications for absences.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up text-success" style={{ fontSize: '48px' }}></i>
                  <h4 className="mt-3">📊 Academic Results</h4>
                  <p className="text-muted">
                    Upload and view academic results with detailed subject-wise breakdowns.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-bell text-warning" style={{ fontSize: '48px' }}></i>
                  <h4 className="mt-3">🔔 Smart Notifications</h4>
                  <p className="text-muted">
                    Automatic email and SMS notifications for important updates and absences.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-shield-check text-info" style={{ fontSize: '48px' }}></i>
                  <h4 className="mt-3">🔒 Secure Access</h4>
                  <p className="text-muted">
                    Role-based access control with JWT authentication for maximum security.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-people text-danger" style={{ fontSize: '48px' }}></i>
                  <h4 className="mt-3">👥 User Management</h4>
                  <p className="text-muted">
                    Comprehensive user management for admins, teachers, and students.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-bar-chart text-secondary" style={{ fontSize: '48px' }}></i>
                  <h4 className="mt-3">📈 Reports & Analytics</h4>
                  <p className="text-muted">
                    Generate detailed reports on attendance and academic performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-light py-5">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Get Started?</h2>
          <p className="lead text-muted mb-4">
            Join thousands of schools already using Smart School System
          </p>
          {!user && (
            <div>
              <Link to="/admission" className="btn btn-primary btn-lg">
                <i className="bi bi-file-earmark-person me-2"></i>Apply for Admission
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home

