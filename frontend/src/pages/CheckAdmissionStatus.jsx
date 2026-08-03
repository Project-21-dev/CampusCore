import React, { useState } from 'react'
import api from '../services/api'

const CheckAdmissionStatus = () => {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')

  const handleCheck = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStatus(null)

    try {
      const response = await api.get('/admission/check-status', {
        params: { email, phone }
      })
      setStatus(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'No application found with the provided details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-warning',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger',
      'Under Review': 'bg-info'
    }
    return badges[status] || 'bg-secondary'
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="card-header bg-info text-white text-center py-4">
              <h2 className="mb-0">
                <i className="bi bi-search me-2"></i>
                Check Admission Status
              </h2>
              <p className="mb-0 mt-2">Enter your email or phone number to check application status</p>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleCheck}>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-info btn-lg px-5"
                    disabled={loading || (!email && !phone)}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Checking...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>Check Status
                      </>
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger mt-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              {status && (
                <div className="alert alert-success mt-4">
                  <h5>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Application Found
                  </h5>
                  <hr />
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Application Number:</strong></td>
                        <td>{status.applicationNumber}</td>
                      </tr>
                      <tr>
                        <td><strong>Student Name:</strong></td>
                        <td>{status.fullName}</td>
                      </tr>
                      <tr>
                        <td><strong>Applied Class:</strong></td>
                        <td>{status.appliedClass}</td>
                      </tr>
                      <tr>
                        <td><strong>Application Date:</strong></td>
                        <td>{status.applicationDate}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadge(status.status)}`}>
                            {status.status}
                          </span>
                        </td>
                      </tr>
                      {status.remarks && (
                        <tr>
                          <td><strong>Remarks:</strong></td>
                          <td>{status.remarks}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckAdmissionStatus

