// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import api from '../services/api'

// const AdminManageAdmissions = () => {
//   const navigate = useNavigate()
//   const { user } = useAuth()
//   const [admissions, setAdmissions] = useState([])
//   const [selectedAdmission, setSelectedAdmission] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [showModal, setShowModal] = useState(false)
//   const [statusForm, setStatusForm] = useState({
//     status: 'Pending',
//     remarks: '',
//     createStudentAccount: false
//   })
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [admissionToDelete, setAdmissionToDelete] = useState(null)
//   const [message, setMessage] = useState({ type: '', text: '' })

//   useEffect(() => {
//     fetchAdmissions()
//   }, [])

//   const handleBack = () => {
//     navigate(-1)
//   }

//   const fetchAdmissions = async () => {
//     try {
//       const response = await api.get('/admission/all')
//       setAdmissions(response.data)
//     } catch (error) {
//       console.error('Error fetching admissions:', error)
//       setMessage({ type: 'danger', text: 'Failed to load admissions' })
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleViewDetails = async (admissionId) => {
//     try {
//       const response = await api.get(`/admission/${admissionId}`)
//       setSelectedAdmission(response.data)
//       setShowModal(true)
//     } catch (error) {
//       setMessage({ type: 'danger', text: 'Failed to load admission details' })
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000)
//     }
//   }

//   const handleUpdateStatus = async (e) => {
//     e.preventDefault()
//     try {
//       await api.put(`/admission/${selectedAdmission.admissionId}/status`, statusForm)
//       setMessage({ type: 'success', text: 'Admission status updated successfully!' })
//       setShowModal(false)
//       setSelectedAdmission(null)
//       fetchAdmissions()
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000)
//     } catch (error) {
//       setMessage({
//         type: 'danger',
//         text: error.response?.data?.message || 'Failed to update status'
//       })
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000)
//     }
//   }

//   const handleDeleteClick = (admissionId) => {
//     setAdmissionToDelete(admissionId)
//     setShowDeleteModal(true)
//   }

//   const confirmDelete = async () => {
//     if (!admissionToDelete) return

//     try {
//       await api.delete(`/admission/${admissionToDelete}`)
//       setMessage({ type: 'success', text: 'Admission deleted successfully!' })
//       setShowDeleteModal(false)
//       setAdmissionToDelete(null)
//       fetchAdmissions()
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000)
//     } catch (error) {
//       setMessage({ type: 'danger', text: 'Failed to delete admission' })
//       setTimeout(() => setMessage({ type: '', text: '' }), 5000)
//     }
//   }

//   const getStatusBadge = (status) => {
//     const badges = {
//       'Pending': 'bg-warning-subtle text-warning border-warning-subtle',
//       'Approved': 'bg-success-subtle text-success border-success-subtle',
//       'Rejected': 'bg-danger-subtle text-danger border-danger-subtle',
//       'Under Review': 'bg-info-subtle text-info border-info-subtle'
//     }
//     return badges[status] || 'bg-light text-muted border-light'
//   }

//   if (loading) {
//     return (
//       <div className="container py-5 text-center">
//         <div className="spinner-border text-primary" role="status"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="container py-5 fade-in-up">
//       <div className="mb-4">
//         <button className="btn btn-link text-decoration-none text-muted p-0 hover-glow" onClick={handleBack}>
//           <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
//         </button>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mb-5">
//         <h1 className="fw-bold text-dark">
//           <i className="bi bi-file-earmark-person-fill text-primary me-3"></i>
//           Admission Applications
//         </h1>
//         <div className="glass-panel px-3 py-2">
//           <span className="text-muted small text-uppercase fw-bold me-2">Total Recieved</span>
//           <span className="badge bg-primary rounded-pill fs-6">{admissions.length}</span>
//         </div>
//       </div>

//       {message.text && (
//         <div className={`alert alert-${message.type} glass-panel border-0 mb-4 fade show`} role="alert">
//           <div className="d-flex align-items-center">
//             <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-3 fs-4`}></i>
//             <div>{message.text}</div>
//             <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
//           </div>
//         </div>
//       )}

//       <div className="glass-panel p-4">
//         <div className="table-responsive">
//           <table className="table modern-table mb-0">
//             <thead>
//               <tr>
//                 <th>App. No.</th>
//                 <th>Applicant Name</th>
//                 <th>Class</th>
//                 <th>Application Date</th>
//                 <th>Status</th>
//                 <th className="text-end">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {admissions.length > 0 ? (
//                 admissions.map((admission) => (
//                   <tr key={admission.admissionId}>
//                     <td><span className="fw-bold text-primary">{admission.applicationNumber}</span></td>
//                     <td>
//                       <div className="fw-medium">{admission.fullName}</div>
//                       <div className="small text-muted">{admission.email}</div>
//                     </td>
//                     <td>{admission.appliedClass}</td>
//                     <td className="small">{admission.applicationDate}</td>
//                     <td>
//                       <span className={`badge rounded-pill border px-3 ${getStatusBadge(admission.status)}`}>
//                         {admission.status}
//                       </span>
//                     </td>
//                     <td className="text-end">
//                       <button
//                         className="btn btn-sm btn-outline-info border-0 me-2"
//                         onClick={() => handleViewDetails(admission.admissionId)}
//                         title="Review Application"
//                       >
//                         <i className="bi bi-eye-fill fs-5"></i>
//                       </button>
//                       <button
//                         className="btn btn-sm btn-outline-danger border-0"
//                         onClick={() => handleDeleteClick(admission.admissionId)}
//                         title="Remove"
//                       >
//                         <i className="bi bi-trash3-fill fs-5"></i>
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center py-5 text-muted">
//                     <i className="bi bi-inbox-fill fs-1 d-block mb-3 opacity-25"></i>
//                     No admission requests at the moment
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Details Modal */}
//       {showModal && selectedAdmission && (
//         <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
//           <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
//             <div className="modal-content glass-modal border-0 shadow-lg">
//               <div className="modal-header border-0 pb-0">
//                 <h5 className="modal-title fw-bold">
//                   <i className="bi bi-clipboard-check-fill text-primary me-2"></i>
//                   Application Review - {selectedAdmission.applicationNumber}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={() => {
//                   setShowModal(false)
//                   setSelectedAdmission(null)
//                 }}></button>
//               </div>
//               <div className="modal-body p-4">
//                 <div className="row g-4">
//                   <div className="col-md-7">
//                     <div className="p-3 bg-light rounded-4 mb-4">
//                       <h6 className="fw-bold text-uppercase small text-muted mb-3">Personal Details</h6>
//                       <div className="row row-cols-2 g-3">
//                         <div><label className="small text-muted d-block">Full Name</label><strong>{selectedAdmission.firstName} {selectedAdmission.lastName}</strong></div>
//                         <div><label className="small text-muted d-block">Gender</label><strong>{selectedAdmission.gender}</strong></div>
//                         <div><label className="small text-muted d-block">Date of Birth</label><strong>{selectedAdmission.dateOfBirth}</strong></div>
//                         <div><label className="small text-muted d-block">Contact</label><strong>{selectedAdmission.phone}</strong></div>
//                         <div className="col-12"><label className="small text-muted d-block">Address</label><strong>{selectedAdmission.address}, {selectedAdmission.city}, {selectedAdmission.state}</strong></div>
//                       </div>
//                     </div>

//                     <div className="p-3 bg-light rounded-4">
//                       <h6 className="fw-bold text-uppercase small text-muted mb-3">Family Information</h6>
//                       <div className="row g-3">
//                         <div className="col-6"><label className="small text-muted d-block">Father</label><strong>{selectedAdmission.fatherName}</strong></div>
//                         <div className="col-6"><label className="small text-muted d-block">Mother</label><strong>{selectedAdmission.motherName}</strong></div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="col-md-5">
//                     <div className="p-3 bg-light rounded-4 mb-4">
//                       <h6 className="fw-bold text-uppercase small text-muted mb-3">Enrollment Info</h6>
//                       <div className="mb-3">
//                         <label className="small text-muted d-block">Applying For</label>
//                         <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6">Class {selectedAdmission.appliedClass}</span>
//                       </div>
//                       <div className="mb-3"><label className="small text-muted d-block">Academic Year</label><strong>{selectedAdmission.academicYear}</strong></div>
//                       <div><label className="small text-muted d-block">Current Status</label><span className={`badge border px-3 ${getStatusBadge(selectedAdmission.status)}`}>{selectedAdmission.status}</span></div>
//                     </div>

//                     <div className="p-3 bg-light rounded-4">
//                       <h6 className="fw-bold text-uppercase small text-muted mb-3">Previous Schooling</h6>
//                       <p className="mb-1"><strong>{selectedAdmission.previousSchool || 'N/A'}</strong></p>
//                       <p className="small text-muted mb-0">Aggregate: {selectedAdmission.previousMarks ? `${selectedAdmission.previousMarks}%` : 'N/A'}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <hr className="my-4 opacity-25" />

//                 <div className="glass-panel p-4 border border-primary-subtle bg-primary-subtle shadow-none">
//                   <h6 className="fw-bold mb-3">Take Action</h6>
//                   <form onSubmit={handleUpdateStatus}>
//                     <div className="row g-3">
//                       <div className="col-md-6">
//                         <label className="form-label small fw-bold">Update Status To</label>
//                         <select
//                           className="form-select border-0 shadow-sm"
//                           value={statusForm.status}
//                           onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
//                           required
//                         >
//                           <option value="Pending">Pending</option>
//                           <option value="Under Review">Under Review</option>
//                           <option value="Approved">Approved</option>
//                           <option value="Rejected">Rejected</option>
//                         </select>
//                       </div>
//                       <div className="col-12">
//                         <label className="form-label small fw-bold">Internal Remarks</label>
//                         <textarea
//                           className="form-control border-0 shadow-sm"
//                           value={statusForm.remarks}
//                           onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
//                           rows="2"
//                           placeholder="Add comments about this application..."
//                         ></textarea>
//                       </div>
//                       <div className="col-12 text-end pt-2">
//                         <div className="form-check form-switch d-inline-block me-3 text-start align-middle">
//                           <input
//                             type="checkbox"
//                             className="form-check-input"
//                             id="createAccount"
//                             checked={statusForm.createStudentAccount}
//                             onChange={(e) => setStatusForm({ ...statusForm, createStudentAccount: e.target.checked })}
//                           />
//                           <label className="form-check-label small fw-medium" htmlFor="createAccount">Auto-provision account</label>
//                         </div>
//                         <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm">Save Changes</button>
//                       </div>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
//           <div className="modal-dialog modal-sm modal-dialog-centered">
//             <div className="modal-content glass-modal border-0 shadow-lg text-center p-4">
//               <div className="modal-body">
//                 <i className="bi bi-trash3-fill text-danger display-4 mb-3 d-block"></i>
//                 <h4 className="fw-bold mb-2">Delete Application?</h4>
//                 <p className="text-muted mb-4">This will permanently remove the record from the admission portal.</p>
//                 <div className="d-flex gap-2">
//                   <button
//                     type="button"
//                     className="btn btn-light flex-grow-1 rounded-pill"
//                     onClick={() => setShowDeleteModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     className="btn btn-danger flex-grow-1 rounded-pill shadow-sm"
//                     onClick={confirmDelete}
//                   >
//                     Yes, Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default AdminManageAdmissions

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const AdminManageAdmissions = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [admissions, setAdmissions] = useState([])
  const [selectedAdmission, setSelectedAdmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: 'Pending',
    remarks: '',
    createStudentAccount: false
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [admissionToDelete, setAdmissionToDelete] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchAdmissions()
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const fetchAdmissions = async () => {
    try {
      const response = await api.get('/admission/all')
      setAdmissions(response.data)
    } catch (error) {
      console.error('Error fetching admissions:', error)
      setMessage({ type: 'danger', text: 'Failed to load admissions' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (admissionId) => {
    try {
      const response = await api.get(`/admission/${admissionId}`)
      const admission = response.data
      
      // Set fullName if not already set
      if (!admission.fullName && admission.firstName && admission.lastName) {
        admission.fullName = `${admission.firstName} ${admission.lastName}`
      }
      
      setSelectedAdmission(admission)
      setStatusForm({
        status: admission.status || 'Pending',
        remarks: admission.remarks || '',
        createStudentAccount: false
      })
      setShowModal(true)
    } catch (error) {
      console.error('Error fetching admission details:', error)
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to load admission details' 
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/admission/${selectedAdmission.admissionId}/status`, statusForm)
      setMessage({ type: 'success', text: 'Admission status updated successfully!' })
      setShowModal(false)
      setSelectedAdmission(null)
      fetchAdmissions()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to update status'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleDeleteClick = (admissionId) => {
    setAdmissionToDelete(admissionId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!admissionToDelete) return

    try {
      await api.delete(`/admission/${admissionToDelete}`)
      setMessage({ type: 'success', text: 'Admission deleted successfully!' })
      setShowDeleteModal(false)
      setAdmissionToDelete(null)
      fetchAdmissions()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to delete admission' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-warning-subtle text-warning border-warning-subtle',
      'Approved': 'bg-success-subtle text-success border-success-subtle',
      'Rejected': 'bg-danger-subtle text-danger border-danger-subtle',
      'Under Review': 'bg-info-subtle text-info border-info-subtle'
    }
    return badges[status] || 'bg-light text-muted border-light'
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
        <button className="btn btn-link text-decoration-none text-muted p-0 hover-glow" onClick={handleBack}>
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold text-dark">
          <i className="bi bi-file-earmark-person-fill text-primary me-3"></i>
          Admission Applications
        </h1>
        <div className="glass-panel px-3 py-2">
          <span className="text-muted small text-uppercase fw-bold me-2">Total Received</span>
          <span className="badge bg-primary rounded-pill fs-6">{admissions.length}</span>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} glass-panel border-0 mb-4 fade show`} role="alert">
          <div className="d-flex align-items-center">
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-3 fs-4`}></i>
            <div>{message.text}</div>
            <button type="button" className="btn-close ms-auto" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        </div>
      )}

      <div className="glass-panel p-4">
        <div className="table-responsive">
          <table className="table modern-table mb-0">
            <thead>
              <tr>
                <th>App. No.</th>
                <th>Applicant Name</th>
                <th>Class</th>
                <th>Application Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.length > 0 ? (
                admissions.map((admission) => (
                  <tr key={admission.admissionId}>
                    <td><span className="fw-bold text-primary">{admission.applicationNumber}</span></td>
                    <td>
                      <div className="fw-medium">
                        {admission.fullName || `${admission.firstName} ${admission.lastName}`}
                      </div>
                      <div className="small text-muted">{admission.email}</div>
                    </td>
                    <td>{admission.appliedClass}</td>
                    <td className="small">{admission.applicationDate}</td>
                    <td>
                      <span className={`badge rounded-pill border px-3 ${getStatusBadge(admission.status)}`}>
                        {admission.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-info border-0 me-2"
                        onClick={() => handleViewDetails(admission.admissionId)}
                        title="Review Application"
                      >
                        <i className="bi bi-eye-fill fs-5"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger border-0"
                        onClick={() => handleDeleteClick(admission.admissionId)}
                        title="Remove"
                      >
                        <i className="bi bi-trash3-fill fs-5"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox-fill fs-1 d-block mb-3 opacity-25"></i>
                    No admission requests at the moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedAdmission && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content glass-modal border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-clipboard-check-fill text-primary me-2"></i>
                  Application Review - {selectedAdmission.applicationNumber}
                </h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowModal(false)
                  setSelectedAdmission(null)
                }}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-7">
                    <div className="p-3 bg-light rounded-4 mb-4">
                      <h6 className="fw-bold text-uppercase small text-muted mb-3">Personal Details</h6>
                      <div className="row row-cols-2 g-3">
                        <div><label className="small text-muted d-block">Full Name</label><strong>{selectedAdmission.firstName} {selectedAdmission.lastName}</strong></div>
                        <div><label className="small text-muted d-block">Gender</label><strong>{selectedAdmission.gender || 'N/A'}</strong></div>
                        <div><label className="small text-muted d-block">Date of Birth</label><strong>{selectedAdmission.dateOfBirth || 'N/A'}</strong></div>
                        <div><label className="small text-muted d-block">Contact</label><strong>{selectedAdmission.phone || 'N/A'}</strong></div>
                        <div className="col-12"><label className="small text-muted d-block">Address</label><strong>{selectedAdmission.address || 'N/A'}, {selectedAdmission.city || ''}, {selectedAdmission.state || ''}</strong></div>
                      </div>
                    </div>

                    <div className="p-3 bg-light rounded-4">
                      <h6 className="fw-bold text-uppercase small text-muted mb-3">Family Information</h6>
                      <div className="row g-3">
                        <div className="col-6"><label className="small text-muted d-block">Father</label><strong>{selectedAdmission.fatherName || 'N/A'}</strong></div>
                        <div className="col-6"><label className="small text-muted d-block">Mother</label><strong>{selectedAdmission.motherName || 'N/A'}</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-5">
                    <div className="p-3 bg-light rounded-4 mb-4">
                      <h6 className="fw-bold text-uppercase small text-muted mb-3">Enrollment Info</h6>
                      <div className="mb-3">
                        <label className="small text-muted d-block">Applying For</label>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6">Class {selectedAdmission.appliedClass}</span>
                      </div>
                      <div className="mb-3"><label className="small text-muted d-block">Academic Year</label><strong>{selectedAdmission.academicYear || 'N/A'}</strong></div>
                      <div><label className="small text-muted d-block">Current Status</label><span className={`badge border px-3 ${getStatusBadge(selectedAdmission.status)}`}>{selectedAdmission.status}</span></div>
                    </div>

                    <div className="p-3 bg-light rounded-4">
                      <h6 className="fw-bold text-uppercase small text-muted mb-3">Previous Schooling</h6>
                      <p className="mb-1"><strong>{selectedAdmission.previousSchool || 'N/A'}</strong></p>
                      <p className="small text-muted mb-0">Aggregate: {selectedAdmission.previousMarks ? `${selectedAdmission.previousMarks}%` : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <hr className="my-4 opacity-25" />

                <div className="glass-panel p-4 border border-primary-subtle bg-primary-subtle shadow-none">
                  <h6 className="fw-bold mb-3">Take Action</h6>
                  <form onSubmit={handleUpdateStatus}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Update Status To</label>
                        <select
                          className="form-select border-0 shadow-sm"
                          value={statusForm.status}
                          onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Internal Remarks</label>
                        <textarea
                          className="form-control border-0 shadow-sm"
                          value={statusForm.remarks}
                          onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                          rows="2"
                          placeholder="Add comments about this application..."
                        ></textarea>
                      </div>
                      <div className="col-12 text-end pt-2">
                        <div className="form-check form-switch d-inline-block me-3 text-start align-middle">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="createAccount"
                            checked={statusForm.createStudentAccount}
                            onChange={(e) => setStatusForm({ ...statusForm, createStudentAccount: e.target.checked })}
                          />
                          <label className="form-check-label small fw-medium" htmlFor="createAccount">Auto-provision account</label>
                        </div>
                        <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm">Save Changes</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content glass-modal border-0 shadow-lg text-center p-4">
              <div className="modal-body">
                <i className="bi bi-trash3-fill text-danger display-4 mb-3 d-block"></i>
                <h4 className="fw-bold mb-2">Delete Application?</h4>
                <p className="text-muted mb-4">This will permanently remove the record from the admission portal.</p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light flex-grow-1 rounded-pill"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger flex-grow-1 rounded-pill shadow-sm"
                    onClick={confirmDelete}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminManageAdmissions