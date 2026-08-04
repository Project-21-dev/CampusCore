import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="app-footer">
    <div className="container-fluid app-footer-shell">
      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <Link className="app-footer-brand" to="/">
            <span className="app-brand-mark"><i className="bi bi-mortarboard-fill"></i></span>
            <span><strong>CampusCore</strong><small>Connected learning. Clearer administration.</small></span>
          </Link>
          <p className="app-footer-copy">A unified school platform for admissions, attendance, results, fees, communication and role-based access.</p>
        </div>
        <div className="col-6 col-lg-2">
          <h6>Explore</h6>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admission">Admissions</Link>
        </div>
        <div className="col-6 col-lg-2">
          <h6>Platform</h6>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/admission/status">Track status</Link>
        </div>
        <div className="col-lg-3">
          <h6>Contact</h6>
          <p><i className="bi bi-envelope"></i> smartschool@gmail.com</p>
          <p><i className="bi bi-telephone"></i> +91 98765 43210</p>
        </div>
      </div>
      <div className="app-footer-bottom">
        <span>© 2026 CampusCore. All rights reserved.</span>
        <span>Built for modern schools</span>
      </div>
    </div>
  </footer>
)

export default Footer
