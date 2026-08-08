import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Swal from 'sweetalert2'

const emptyFeeForm = () => ({
  studentId: '',
  feeType: 'Tuition',
  amount: '',
  dueDate: new Date().toISOString().split('T')[0],
  status: 'Pending',
  remarks: ''
})

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(true)
    return
  }

  const existing = document.querySelector('script[data-campuscore-razorpay]')
  if (existing) {
    existing.addEventListener('load', () => resolve(true), { once: true })
    existing.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout')), { once: true })
    return
  }

  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.async = true
  script.dataset.campuscoreRazorpay = 'true'
  script.onload = () => resolve(true)
  script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'))
  document.body.appendChild(script)
})

const FeeManagement = () => {
  const { user } = useAuth()
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [editingFee, setEditingFee] = useState(null)
  const [formData, setFormData] = useState(emptyFeeForm())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [paymentData, setPaymentData] = useState({ paymentMethod: 'Cash', transactionId: '' })
  const [onlinePaymentFeeId, setOnlinePaymentFeeId] = useState(null)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const notify = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (user.role === 'Admin') {
        const [feesRes, studentsRes] = await Promise.all([
          api.get('/studentmanagement/fee/all'),
          api.get('/user/students')
        ])
        setFees(Array.isArray(feesRes.data) ? feesRes.data : [])
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : [])
      } else if (user.role === 'Student') {
        const res = await api.get(`/studentmanagement/fee/student/${user.studentId}`)
        setFees(Array.isArray(res.data) ? res.data : [])
      } else if (user.role === 'Parent') {
        const childrenRes = await api.get(`/parent/${user.userId}/children`)
        const children = Array.isArray(childrenRes.data) ? childrenRes.data : []
        const feeResults = await Promise.allSettled(
          children.map((child) => api.get(`/studentmanagement/fee/student/${child.studentId}`))
        )
        const rows = []
        feeResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const child = children[index]
            const childFees = Array.isArray(result.value.data) ? result.value.data : []
            childFees.forEach((fee) => rows.push({ ...fee, studentName: fee.studentName || child.studentName }))
          }
        })
        setFees(rows)
      }
    } catch (error) {
      console.error('Error fetching fees:', error)
      notify('danger', error.response?.data?.message || 'Failed to load fee records')
    } finally {
      setLoading(false)
    }
  }

  const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0)
  const paidFees = fees.filter((fee) => fee.status === 'Paid').reduce((sum, fee) => sum + Number(fee.amount || 0), 0)
  const pendingFees = fees.filter((fee) => fee.status !== 'Paid').reduce((sum, fee) => sum + Number(fee.amount || 0), 0)

  const openCreateModal = () => {
    setEditingFee(null)
    setFormData(emptyFeeForm())
    setShowFeeModal(true)
  }

  const openEditModal = (fee) => {
    setEditingFee(fee)
    setFormData({
      studentId: fee.studentId || '',
      feeType: fee.feeType || 'Tuition',
      amount: fee.amount || '',
      dueDate: fee.dueDate || new Date().toISOString().split('T')[0],
      status: fee.status === 'Overdue' ? 'Overdue' : 'Pending',
      remarks: fee.remarks || ''
    })
    setShowFeeModal(true)
  }

  const handleFeeSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFee) {
        await api.put(`/studentmanagement/fee/${editingFee.feeId}`, formData)
        notify('success', 'Fee updated successfully')
      } else {
        await api.post('/studentmanagement/fee', formData)
        notify('success', 'Fee assigned successfully')
      }
      setShowFeeModal(false)
      setEditingFee(null)
      await fetchData()
    } catch (error) {
      notify('danger', error.response?.data?.message || 'Unable to save fee')
    }
  }

  const handleDelete = async (feeId) => {
    const fee = fees.find((item) => item.feeId === feeId)

    const result = await Swal.fire({
      title: 'Delete fee record?',
      html: fee
        ? `<div style="color:#64748b;font-size:0.95rem;line-height:1.6">This will permanently delete <strong>${fee.feeType || 'this fee'}</strong>${fee.studentName ? ` for <strong>${fee.studentName}</strong>` : ''}.<br/>This action cannot be undone.</div>`
        : 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-trash3 me-1"></i> Delete fee',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'campus-swal-popup',
        confirmButton: 'campus-swal-delete',
        cancelButton: 'campus-swal-cancel'
      },
      buttonsStyling: false
    })

    if (!result.isConfirmed) return

    try {
      await api.delete(`/studentmanagement/fee/${feeId}`)
      await Swal.fire({
        title: 'Fee deleted',
        text: 'The fee record was removed successfully.',
        icon: 'success',
        timer: 1600,
        showConfirmButton: false,
        customClass: { popup: 'campus-swal-popup' }
      })
      await fetchData()
    } catch (error) {
      Swal.fire({
        title: 'Unable to delete fee',
        text: error.response?.data?.message || 'Failed to delete fee',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'campus-swal-popup',
          confirmButton: 'campus-swal-primary'
        },
        buttonsStyling: false
      })
    }
  }

  const openPaymentModal = (fee) => {
    setSelectedFee(fee)
    setPaymentData({ paymentMethod: 'Cash', transactionId: '' })
    setShowPaymentModal(true)
  }

  const recordOfflinePayment = async (e) => {
    e.preventDefault()
    if (!selectedFee) return
    try {
      await api.put(`/studentmanagement/fee/pay/${selectedFee.feeId}`, paymentData)
      notify('success', 'Offline payment recorded and receipt generated')
      setShowPaymentModal(false)
      setSelectedFee(null)
      await fetchData()
    } catch (error) {
      notify('danger', error.response?.data?.message || 'Failed to record payment')
    }
  }

  const handleSendReminder = async (feeId) => {
    try {
      await api.post(`/studentmanagement/fee/remind/${feeId}`)
      notify('success', 'Reminder email sent')
    } catch (error) {
      notify('danger', error.response?.data?.message || 'Failed to send reminder')
    }
  }

  const handleSendAllReminders = async () => {
    try {
      const response = await api.post('/studentmanagement/fee/remind-overdue')
      notify('success', `Sent ${response.data.count || 0} reminder email(s)`)
    } catch (error) {
      notify('danger', error.response?.data?.message || 'Failed to send reminders')
    }
  }

  const handleDownloadReceipt = async (feeId) => {
    try {
      const response = await api.get(`/studentmanagement/fee/receipt/${feeId}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `fee-receipt-${feeId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      notify('danger', 'Failed to download receipt')
    }
  }

  const handleOnlinePayment = async (fee) => {
    if (!fee || fee.status === 'Paid' || !['Student', 'Parent'].includes(user?.role)) return

    setOnlinePaymentFeeId(fee.feeId)

    try {
      await loadRazorpayCheckout()

      const orderResponse = await api.post(`/studentmanagement/fee/online/order/${fee.feeId}`)
      const order = orderResponse.data || {}

      if (!window.Razorpay || !order.keyId || !order.orderId || !order.amount) {
        throw new Error('Invalid Razorpay order response')
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'CampusCore',
        description: `${fee.feeType || 'School'} Fee`,
        order_id: order.orderId,
        prefill: {
          name: user?.displayName || user?.username || '',
          email: user?.email || ''
        },
        notes: {
          feeId: String(fee.feeId),
          studentId: String(fee.studentId || '')
        },
        theme: { color: '#1f4f8a' },
        modal: {
          ondismiss: () => setOnlinePaymentFeeId(null)
        },
        handler: async (response) => {
          try {
            await api.post(`/studentmanagement/fee/online/verify/${fee.feeId}`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            })

            await Swal.fire({
              title: 'Payment successful',
              text: 'Your Razorpay Test Mode payment was verified and the receipt is ready.',
              icon: 'success',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'campus-swal-popup',
                confirmButton: 'campus-swal-primary'
              },
              buttonsStyling: false
            })

            await fetchData()
          } catch (error) {
            await Swal.fire({
              title: 'Payment verification failed',
              text: error.response?.data?.message || 'Razorpay returned a payment, but CampusCore could not verify it.',
              icon: 'error',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'campus-swal-popup',
                confirmButton: 'campus-swal-primary'
              },
              buttonsStyling: false
            })
          } finally {
            setOnlinePaymentFeeId(null)
          }
        }
      }

      const checkout = new window.Razorpay(options)
      checkout.on('payment.failed', (response) => {
        setOnlinePaymentFeeId(null)
        Swal.fire({
          title: 'Payment failed',
          text: response?.error?.description || 'The Razorpay Test Mode payment was not completed.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'campus-swal-popup',
            confirmButton: 'campus-swal-primary'
          },
          buttonsStyling: false
        })
      })
      checkout.open()
    } catch (error) {
      setOnlinePaymentFeeId(null)
      Swal.fire({
        title: 'Unable to start online payment',
        text: error.response?.data?.message || error.message || 'Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'campus-swal-popup',
          confirmButton: 'campus-swal-primary'
        },
        buttonsStyling: false
      })
    }
  }

  if (loading) {
    return <div className="container py-5 text-center"><div className="spinner-border" role="status"></div></div>
  }

  const title = user?.role === 'Admin' ? 'Fee Management' : user?.role === 'Parent' ? 'Child Fees' : 'My Fees'
  const paidRows = fees.filter((fee) => fee.status === 'Paid')

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="mb-1"><i className="bi bi-cash-coin text-warning me-2"></i>{title}</h1>
          {user?.role !== 'Admin' && (
            <p className="text-muted mb-0">Pay securely through Razorpay Test Mode, or view payments recorded offline by the school. No real money is charged in Test Mode.</p>
          )}
        </div>
        {user?.role === 'Admin' && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={handleSendAllReminders}><i className="bi bi-envelope-paper me-2"></i>Remind All Due</button>
            <button className="btn btn-warning" onClick={openCreateModal}><i className="bi bi-plus-circle-fill me-2"></i>Assign Fee</button>
          </div>
        )}
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {user?.role !== 'Admin' && (
        <div className="alert alert-primary d-flex align-items-start gap-2" role="alert">
          <i className="bi bi-shield-check fs-5"></i>
          <div>
            <strong>Razorpay Test Mode:</strong> online checkout is for project testing only. No real money is charged.
            Offline payments can still be recorded by the school Admin.
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="card bg-primary text-white"><div className="card-body text-center"><h6>Total Assigned</h6><h3>₹{totalFees.toFixed(2)}</h3></div></div></div>
        <div className="col-md-4"><div className="card bg-success text-white"><div className="card-body text-center"><h6>Paid</h6><h3>₹{paidFees.toFixed(2)}</h3></div></div></div>
        <div className="col-md-4"><div className="card bg-danger text-white"><div className="card-body text-center"><h6>Due</h6><h3>₹{pendingFees.toFixed(2)}</h3></div></div></div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-warning text-dark"><h5 className="mb-0"><i className="bi bi-list-ul me-2"></i>Fee Records</h5></div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  {(user?.role === 'Admin' || user?.role === 'Parent') && <th>Student</th>}
                  <th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th><th>Payment Method</th><th>Receipt No</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr><td colSpan={user?.role === 'Student' ? 8 : 9} className="text-center text-muted py-4">No fee records found</td></tr>
                ) : fees.map((fee) => (
                  <tr key={`${fee.studentId || 'student'}-${fee.feeId}`}>
                    {(user?.role === 'Admin' || user?.role === 'Parent') && <td>{fee.studentName || '-'}</td>}
                    <td>{fee.feeType}</td>
                    <td>₹{Number(fee.amount || 0).toFixed(2)}</td>
                    <td>{fee.dueDate || '-'}</td>
                    <td>{fee.paidDate || '-'}</td>
                    <td><span className={`badge ${fee.status === 'Paid' ? 'bg-success' : fee.status === 'Overdue' ? 'bg-danger' : 'bg-warning text-dark'}`}>{fee.status}</span></td>
                    <td>{fee.paymentMethod || '-'}</td>
                    <td>{fee.receiptNumber || '-'}</td>
                    <td>
                      {user?.role === 'Admin' && fee.status !== 'Paid' && (
                        <>
                          <button className="btn btn-sm btn-success me-2" onClick={() => openPaymentModal(fee)} title="Record Offline Payment"><i className="bi bi-cash-stack"></i></button>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => openEditModal(fee)} title="Edit"><i className="bi bi-pencil-fill"></i></button>
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleSendReminder(fee.feeId)} title="Send Reminder"><i className="bi bi-envelope"></i></button>
                        </>
                      )}
                      {user?.role === 'Admin' && <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(fee.feeId)} title="Delete"><i className="bi bi-trash-fill"></i></button>}
                      {fee.status === 'Paid' && fee.receiptNumber && (
                        <button className="btn btn-sm btn-info" onClick={() => handleDownloadReceipt(fee.feeId)}><i className="bi bi-download me-1"></i>Receipt</button>
                      )}
                      {user?.role !== 'Admin' && fee.status !== 'Paid' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleOnlinePayment(fee)}
                          disabled={onlinePaymentFeeId === fee.feeId}
                        >
                          {onlinePaymentFeeId === fee.feeId ? (
                            <><span className="spinner-border spinner-border-sm me-1"></span>Starting...</>
                          ) : (
                            <><i className="bi bi-credit-card me-1"></i>Pay Online</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {user?.role !== 'Admin' && (
        <div className="card shadow-sm mt-4">
          <div className="card-header bg-info text-white"><h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Payment History</h5></div>
          <div className="card-body">
            {paidRows.length === 0 ? <p className="text-muted text-center mb-0">No payment history available</p> : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead><tr>{user?.role === 'Parent' && <th>Student</th>}<th>Paid Date</th><th>Fee Type</th><th>Amount</th><th>Method</th><th>Receipt</th></tr></thead>
                  <tbody>{paidRows.map((fee) => (
                    <tr key={`history-${fee.feeId}`}>
                      {user?.role === 'Parent' && <td>{fee.studentName || '-'}</td>}
                      <td>{fee.paidDate || '-'}</td><td>{fee.feeType}</td><td>₹{Number(fee.amount || 0).toFixed(2)}</td><td>{fee.paymentMethod || '-'}</td>
                      <td><button className="btn btn-sm btn-info" onClick={() => handleDownloadReceipt(fee.feeId)}><i className="bi bi-download me-1"></i>Download</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showFeeModal && user?.role === 'Admin' && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
            <div className="modal-header bg-warning"><h5 className="modal-title">{editingFee ? 'Edit Fee' : 'Assign New Fee'}</h5><button className="btn-close" type="button" onClick={() => setShowFeeModal(false)}></button></div>
            <form onSubmit={handleFeeSubmit}>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label">Student *</label><select className="form-select" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} required disabled={Boolean(editingFee)}><option value="">Select Student</option>{students.map((student) => <option key={student.studentId} value={student.studentId}>{student.fullName || student.username} - {student.rollNo} ({student.className})</option>)}</select></div>
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="form-label">Fee Type *</label><select className="form-select" value={formData.feeType} onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}><option>Tuition</option><option>Exam</option><option>Library</option><option>Laboratory</option><option>Sports</option><option>Transport</option><option>Other</option></select></div>
                  <div className="col-md-6 mb-3"><label className="form-label">Amount *</label><input type="number" min="0.01" step="0.01" className="form-control" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="form-label">Due Date *</label><input type="date" className="form-control" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required /></div>
                  <div className="col-md-6 mb-3"><label className="form-label">Status</label><select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="Pending">Pending</option><option value="Overdue">Overdue</option></select><small className="text-muted">Use Record Payment to mark a fee as Paid.</small></div>
                </div>
                <div className="mb-3"><label className="form-label">Remarks</label><textarea className="form-control" rows="3" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}></textarea></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowFeeModal(false)}>Cancel</button><button className="btn btn-warning" type="submit">{editingFee ? 'Update Fee' : 'Assign Fee'}</button></div>
            </form>
          </div></div>
        </div>
      )}

      {showPaymentModal && user?.role === 'Admin' && selectedFee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2100 }}>
          <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
            <div className="modal-header bg-success text-white"><h5 className="modal-title"><i className="bi bi-cash-stack me-2"></i>Record Offline Payment</h5><button className="btn-close btn-close-white" type="button" onClick={() => setShowPaymentModal(false)}></button></div>
            <form onSubmit={recordOfflinePayment}>
              <div className="modal-body">
                <p><strong>{selectedFee.studentName}</strong> — {selectedFee.feeType} — ₹{Number(selectedFee.amount || 0).toFixed(2)}</p>
                <div className="mb-3"><label className="form-label">Payment Method *</label><select className="form-select" value={paymentData.paymentMethod} onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })} required><option value="Cash">Cash</option><option value="Cheque">Cheque</option><option value="Bank Transfer">Bank Transfer</option><option value="Other">Other</option></select></div>
                <div className="mb-3"><label className="form-label">Reference / Transaction ID</label><input className="form-control" value={paymentData.transactionId} onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })} placeholder="Cheque no., bank reference, etc." /></div>
                <div className="alert alert-info mb-0">This records a payment already received outside CampusCore. It does not process online money.</div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button><button className="btn btn-success" type="submit">Confirm Payment</button></div>
            </form>
          </div></div>
        </div>
      )}
    </div>
  )
}

export default FeeManagement
