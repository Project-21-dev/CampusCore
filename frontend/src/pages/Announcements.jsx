import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Announcements = () => {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'All',
    targetClassName: '',
    priority: 'Normal'
  })
  const [posting, setPosting] = useState(false)

  const canPost = user?.role === 'Admin' || user?.role === 'Teacher'

  useEffect(() => {
    fetchFeed()
  }, [user])

  const fetchFeed = async () => {
    try {
      const role = user?.role || 'All'
      const className = user?.className || undefined
      const response = await api.get('/announcements/feed', { params: { role, className } })
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    setPosting(true)
    try {
      await api.post('/announcements', { ...form, createdBy: user?.username || 'Admin' })
      setMessage({ type: 'success', text: 'Announcement posted!' })
      setForm({ title: '', message: '', targetRole: 'All', targetClassName: '', priority: 'Normal' })
      fetchFeed()
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to post announcement' })
    } finally {
      setPosting(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await api.delete(`/announcements/${id}`)
      fetchFeed()
    } catch (error) {
      console.error('Error deleting announcement:', error)
    }
  }

  const priorityBadge = (priority) => {
    if (priority === 'Urgent') return 'bg-danger'
    if (priority === 'Important') return 'bg-warning text-dark'
    return 'bg-secondary'
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">
        <i className="bi bi-megaphone-fill text-primary me-2"></i>
        Announcements
      </h1>

      {message.text && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {canPost && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0"><i className="bi bi-plus-circle me-2"></i>Post New Announcement</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handlePost}>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Audience</label>
                  <select
                    className="form-select"
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  >
                    <option value="All">Everyone</option>
                    <option value="Student">Students</option>
                    <option value="Teacher">Teachers</option>
                    <option value="Parent">Parents</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Class (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 10-A (leave blank for all classes)"
                    value={form.targetClassName}
                    onChange={(e) => setForm({ ...form, targetClassName: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-primary mt-3" type="submit" disabled={posting}>
                {posting ? 'Posting...' : 'Post Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="alert alert-info">No announcements yet.</div>
      ) : (
        announcements.map((a) => (
          <div className="card shadow-sm mb-3" key={a.announcementId}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="card-title">
                  {a.title}{' '}
                  <span className={`badge ${priorityBadge(a.priority)} ms-2`}>{a.priority}</span>
                </h5>
                {user?.role === 'Admin' && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(a.announcementId)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
              <p className="card-text">{a.message}</p>
              <p className="card-text">
                <small className="text-muted">
                  By {a.createdBy} · {new Date(a.createdAt).toLocaleString()}
                  {a.targetClassName ? ` · Class ${a.targetClassName}` : ''} · For {a.targetRole}
                </small>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Announcements
