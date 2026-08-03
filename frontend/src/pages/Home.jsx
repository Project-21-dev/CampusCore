import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import classroomHero from '../assets/classroom-hero.svg'

const features = [
  { icon: 'bi-calendar2-check', tone: 'blue', title: 'Smart Attendance', text: 'Mark attendance quickly, review daily records and identify absentee trends.' },
  { icon: 'bi-graph-up-arrow', tone: 'green', title: 'Academic Results', text: 'Publish marks and give students a simple view of their academic performance.' },
  { icon: 'bi-person-check', tone: 'orange', title: 'Online Admissions', text: 'Manage applications, verification, admission status and student enrollment.' },
  { icon: 'bi-wallet2', tone: 'purple', title: 'Fee Management', text: 'Track fees, payment status and pending dues from a single school workspace.' },
  { icon: 'bi-megaphone', tone: 'red', title: 'Announcements', text: 'Share important notices with students, teachers and parents instantly.' },
  { icon: 'bi-shield-lock', tone: 'teal', title: 'Secure Role Access', text: 'Separate dashboards and permissions for admins, teachers, students and parents.' }
]

const Home = () => {
  const { user } = useAuth()

  const dashboardLink = (() => {
    if (!user) return '/login'
    if (user.role === 'Admin') return '/admin/dashboard'
    if (user.role === 'Teacher') return '/teacher/dashboard'
    if (user.role === 'Student') return '/student/dashboard'
    if (user.role === 'Parent') return '/parent/dashboard'
    return '/login'
  })()

  return (
    <main className="edu-home">
      <section className="edu-hero">
        <div className="container-fluid app-page-shell">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="edu-badge"><i className="bi bi-mortarboard-fill"></i> A smarter digital school campus</span>
              <h1>Smarter Schools.Better Learning.</h1>
              <p className="edu-hero-text">Empowering administrators,teachers,students,and parents with one secure,intelligent platform</p>

              <div className="d-flex flex-wrap gap-3 edu-hero-actions">
                {user ? (
                  <Link to={dashboardLink} className="btn edu-btn-primary edu-btn-lg"><i className="bi bi-grid-fill"></i> Open dashboard</Link>
                ) : (
                  <>
                    <Link to="/admission" className="btn edu-btn-primary edu-btn-lg"><i className="bi bi-file-earmark-person"></i> Apply for admission</Link>
                    <Link to="/login" className="btn edu-btn-secondary edu-btn-lg"><i className="bi bi-box-arrow-in-right"></i> Sign in</Link>
                  </>
                )}
              </div>

              <div className="edu-trust-list">
                <span><i className="bi bi-check-circle-fill"></i> Easy for every role</span>
                <span><i className="bi bi-check-circle-fill"></i> Secure student records</span>
                <span><i className="bi bi-check-circle-fill"></i> Built for desktop and mobile</span>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="edu-classroom-card">
                <img src={classroomHero} alt="Illustrated modern classroom with benches, board and students" className="edu-classroom-image" />
                <div className="edu-floating-note edu-note-top">
                  <span className="edu-note-icon"><i className="bi bi-calendar-check-fill"></i></span>
                  <span><strong>94% attendance</strong><small>Today across all classes</small></span>
                </div>
                <div className="edu-floating-note edu-note-bottom">
                  <span className="edu-note-icon warm"><i className="bi bi-megaphone-fill"></i></span>
                  <span><strong>12 new updates</strong><small>Announcements and notices</small></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="edu-quick-stats">
        <div className="container-fluid app-page-shell">
          <div className="edu-stat-grid">
            <div><i className="bi bi-people-fill"></i><strong>Students</strong><span>Profiles, attendance and results</span></div>
            <div><i className="bi bi-person-workspace"></i><strong>Teachers</strong><span>Classes, records and performance</span></div>
            <div><i className="bi bi-building-fill-check"></i><strong>Administration</strong><span>Admissions and daily operations</span></div>
            <div><i className="bi bi-people"></i><strong>Parents</strong><span>Updates and academic visibility</span></div>
          </div>
        </div>
      </section>

      <section className="edu-section">
        <div className="container-fluid app-page-shell">
          <div className="edu-section-heading">
            <span className="edu-kicker">Everything your campus needs</span>
            <h2>A complete school experience in one place</h2>
            <p>Practical tools reduce repetitive work and help every member of the school community stay informed.</p>
          </div>

          <div className="row g-4">
            {features.map((feature) => (
              <div className="col-md-6 col-xl-4" key={feature.title}>
                <article className="edu-feature-card">
                  <span className={`edu-feature-icon ${feature.tone}`}><i className={`bi ${feature.icon}`}></i></span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <span className="edu-feature-arrow"><i className="bi bi-arrow-up-right"></i></span>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="edu-campus-section">
        <div className="container-fluid app-page-shell">
          <div className="edu-campus-panel">
            <div className="edu-campus-copy">
              <span className="edu-kicker light">Made for real school life</span>
              <h2>From the classroom bench to the admin office.</h2>
              <p>SchoolSync gives each user a focused dashboard while keeping the whole campus connected through one reliable system.</p>
              <div className="edu-role-pills">
                <span><i className="bi bi-person-gear"></i> Admin</span>
                <span><i className="bi bi-person-workspace"></i> Teacher</span>
                <span><i className="bi bi-backpack-fill"></i> Student</span>
                <span><i className="bi bi-people-fill"></i> Parent</span>
              </div>
            </div>
            <div className="edu-campus-visual">
              <div className="edu-mini-card"><i className="bi bi-journal-check"></i><strong>Classes stay organised</strong><span>Attendance and results remain easy to manage.</span></div>
              <div className="edu-mini-card"><i className="bi bi-bell-fill"></i><strong>Everyone stays informed</strong><span>Important updates reach the right people quickly.</span></div>
              <div className="edu-mini-card"><i className="bi bi-shield-check"></i><strong>Records stay protected</strong><span>Role-based access keeps information secure.</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="edu-final-cta">
        <div className="container-fluid app-page-shell">
          <div className="edu-final-card">
            <div>
              <span className="edu-kicker light">Ready to begin?</span>
              <h2>Bring your school community together with SchoolSync.</h2>
            </div>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/admission" className="btn edu-btn-light edu-btn-lg">Apply now</Link>
              <Link to="/login" className="btn edu-btn-outline-light edu-btn-lg">Login</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
