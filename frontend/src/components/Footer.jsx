import React from 'react'

const Footer = () => {
  return (
    <footer className="footer-modern bg-gradient text-light py-5 mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="footer-brand mb-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-mortarboard-fill me-2 text-warning"></i>
                School Sync
              </h5>
              <p className="text-light-emphasis mb-3">
                Empowering education through technology.
              </p>
              <div className="social-links">
                <a href="#" className="social-link me-3" aria-label="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="social-link me-3" aria-label="Twitter">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="social-link me-3" aria-label="LinkedIn">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-semibold mb-3 text-warning">Quick Links</h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <a href="/" className="footer-link">
                  <i className="bi bi-house me-2"></i>Home
                </a>
              </li>
              <li className="mb-2">
                <a href="/about" className="footer-link">
                  <i className="bi bi-info-circle me-2"></i>About
                </a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="footer-link">
                  <i className="bi bi-envelope me-2"></i>Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-semibold mb-3 text-warning">Services</h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <a href="#" className="footer-link">
                  <i className="bi bi-people me-2"></i>Students
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="footer-link">
                  <i className="bi bi-calendar-check me-2"></i>Attendance
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="footer-link">
                  <i className="bi bi-credit-card me-2"></i>Fees
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-semibold mb-3 text-warning">Contact</h6>
            <div className="contact-info">
              <div className="contact-item mb-2">
                <i className="bi bi-envelope-fill text-warning me-2"></i>
                <a href="mailto:smartschool@gmail.com" className="footer-link">smartschool@gmail.com</a>
              </div>
              <div className="contact-item mb-2">
                <i className="bi bi-headset text-warning me-2"></i>
                <a href="mailto:smartschoolsupport@gmail.com" className="footer-link">support@smartschool.com</a>
              </div>
              <div className="contact-item mb-2">
                <i className="bi bi-telephone-fill text-warning me-2"></i>
                <a href="tel:+919876543210" className="footer-link">+91 98765 43210</a>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="my-4 border-light-subtle" />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 text-light-emphasis">
              &copy; 2024 Smart School System. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end mt-2 mt-md-0">
            <a href="#" className="footer-link me-3">Privacy Policy</a>
            <a href="#" className="footer-link me-3">Terms of Service</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

