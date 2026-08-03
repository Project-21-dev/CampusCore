import React, { useState, useEffect } from 'react'
import api from '../services/api'

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/audit/all')
      setLogs(response.data)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = filter
    ? logs.filter((l) => l.entityName.toLowerCase() === filter.toLowerCase())
    : logs

  const entities = [...new Set(logs.map((l) => l.entityName))]

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-clock-history text-primary me-2"></i>
          Audit Log
        </h1>
        <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All entities</option>
          {entities.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="alert alert-info">No audit log entries yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Entity</th>
                <th>ID</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.auditLogId}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td><span className="badge bg-secondary">{log.entityName}</span></td>
                  <td>{log.entityId ?? '-'}</td>
                  <td>{log.action}</td>
                  <td>{log.performedBy}</td>
                  <td className="text-muted small">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AuditLogViewer
