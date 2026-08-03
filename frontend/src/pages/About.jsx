import React from 'react'

const About = () => {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="text-center mb-5">
            <i className="bi bi-info-circle-fill text-primary me-2"></i>
            About Smart School System
          </h1>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="card-title">
                <i className="bi bi-lightbulb text-warning me-2"></i>
                Our Mission
              </h3>
              <p className="card-text">
                Smart School System is designed to revolutionize school management by providing
                a comprehensive, user-friendly platform that streamlines administrative tasks,
                enhances communication, and improves overall educational outcomes.
              </p>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="card-title">
                <i className="bi bi-trophy text-success me-2"></i>
                What We Offer
              </h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Attendance Management:</strong> Real-time attendance tracking with automated notifications
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Academic Records:</strong> Easy upload and access to student results
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Role-Based Access:</strong> Secure access for Admin, Teachers, and Students
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Notifications:</strong> Email and SMS alerts for important updates
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <strong>Reporting:</strong> Comprehensive reports and analytics
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="card-title">
                <i className="bi bi-code-slash text-info me-2"></i>
                Technology Stack
              </h3>
              <div className="row">
                <div className="col-md-6">
                  <h5>Backend</h5>
                  <ul>
                    <li>Spring Boot</li>
                    <li>Hibernet </li>
                    <li>MySQL</li>
                    <li>JWT Authentication</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h5>Frontend</h5>
                  <ul>
                    <li>React.js</li>
                    <li>Bootstrap 5</li>
                    <li>Axios</li>
                    <li>React Router</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title">
                <i className="bi bi-people-fill text-primary me-2"></i>
                Our Team
              </h3>
              <p className="card-text">
                We are a dedicated team of developers committed to creating innovative solutions
                for educational institutions. Our goal is to make school management as simple
                and efficient as possible.
              </p>
              <ul>
                <li>Raj Tangadi (PL)</li>
                <li>Kiran Mahajan</li>
                <li>Pranali Mahadik</li>
                <li>Adarsh Kushwah</li>
                <li>Saurabh Mahajan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

