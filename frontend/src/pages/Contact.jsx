import React, { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, this would send data to backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="text-center mb-5">
            <i className="bi bi-envelope-fill text-primary me-2"></i>
            Contact Us
          </h1>

          <div className="row mb-5">
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-geo-alt-fill text-primary" style={{ fontSize: '48px' }}></i>
                  <h5 className="mt-3">Address</h5>
                  <p className="text-muted mb-0">
                    CDAC Kharghar,<br />
                    Mumbai
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-telephone-fill text-success" style={{ fontSize: '48px' }}></i>
                  <h5 className="mt-3">Phone</h5>
                  <p className="text-muted mb-0">
                    +91 9876543210<br />
                    Mon-Fri 9am-5pm
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-envelope-fill text-warning" style={{ fontSize: '48px' }}></i>
                  <h5 className="mt-3">Email</h5>
                  <p className="text-muted mb-0">
                    info@smartschool.com<br />
                    support@smartschool.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4">
                <i className="bi bi-send-fill text-primary me-2"></i>
                Send us a Message
              </h3>
              
              {submitted && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Thank you! Your message has been sent successfully.
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    <i className="bi bi-person me-2"></i>Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">
                    <i className="bi bi-tag me-2"></i>Subject
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    <i className="bi bi-chat-left-text me-2"></i>Message
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-send me-2"></i>Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

