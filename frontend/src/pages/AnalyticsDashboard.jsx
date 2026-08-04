import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#20c997']

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null)
  const [attendanceByClass, setAttendanceByClass] = useState([])
  const [resultByClass, setResultByClass] = useState([])
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const [feeSummary, setFeeSummary] = useState([])
  const [admissionFunnel, setAdmissionFunnel] = useState([])
  const [atRiskStudents, setAtRiskStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAiStudent, setSelectedAiStudent] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [
        overviewRes,
        attendanceClassRes,
        resultClassRes,
        trendRes,
        feeRes,
        admissionRes,
        atRiskRes
      ] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/attendance-by-class'),
        api.get('/analytics/result-performance'),
        api.get('/analytics/attendance-trend?days=14'),
        api.get('/analytics/fee-summary'),
        api.get('/analytics/admission-funnel'),
        api.get('/analytics/at-risk-students')
      ])

      setOverview(overviewRes.data)
      setAttendanceByClass(attendanceClassRes.data)
      setResultByClass(resultClassRes.data)
      setAttendanceTrend(trendRes.data)
      setFeeSummary(feeRes.data)
      setAdmissionFunnel(admissionRes.data)
      setAtRiskStudents(atRiskRes.data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Merge attendance % and result % by class into one dataset for the comparison chart
  const buildComparisonData = () => {
    const classMap = {}

    attendanceByClass.forEach((item) => {
      classMap[item.className] = {
        className: item.className,
        attendancePercentage: item.attendancePercentage,
        resultPercentage: 0
      }
    })

    resultByClass.forEach((item) => {
      if (!classMap[item.className]) {
        classMap[item.className] = {
          className: item.className,
          attendancePercentage: 0,
          resultPercentage: item.averagePercentage
        }
      } else {
        classMap[item.className].resultPercentage = item.averagePercentage
      }
    })

    return Object.values(classMap).sort((a, b) => a.className.localeCompare(b.className))
  }

  // Triggers a browser download for a CSV export endpoint
  const downloadCsv = async (path, filename) => {
    try {
      const response = await api.get(path, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Failed to export CSV:', err)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  const comparisonData = buildComparisonData()

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-bar-chart-fill text-primary me-2"></i>
          Analytics Dashboard
        </h1>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success"
            onClick={() => downloadCsv('/analytics/export/overview.csv', 'overview-stats.csv')}
          >
            <i className="bi bi-download me-1"></i>Export Overview
          </button>
          <Link to="/admin/dashboard" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      {overview && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Total Students</h6>
                <h2 className="mb-0">{overview.totalStudents}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Today's Attendance</h6>
                <h2 className="mb-0">{overview.todayAttendancePercentage}%</h2>
                <small>{overview.todayPresentCount} present / {overview.todayAbsentCount} absent</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Fee Collection</h6>
                <h2 className="mb-0">{overview.feeCollectionPercentage}%</h2>
                <small>₹{overview.totalFeeCollected} collected</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Pending Admissions</h6>
                <h2 className="mb-0">{overview.totalPendingAdmissions}</h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class-wise Comparison Chart: Attendance % vs Result % */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-bar-chart-line me-2"></i>
            Class-wise Comparison: Attendance % vs Average Result %
          </h5>
        </div>
        <div className="card-body">
          {comparisonData.length === 0 ? (
            <p className="text-muted text-center py-4">No data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="attendancePercentage" name="Attendance %" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resultPercentage" name="Avg Result %" fill="#198754" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Attendance by Class */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-calendar-check me-2"></i>Attendance % by Class</h5>
            </div>
            <div className="card-body">
              {attendanceByClass.length === 0 ? (
                <p className="text-muted text-center py-4">No attendance data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceByClass}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="attendancePercentage" name="Attendance %" radius={[4, 4, 0, 0]}>
                      {attendanceByClass.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Result Performance by Class */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="bi bi-graph-up me-2"></i>Average Result % by Class</h5>
            </div>
            <div className="card-body">
              {resultByClass.length === 0 ? (
                <p className="text-muted text-center py-4">No result data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resultByClass}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="averagePercentage" name="Avg Result %" radius={[4, 4, 0, 0]}>
                      {resultByClass.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Attendance Trend (last 14 days) */}
        <div className="col-md-7">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0"><i className="bi bi-graph-up-arrow me-2"></i>Attendance Trend (Last 14 Days)</h5>
            </div>
            <div className="card-body">
              {attendanceTrend.length === 0 ? (
                <p className="text-muted text-center py-4">No trend data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="attendancePercentage" name="Attendance %" stroke="#0d6efd" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Fee Status Breakdown */}
        <div className="col-md-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-warning text-white">
              <h5 className="mb-0"><i className="bi bi-cash-coin me-2"></i>Fee Status Breakdown</h5>
            </div>
            <div className="card-body">
              {feeSummary.length === 0 ? (
                <p className="text-muted text-center py-4">No fee data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={feeSummary}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                    >
                      {feeSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admission Funnel */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0"><i className="bi bi-file-earmark-person me-2"></i>Admission Status Funnel</h5>
        </div>
        <div className="card-body">
          {admissionFunnel.length === 0 ? (
            <p className="text-muted text-center py-4">No admission data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={admissionFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
                  {admissionFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {/* AI-Powered At-Risk Students */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-cpu-fill me-2"></i>
            AI-Powered Student Risk Analysis
          </h5>
          <button
            className="btn btn-sm btn-light"
            onClick={() => downloadCsv('/analytics/export/at-risk-students.csv', 'at-risk-students.csv')}
          >
            <i className="bi bi-download me-1"></i>Export CSV
          </button>
        </div>
        <div className="card-body">
          {atRiskStudents.length === 0 ? (
            <p className="text-muted text-center py-4">No student data yet.</p>
          ) : (
            <>
              <div className="alert alert-info py-2">
                <i className="bi bi-info-circle me-2"></i>
                Risk level and confidence are predicted by the Random Forest AI model. Reasons and recommendations explain the student metrics used for the prediction.
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Attendance</th>
                      <th>Avg Result</th>
                      <th>Absences</th>
                      <th>Failed</th>
                      <th>Trend</th>
                      <th>AI Risk</th>
                      <th>Confidence</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atRiskStudents.slice(0, 15).map((student) => {
                      const unavailable = student.dataStatus && student.dataStatus !== 'AVAILABLE'
                      const riskClass = student.riskLevel === 'High Risk'
                        ? 'bg-danger'
                        : student.riskLevel === 'Medium Risk'
                          ? 'bg-warning text-dark'
                          : student.riskLevel === 'Low Risk'
                            ? 'bg-success'
                            : 'bg-secondary'

                      return (
                        <tr key={student.studentId}>
                          <td>{student.rollNo || '-'}</td>
                          <td>{student.studentName || '-'}</td>
                          <td>{student.className || '-'}</td>
                          <td>{student.attendancePercentage == null ? '-' : `${student.attendancePercentage}%`}</td>
                          <td>{student.averageResultPercentage == null ? '-' : `${student.averageResultPercentage}%`}</td>
                          <td>{student.absenceCount ?? '-'}</td>
                          <td>{student.failedSubjects ?? '-'}</td>
                          <td>
                            {student.performanceTrend == null
                              ? '-'
                              : `${student.performanceTrend > 0 ? '+' : ''}${student.performanceTrend}%`}
                          </td>
                          <td><span className={`badge ${riskClass}`}>{student.riskLevel}</span></td>
                          <td>{unavailable ? '-' : `${Math.round((student.confidence || 0) * 100)}%`}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedAiStudent(student)}
                            >
                              <i className="bi bi-eye me-1"></i>Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedAiStudent && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-stars me-2"></i>
              AI Analysis — {selectedAiStudent.studentName}
            </h5>
            <button className="btn-close btn-close-white" onClick={() => setSelectedAiStudent(null)}></button>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <strong>Risk Level:</strong>{' '}
                <span className={`badge ${selectedAiStudent.riskLevel === 'High Risk' ? 'bg-danger' : selectedAiStudent.riskLevel === 'Medium Risk' ? 'bg-warning text-dark' : selectedAiStudent.riskLevel === 'Low Risk' ? 'bg-success' : 'bg-secondary'}`}>
                  {selectedAiStudent.riskLevel}
                </span>
              </div>
              <div className="col-md-4">
                <strong>Confidence:</strong>{' '}
                {selectedAiStudent.dataStatus === 'AVAILABLE'
                  ? `${Math.round((selectedAiStudent.confidence || 0) * 100)}%`
                  : 'Not available'}
              </div>
              <div className="col-md-4"><strong>Data Status:</strong> {selectedAiStudent.dataStatus || 'AVAILABLE'}</div>
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                <h6><i className="bi bi-exclamation-circle me-2"></i>Reasons</h6>
                <ul className="mb-0">
                  {(selectedAiStudent.reasons || []).map((reason, index) => <li key={index}>{reason}</li>)}
                </ul>
              </div>
              <div className="col-md-6">
                <h6><i className="bi bi-lightbulb me-2"></i>Recommendations</h6>
                <ul className="mb-0">
                  {(selectedAiStudent.recommendations || []).map((recommendation, index) => <li key={index}>{recommendation}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
