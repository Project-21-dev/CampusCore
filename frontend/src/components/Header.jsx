import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const dashboardLink = (() => {
    if (!user) return null
    if (user.role === 'Admin') return '/admin/dashboard'
    if (user.role === 'Teacher') return '/teacher/dashboard'
    if (user.role === 'Student') return '/student/dashboard'
    if (user.role === 'Parent') return '/parent/dashboard'
    return null
  })()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navClass = ({ isActive }) =>
    `nav-link app-nav-link${isActive ? ' active' : ''}`

  return (
    <header className="app-header sticky-top">
      <nav className="navbar navbar-expand-xl navbar-dark">
        <div className="container-fluid app-nav-shell">
          <Link className="navbar-brand app-brand" to="/">
            <span className="app-brand-mark">
              <i className="bi bi-mortarboard-fill"></i>
            </span>
            <span>
              <strong>CampusCore</strong>
              <small>Smart campus platform</small>
            </span>
          </Link>

          <button
            className="navbar-toggler app-nav-toggle"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#campusCoreNav"
            aria-controls="campusCoreNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="campusCoreNav">
            <ul className="navbar-nav mx-xl-auto align-items-xl-center app-nav-list">
              <li className="nav-item"><NavLink className={navClass} to="/"><i className="bi bi-house-door"></i>Home</NavLink></li>
              <li className="nav-item"><NavLink className={navClass} to="/about"><i className="bi bi-info-circle"></i>About</NavLink></li>
              <li className="nav-item"><NavLink className={navClass} to="/contact"><i className="bi bi-chat-dots"></i>Contact</NavLink></li>
              <li className="nav-item"><NavLink className={navClass} to="/admission"><i className="bi bi-file-earmark-person"></i>Admission</NavLink></li>
              <li className="nav-item"><NavLink className={navClass} to="/admission/status"><i className="bi bi-search"></i>Status</NavLink></li>

              {user && dashboardLink && (
                <li className="nav-item"><NavLink className={navClass} to={dashboardLink}><i className="bi bi-grid-1x2"></i>Dashboard</NavLink></li>
              )}

              {user && (user.role === 'Admin' || user.role === 'Teacher') && (
                <li className="nav-item dropdown">
                  <button className="nav-link app-nav-link dropdown-toggle border-0 bg-transparent" data-bs-toggle="dropdown" type="button">
                    <i className="bi bi-sliders"></i>Manage
                  </button>
                  <ul className="dropdown-menu app-dropdown-menu">
                    <li>
                      <Link
                        className="dropdown-item"
                        to={user.role === 'Admin' ? '/admin/attendance' : '/attendance'}
                      >
                        <i className="bi bi-calendar-check"></i>Attendance
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to={user.role === 'Admin' ? '/admin/results' : '/results'}
                      >
                        <i className="bi bi-bar-chart"></i>Results
                      </Link>
                    </li>
                    <li><Link className="dropdown-item" to="/enrollment"><i className="bi bi-journal-bookmark"></i>Enrollment</Link></li>
                    <li><Link className="dropdown-item" to="/fees"><i className="bi bi-wallet2"></i>Fees</Link></li>
                    {user.role === 'Admin' && <li><hr className="dropdown-divider" /></li>}
                    {user.role === 'Admin' && <li><Link className="dropdown-item" to="/admin/audit-log"><i className="bi bi-clock-history"></i>Audit Log</Link></li>}
                  </ul>
                </li>
              )}

              {user && (
                <li className="nav-item"><NavLink className={navClass} to="/announcements"><i className="bi bi-megaphone"></i>Announcements</NavLink></li>
              )}
            </ul>

            <div className="app-nav-actions">
              {user ? (
                <div className="dropdown">
                  <button className="app-user-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="app-user-avatar">{(user.username || user.email || 'U').charAt(0).toUpperCase()}</span>
                    <span className="app-user-copy">
                      <strong>{user.username || user.email}</strong>
                      <small>{user.role}</small>
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end app-dropdown-menu">
                    {dashboardLink && <li><Link className="dropdown-item" to={dashboardLink}><i className="bi bi-grid"></i>My dashboard</Link></li>}
                    <li><button className="dropdown-item text-danger" type="button" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i>Logout</button></li>
                  </ul>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn app-btn-ghost">Login</Link>
                  <Link to="/register" className="btn app-btn-primary">Create account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
