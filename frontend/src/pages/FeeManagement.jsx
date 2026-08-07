import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const FeeManagement = () => {
  const { user } = useAuth()
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFee, setEditingFee] = useState(null)
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: 'Tuition',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    paidDate: '',
    status: 'Pending',
    paymentMethod: '',
    transactionId: '',
    remarks: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const canViewAll = user?.role === 'Admin' || user?.role === 'Teacher'
      const endpoint = canViewAll ? '/studentmanagement/fee/all' : `/studentmanagement/fee/student/${user?.studentId}`
      const [feesRes, studentsRes] = await Promise.all([
        api.get(endpoint),
        canViewAll ? api.get('/user/students') : Promise.resolve({ data: [] })
      ])
      setFees(feesRes.data)
      setStudents(studentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'danger', text: 'Failed to load data' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFee) {
        await api.put(`/studentmanagement/fee/${editingFee.feeId}`, formData)
        setMessage({ type: 'success', text: 'Fee updated successfully!' })
      } else {
        await api.post('/studentmanagement/fee', formData)
        setMessage({ type: 'success', text: 'Fee created successfully!' })
      }
      setShowModal(false)
      resetForm()
      fetchData()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Operation failed'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleEdit = (fee) => {
    setFormData({
      studentId: fee.studentId || '',
      feeType: fee.feeType,
      amount: fee.amount,
      dueDate: fee.dueDate,
      paidDate: fee.paidDate || '',
      status: fee.status,
      paymentMethod: fee.paymentMethod || '',
      transactionId: fee.transactionId || '',
      remarks: fee.remarks || ''
    })
    setEditingFee(fee)
    setShowModal(true)
  }

  const handleDelete = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return

    try {
      await api.delete(`/studentmanagement/fee/${feeId}`)
      setMessage({ type: 'success', text: 'Fee deleted successfully!' })
      fetchData()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to delete fee' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      feeType: 'Tuition',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: '',
      status: 'Pending',
      paymentMethod: '',
      transactionId: '',
      remarks: ''
    })
    setEditingFee(null)
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0)
  const paidFees = fees.filter(f => f.status === 'Paid').reduce((sum, fee) => sum + (fee.amount || 0), 0)
  const pendingFees = totalFees - paidFees

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false)
  const [payFeeId, setPayFeeId] = useState(null)
  const [paymentData, setPaymentData] = useState({
    paymentMethod: '',
    transactionId: ''
  })

  const openPayModal = (feeId) => {
    setPayFeeId(feeId)
    setShowPayModal(true)
  }

  const closePayModal = () => {
    setShowPayModal(false)
    setPayFeeId(null)
    setPaymentData({ paymentMethod: '', transactionId: '' })
  }

  const handlePaymentChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value })
  }

  const handlePayFee = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/studentmanagement/fee/pay/${payFeeId}`, paymentData)
      setMessage({ type: 'success', text: 'Fee paid successfully!' })
      closePayModal()
      fetchData()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Payment failed. Please try again.' })
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (existing) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayCheckout = async (fee) => {
    const ok = await loadRazorpayScript()
    if (!ok) {
      setMessage({ type: 'danger', text: 'Unable to load payment gateway. Try again later.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return
    }

    const options = {
      key: 'rzp_test_RwGSKuvstSm5HH',
      amount: Math.round((fee.amount || 0) * 100),
      currency: 'INR',
      name: 'School Sync',
      description: `Fee: ${fee.feeType}`,
      handler: async function (response) {
        try {
          await api.put(`/studentmanagement/fee/pay/${fee.feeId}`, {
            paymentMethod: 'Razorpay',
            transactionId: response.razorpay_payment_id
          })
          setMessage({ type: 'success', text: 'Payment successful!' })
          fetchData()
          setTimeout(() => setMessage({ type: '', text: '' }), 5000)
        } catch (err) {
          console.error('Error updating payment record:', err)
          setMessage({ type: 'danger', text: 'Payment succeeded but updating record failed.' })
        }
      },
      prefill: {
        name: user?.username || '',
        email: user?.email || ''
      },
      theme: {
        color: '#F37254'
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    rzp.on('payment.failed', function (response) {
      setMessage({ type: 'danger', text: 'Payment failed. Please try again.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    })
  }

  const handleSendReminder = async (feeId) => {
    try {
      await api.post(`/studentmanagement/fee/remind/${feeId}`)
      setMessage({ type: 'success', text: 'Reminder email sent!' })
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to send reminder' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleSendAllReminders = async () => {
    try {
      const response = await api.post('/studentmanagement/fee/remind-overdue');
      setMessage({ type: 'success', text: `Sent ${response.data.count} reminder emails!` });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to send reminders' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleDownloadReceipt = async (feeId) => {
    try {
      const response = await api.get(
        `/studentmanagement/fee/receipt/${feeId}`,
        {
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-receipt-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: 'Receipt downloaded successfully!'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setMessage({
        type: 'danger',
        text: 'Failed to download receipt'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    )
  }


  return (
    <>
      {showPayModal && user?.role === 'Student' && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-credit-card me-2"></i>Pay Fee
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closePayModal}></button>
              </div>
              <form onSubmit={handlePayFee}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Payment Method *</label>
                    <select className="form-select" name="paymentMethod" value={paymentData.paymentMethod} onChange={handlePaymentChange} required>
                      <option value="">Select</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>
                  {/* <div className="mb-3">
                    <label className="form-label">Transaction ID *</label>
                    <input type="text" className="form-control" name="transactionId" value={paymentData.transactionId} onChange={handlePaymentChange} required />
                  </div> */}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closePayModal}>Cancel</button>
                  <button type="submit" className="btn btn-success">Pay</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <i className="bi bi-cash-coin text-warning me-2"></i>
            Fee Management
          </h1>
          {user?.role === 'Admin' && (
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={handleSendAllReminders}>
                <i className="bi bi-envelope-paper me-2"></i>Remind All Overdue
              </button>
              <button className="btn btn-warning" onClick={openModal}>
                <i className="bi bi-plus-circle-fill me-2"></i>Add Fee
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {user?.role === 'Admin' && (
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h6>Total Fees</h6>
                  <h3>₹{totalFees.toFixed(2)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h6>Paid Fees</h6>
                  <h3>₹{paidFees.toFixed(2)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <h6>Pending Fees</h6>
                  <h3>₹{pendingFees.toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-header bg-warning text-white">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>Fee Records
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    {user?.role === 'Admin' && <th>Student</th>}
                    <th>Fee Type</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Paid Date</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Receipt No</th>
                    {user?.role === 'Admin' && <th>Actions</th>}
                    {user?.role === 'Student' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {fees.length > 0 ? (
                    fees.map((fee) => (
                      <tr key={fee.feeId}>
                        {user?.role === 'Admin' && <td>{fee.studentName || '-'}</td>}
                        <td>{fee.feeType}</td>
                        <td>₹{fee.amount}</td>
                        <td>{fee.dueDate}</td>
                        <td>{fee.paidDate || '-'}</td>
                        <td>
                          <span className={`badge ${fee.status === 'Paid' ? 'bg-success' :
                            fee.status === 'Overdue' ? 'bg-danger' :
                              'bg-warning'
                            }`}>
                            {fee.status}
                          </span>
                        </td>
                        <td>{fee.paymentMethod || '-'}</td>
                        <td>{fee.receiptNumber || '-'}</td>
                        {user?.role === 'Admin' && (
                          <td>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEdit(fee)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger me-2"
                              onClick={() => handleDelete(fee.feeId)}
                              title="Delete"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                            {fee.status === 'Paid' && fee.receiptNumber && (
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleDownloadReceipt(fee.feeId)}
                                title="Download Receipt"
                              >
                                <i className="bi bi-download"></i>
                              </button>
                            )}
                            {fee.status !== 'Paid' && (
                              <button
                                className="btn btn-sm btn-outline-secondary ms-2"
                                onClick={() => handleSendReminder(fee.feeId)}
                                title="Send Email Reminder"
                              >
                                <i className="bi bi-envelope"></i>
                              </button>
                            )}
                          </td>
                        )}
                        {user?.role === 'Student' && (
                          <td>
                            {fee.status === 'Pending' && (
                              <button className="btn btn-sm btn-success" onClick={() => handleRazorpayCheckout(fee)}>
                                <i className="bi bi-credit-card"></i> Pay
                              </button>
                            )}
                            {fee.status === 'Paid' && fee.receiptNumber && (
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleDownloadReceipt(fee.feeId)}
                                title="Download Receipt"
                              >
                                <i className="bi bi-download"></i> Receipt
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={user?.role === 'Admin' ? 9 : 8} className="text-center text-muted">No fee records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment History Section - Only for Students */}
        {user?.role === 'Student' && (
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>Payment History
              </h5>
            </div>
            <div className="card-body">
              {fees.filter(f => f.status === 'Paid').length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Fee Type</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Receipt No</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.filter(f => f.status === 'Paid').map((payment) => (
                        <tr key={payment.feeId}>
                          <td>{payment.paidDate}</td>
                          <td>{payment.feeType}</td>
                          <td>₹{payment.amount}</td>
                          <td>{payment.paymentMethod || '-'}</td>
                          <td>
                            <span className="badge bg-success">{payment.receiptNumber || '-'}</span>
                          </td>
                          <td>
                            {payment.receiptNumber && (
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleDownloadReceipt(payment.feeId)}
                                title="Download Receipt"
                              >
                                <i className="bi bi-download"></i> Download
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No payment history available</p>
              )}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && user?.role === 'Admin' && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-warning text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-cash-coin me-2"></i>
                    {editingFee ? 'Edit Fee' : 'Add New Fee'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Student *</label>
                      <select
                        className="form-select"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        required
                      >
                        <option value="">Select Student</option>
                        {students.map((student) => (
                          <option key={student.studentId} value={student.studentId}>
                            {student.username} - {student.rollNo} ({student.className})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fee Type *</label>
                        <select
                          className="form-select"
                          value={formData.feeType}
                          onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                          required
                        >
                          <option value="Tuition">Tuition</option>
                          <option value="Library">Library</option>
                          <option value="Sports">Sports</option>
                          <option value="Laboratory">Laboratory</option>
                          <option value="Transport">Transport</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Amount *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Due Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Paid Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.paidDate}
                          onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Status *</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Payment Method</label>
                        <select
                          className="form-select"
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        >
                          <option value="">Select Method</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Online Payment">Online Payment</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Transaction ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-warning">
                      {editingFee ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )


}

export default FeeManagement
