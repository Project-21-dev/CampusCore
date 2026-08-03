import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) {
      return null
    }

    switch (user.role) {
      case 'Admin':
        return '/admin/dashboard'

      case 'Teacher':
        return '/teacher/dashboard'

      case 'Student':
        return '/student/dashboard'

      case 'Parent':
        return '/parent/dashboard'

      default:
        return null
    }
  }

  const closeNavbar = () => {
    const navbar = document.getElementById('navbarNav')

    if (navbar && navbar.classList.contains('show')) {
      navbar.classList.remove('show')
    }
  }

  const dashboardLink = getDashboardLink()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow-lg">
      <div className="container-fluid px-3 px-xl-4">

        {/* Brand */}
        <Link
          className="navbar-brand fw-bold fs-3 flex-shrink-0"
          to="/"
          onClick={closeNavbar}
        >
          <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
          <span className="brand-text">School Sync</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">

          {/* Left-side navigation links */}
          <ul className="navbar-nav me-auto align-items-lg-center">

            <li className="nav-item">
              <Link
                className="nav-link nav-link-modern"
                to="/"
                onClick={closeNavbar}
              >
                <i className="bi bi-house-fill me-2"></i>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link nav-link-modern"
                to="/about"
                onClick={closeNavbar}
              >
                <i className="bi bi-info-circle-fill me-2"></i>
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link nav-link-modern"
                to="/contact"
                onClick={closeNavbar}
              >
                <i className="bi bi-envelope-fill me-2"></i>
                Contact
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link nav-link-modern"
                to="/admission"
                onClick={closeNavbar}
              >
                <i className="bi bi-file-earmark-person me-2"></i>
                Admission
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link nav-link-modern"
                to="/admission/status"
                onClick={closeNavbar}
              >
                <i className="bi bi-search me-2"></i>
                Status
              </Link>
            </li>

            {/* Dashboard link according to logged-in role */}
            {user && dashboardLink && (
              <li className="nav-item">
                <Link
                  className="nav-link nav-link-modern"
                  to={dashboardLink}
                  onClick={closeNavbar}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>
              </li>
            )}

            {/* Admin links grouped to prevent navbar overflow */}
            {user && user.role === 'Admin' && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle nav-link-modern border-0 bg-transparent"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-gear-fill me-2"></i>
                  Manage
                </button>

                <ul className="dropdown-menu dropdown-menu-modern">
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/attendance"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Attendance
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/results"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-graph-up me-2"></i>
                      Results
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/enrollment"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-book me-2"></i>
                      Enrollment
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/fees"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-cash-coin me-2"></i>
                      Fees
                    </Link>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/audit-log"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      Audit Log
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Teacher links */}
            {user && user.role === 'Teacher' && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle nav-link-modern border-0 bg-transparent"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-journal-bookmark-fill me-2"></i>
                  Academics
                </button>

                <ul className="dropdown-menu dropdown-menu-modern">
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/attendance"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      Attendance
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/results"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-graph-up me-2"></i>
                      Results
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Student links */}
            {user && user.role === 'Student' && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle nav-link-modern border-0 bg-transparent"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Student
                </button>

                <ul className="dropdown-menu dropdown-menu-modern">
                  <li>
                    <Link
                      className="dropdown-item"
                      to={`/student/profile/${user.studentId}`}
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-person-badge me-2"></i>
                      Profile
                    </Link>
                  </li>

                  <li>
                    <Link
                      className="dropdown-item"
                      to="/fees"
                      onClick={closeNavbar}
                    >
                      <i className="bi bi-cash-coin me-2"></i>
                      Fees
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {/* Announcements */}
            {user && (
              <li className="nav-item">
                <Link
                  className="nav-link nav-link-modern"
                  to="/announcements"
                  onClick={closeNavbar}
                >
                  <i className="bi bi-megaphone me-2"></i>
                  Announcements
                </Link>
              </li>
            )}
          </ul>

          {/* Right-side Login/Register or User dropdown */}
          <ul className="navbar-nav ms-lg-auto align-items-lg-center flex-shrink-0">

            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle user-dropdown border-0 bg-transparent"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="user-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>

                  <span className="user-info">
                    <span className="user-name">
                      {user.username || user.email}
                    </span>

                    <small className="user-role">
                      {user.role}
                    </small>
                  </span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-modern">
                  {dashboardLink && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to={dashboardLink}
                        onClick={closeNavbar}
                      >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                      </Link>
                    </li>
                  )}

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link register-btn"
                    to="/register"
                    onClick={closeNavbar}
                  >
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Register
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link login-btn"
                    to="/login"
                    onClick={closeNavbar}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Header