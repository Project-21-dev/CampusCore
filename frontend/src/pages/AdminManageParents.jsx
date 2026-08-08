import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../services/api'

const AdminManageParents = () => {
  const navigate = useNavigate()
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/parent/admin/all')
      setParents(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to load parent accounts'
      })
    } finally {
      setLoading(false)
    }
  }

  const unlinkChild = async (parent, child) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Unlink child?',
      html: `
        <div class="text-start">
          <p class="mb-2">Remove the relationship between:</p>
          <strong>${parent.username}</strong>
          <span class="text-muted"> and </span>
          <strong>${child.studentName || child.rollNo}</strong>
          <p class="small text-muted mt-3 mb-0">
            The student account and the parent account will both remain active.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes, unlink',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545'
    })

    if (!result.isConfirmed) return

    try {
      await api.delete(`/parent/admin/${parent.userId}/links/${child.linkId}`)
      await fetchParents()
      Swal.fire('Unlinked', 'The parent-child relationship was removed.', 'success')
    } catch (error) {
      Swal.fire(
        'Unable to unlink',
        error.response?.data?.message || 'The relationship could not be removed.',
        'error'
      )
    }
  }

  const deleteParent = async (parent) => {
    const childCount = parent.children?.length || 0

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete parent account?',
      html: `
        <div class="text-start">
          <p class="mb-2"><strong>${parent.username}</strong> will lose access to CampusCore.</p>
          <p class="mb-2">
            ${childCount > 0
              ? `${childCount} parent-child link${childCount === 1 ? '' : 's'} will be removed.`
              : 'This parent currently has no linked children.'}
          </p>
          <p class="small text-success mb-0">
            Student accounts and student academic records will NOT be deleted.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Delete parent',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545'
    })

    if (!result.isConfirmed) return

    try {
      await api.delete(`/parent/admin/${parent.userId}`)
      await fetchParents()
      Swal.fire('Deleted', 'Parent account deleted. Student accounts were preserved.', 'success')
    } catch (error) {
      Swal.fire(
        'Unable to delete parent',
        error.response?.data?.message || 'The parent account could not be deleted.',
        'error'
      )
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in-up">
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-link text-decoration-none text-muted p-0"
          onClick={() => navigate('/admin/dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <p className="text-primary fw-semibold mb-1">ACCOUNT RELATIONSHIPS</p>
          <h1 className="fw-bold mb-2">
            <i className="bi bi-people-fill text-primary me-3"></i>
            Parent Management
          </h1>
          <p className="text-muted mb-0">
            View parent accounts, review linked children, unlink relationships, or remove parent access.
          </p>
        </div>
        <span className="badge text-bg-light border px-3 py-2">
          {parents.length} parent account{parents.length === 1 ? '' : 's'}
        </span>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="alert alert-info border-0 shadow-sm">
        <i className="bi bi-shield-check me-2"></i>
        Deleting a parent never deletes a student. Deleting a student only removes the parent-child link and keeps the parent account.
      </div>

      {parents.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-person-heart display-4 text-muted"></i>
            <h4 className="mt-3">No parent accounts found</h4>
            <p className="text-muted mb-0">
              Parents appear here after registering through Create Parent Account.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {parents.map((parent) => (
            <div className="col-12" key={parent.userId}>
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 pt-4 px-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="d-flex gap-3 align-items-center">
                      <div
                        className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: 52, height: 52, fontSize: 20 }}
                      >
                        {(parent.username || parent.email || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="mb-1">{parent.username}</h5>
                        <div className="text-muted small">
                          <span className="me-3">
                            <i className="bi bi-envelope me-1"></i>
                            {parent.email || 'No email'}
                          </span>
                          <span>
                            <i className="bi bi-telephone me-1"></i>
                            {parent.phone || 'No phone'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      onClick={() => deleteParent(parent)}
                    >
                      <i className="bi bi-trash3 me-1"></i>
                      Delete Parent
                    </button>
                  </div>
                </div>

                <div className="card-body px-4 pb-4">
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">
                      Linked Children
                    </h6>
                    <span className="badge bg-primary-subtle text-primary">
                      {parent.children?.length || 0}
                    </span>
                  </div>

                  {!parent.children || parent.children.length === 0 ? (
                    <p className="text-muted mb-0">No students are currently linked to this parent.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Roll No</th>
                            <th>Class</th>
                            <th>Relation</th>
                            <th>Attendance</th>
                            <th>Pending Fees</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parent.children.map((child) => (
                            <tr key={child.linkId}>
                              <td className="fw-semibold">{child.studentName || '-'}</td>
                              <td>{child.rollNo || '-'}</td>
                              <td>{child.className || '-'}</td>
                              <td>{child.relation || 'Guardian'}</td>
                              <td>{Number(child.attendancePercentage || 0).toFixed(1)}%</td>
                              <td>₹{Number(child.pendingFeeAmount || 0).toFixed(2)}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm rounded-pill"
                                  onClick={() => unlinkChild(parent, child)}
                                >
                                  <i className="bi bi-link-45deg me-1"></i>
                                  Unlink
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminManageParents
