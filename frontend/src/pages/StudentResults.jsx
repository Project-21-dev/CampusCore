import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const StudentResults = () => {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [stats, setStats] = useState({
    totalSubjects: 0,
    averageMarks: 0,
    highestMarks: 0,
    lowestMarks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.studentId) {
      fetchResults()
    }
  }, [user])

  const handleDownloadReportCard = async (studentId) => {
    if (!studentId) return
    try {
      const response = await api.get(`/result/report-card/${studentId}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-card-${studentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report card:', error)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await api.get(`/result/student/${user.studentId}`)
      const resultsData = Array.isArray(response.data) ? response.data : []
      setResults(resultsData)

      if (resultsData.length > 0) {
        const marks = resultsData.map(r => parseFloat(r.marks) || 0)
        const total = marks.reduce((sum, m) => sum + m, 0)
        setStats({
          totalSubjects: resultsData.length,
          averageMarks: (total / resultsData.length).toFixed(1),
          highestMarks: Math.max(...marks),
          lowestMarks: Math.min(...marks)
        })
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getGrade = (marks) => {
    const m = parseFloat(marks) || 0
    if (m >= 90) return { grade: 'A+', color: 'bg-success', remark: 'Outstanding' }
    if (m >= 80) return { grade: 'A', color: 'bg-success', remark: 'Excellent' }
    if (m >= 70) return { grade: 'B', color: 'bg-info', remark: 'Very Good' }
    if (m >= 60) return { grade: 'C', color: 'bg-primary', remark: 'Good' }
    if (m >= 50) return { grade: 'D', color: 'bg-warning', remark: 'Average' }
    return { grade: 'F', color: 'bg-danger', remark: 'Needs Improvement' }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-3">Loading results...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/student/dashboard" className="btn btn-outline-secondary me-3">
            <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
          </Link>
        </div>
        <h1 className="mb-0">
          <i className="bi bi-graph-up text-success me-2"></i>
          My Results
        </h1>
        <span className="badge bg-success fs-6">
          {user?.displayName || user?.username}
        </span>
        <button
          className="btn btn-outline-primary ms-3"
          onClick={() => handleDownloadReportCard(user?.studentId)}
        >
          <i className="bi bi-file-earmark-pdf me-2"></i>Report Card
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card bg-primary text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-book" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Total Subjects</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.totalSubjects}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-bar-chart" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Average Marks</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.averageMarks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-arrow-up-circle" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Highest Marks</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.highestMarks}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white shadow">
            <div className="card-body text-center">
              <i className="bi bi-arrow-down-circle" style={{ fontSize: '48px', opacity: 0.7 }}></i>
              <h4 className="mt-3">Lowest Marks</h4>
              <h2 className="display-4 fw-bold mb-0">{stats.lowestMarks}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Performance */}
      {results.length > 0 && (
        <div className="card shadow mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="bi bi-trophy me-2"></i>Overall Performance
            </h5>
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="text-center">
                  <div 
                    className={`rounded-circle d-inline-flex align-items-center justify-content-center ${getGrade(stats.averageMarks).color}`}
                    style={{ width: '150px', height: '150px' }}
                  >
                    <div className="text-white">
                      <h1 className="display-4 fw-bold mb-0">{getGrade(stats.averageMarks).grade}</h1>
                      <small>Grade</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <h4 className="mb-3">Performance Summary</h4>
                <div className="progress mb-3" style={{ height: '25px' }}>
                  <div 
                    className={`progress-bar ${getGrade(stats.averageMarks).color}`}
                    role="progressbar" 
                    style={{ width: `${stats.averageMarks}%` }}
                  >
                    {stats.averageMarks}%
                  </div>
                </div>
                <p className="mb-2">
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${getGrade(stats.averageMarks).color}`}>
                    {getGrade(stats.averageMarks).remark}
                  </span>
                </p>
                <p className="text-muted mb-0">
                  {stats.averageMarks >= 60 
                    ? "Great job! Keep up the good work!" 
                    : "Keep working hard to improve your grades!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>Detailed Results
          </h5>
          <span className="badge bg-light text-primary">{results.length} Subjects</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: '60px' }}>#</th>
                  <th>Subject</th>
                  <th className="text-center">Marks</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">Remark</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((result, index) => {
                    const gradeInfo = getGrade(result.marks)
                    return (
                      <tr key={result.resultId}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <i className="bi bi-journal-bookmark me-2 text-muted"></i>
                          <strong>{result.subject}</strong>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info px-3 py-2 fs-6">{result.marks}</span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${gradeInfo.color} px-3 py-2`}>
                            {gradeInfo.grade}
                          </span>
                        </td>
                        <td className="text-center">
                          <small className="text-muted">{gradeInfo.remark}</small>
                        </td>
                        <td>
                          <i className="bi bi-calendar3 me-2 text-muted"></i>
                          {result.date}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <i className="bi bi-inbox text-muted" style={{ fontSize: '64px' }}></i>
                      <p className="text-muted mt-3 mb-0">No results available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentResults
