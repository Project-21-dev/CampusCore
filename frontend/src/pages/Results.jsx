import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import * as XLSX from 'xlsx'

const Results = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [students, setStudents] = useState([])
  const [allResults, setAllResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [uploadMode, setUploadMode] = useState('manual')

  const [filters, setFilters] = useState({
    className: '',
    academicYear: '2025-26',
    examType: '',
    subject: '',
    dateFrom: '',
    dateTo: ''
  })

  const [manualResults, setManualResults] = useState([])
  const [selectedClass, setSelectedClass] = useState('')

  const [bulkFile, setBulkFile] = useState(null)
  const [bulkPreview, setBulkPreview] = useState([])

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingResult, setEditingResult] = useState(null)
  const [editFormData, setEditFormData] = useState({
    studentId: '',
    subject: '',
    marks: '',
    maxMarks: 100,
    examType: '',
    // remarks: '',
    academicYear: '2025-26'
  })

  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Geography']
  const examTypes = ['Mid-term', 'Final', 'Quiz', 'Assignment', 'Project', 'Class Test']
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  const academicYears = ['2024-25', '2025-26', '2026-27']

  useEffect(() => {
    fetchStudents()
    fetchResults()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [allResults, filters])

  const fetchStudents = async () => {
    try {
      const response = await api.get('/user/students')
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await api.get('/result/all')
      setAllResults(response.data)
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...allResults]

    if (filters.className) {
      filtered = filtered.filter(r => r.className === filters.className)
    }
    if (filters.academicYear) {
      filtered = filtered.filter(r => r.academicYear === filters.academicYear)
    }
    if (filters.examType) {
      filtered = filtered.filter(r => r.examType === filters.examType)
    }
    if (filters.subject) {
      filtered = filtered.filter(r => r.subject === filters.subject)
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(r => new Date(r.date) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => new Date(r.date) <= new Date(filters.dateTo))
    }

    setFilteredResults(filtered)
  }

  const calculateGrade = (marks, maxMarks = 100) => {
    const percentage = (marks / maxMarks) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C+'
    if (percentage >= 40) return 'C'
    if (percentage >= 33) return 'D'
    return 'F'
  }

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'success', 'A': 'success',
      'B+': 'primary', 'B': 'primary',
      'C+': 'warning', 'C': 'warning',
      'D': 'danger', 'F': 'danger'
    }
    return colors[grade] || 'secondary'
  }

  const handleClassSelect = (className) => {
    setSelectedClass(className)
    const classStudents = students.filter(s => s.className === className)

    const initialResults = classStudents.map(student => ({
      studentId: student.studentId,
      studentName: student.username,
      rollNo: student.rollNo,
      results: subjects.map(subject => ({
        subject,
        marks: '',
        maxMarks: 100,
        examType: 'Mid-term',
        // remarks: '',
        academicYear: '2025-26'
      }))
    }))

    setManualResults(initialResults)
  }

  const handleManualMarksChange = (studentIndex, subjectIndex, value) => {
    const updated = [...manualResults]
    updated[studentIndex].results[subjectIndex].marks = value
    setManualResults(updated)
  }

  const handleManualFieldChange = (studentIndex, subjectIndex, field, value) => {
    const updated = [...manualResults]
    updated[studentIndex].results[subjectIndex][field] = value
    setManualResults(updated)
  }

  const handleManualSubmit = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const resultsToUpload = []
      const invalidMarks = []

      manualResults.forEach((student, studentIndex) => {
        student.results.forEach((result, subjectIndex) => {
          if (result.marks && result.marks !== '') {
            const marks = parseFloat(result.marks)
            const maxMarks = parseFloat(result.maxMarks) || 100

            // Validate marks
            if (marks < 0 || marks > maxMarks) {
              invalidMarks.push(`${student.studentName} - ${result.subject}`)
              return
            }

            resultsToUpload.push({
              studentId: student.studentId,
              subject: result.subject,
              marks: marks,
              maxMarks: maxMarks,
              examType: result.examType,
              // remarks: result.remarks,
              academicYear: result.academicYear
            })
          }
        })
      })

      if (invalidMarks.length > 0) {
        setMessage({
          type: 'warning',
          text: `Invalid marks found (must be between 0 and max marks): ${invalidMarks.slice(0, 3).join(', ')}${invalidMarks.length > 3 ? '...' : ''}`
        })
        setLoading(false)
        return
      }

      if (resultsToUpload.length === 0) {
        setMessage({ type: 'warning', text: 'Please enter at least one mark' })
        setLoading(false)
        return
      }

      await api.post('/result/upload-bulk', resultsToUpload)

      setMessage({
        type: 'success',
        text: `Successfully uploaded ${resultsToUpload.length} results!`
      })

      setManualResults([])
      setSelectedClass('')
      fetchResults()

      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to upload results'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setBulkFile(file)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(sheet)

        const formattedData = data.map((row, index) => ({
          row: index + 2,
          studentId: row['Student ID'] || row['studentId'],
          rollNo: row['Roll No'] || row['rollNo'],
          studentName: row['Student Name'] || row['studentName'],
          className: row['Class'] || row['className'],
          subject: row['Subject'] || row['subject'],
          marks: parseFloat(row['Marks'] || row['marks']),
          maxMarks: parseFloat(row['Max Marks'] || row['maxMarks']) || 100,
          examType: row['Exam Type'] || row['examType'] || 'Mid-term',
          // remarks: row['Remarks'] || row['remarks'] || '',
          academicYear: row['Academic Year'] || row['academicYear'] || '2025-26',
          grade: '',
          // status: 'pending'
        }))

        formattedData.forEach(item => {
          item.grade = calculateGrade(item.marks, item.maxMarks)
        })

        setBulkPreview(formattedData)
      } catch (error) {
        setMessage({ type: 'danger', text: 'Error reading file. Please check format.' })
      }
    }

    reader.readAsBinaryString(file)
  }

  const handleBulkSubmit = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const invalidRows = bulkPreview.filter(row => {
        const marks = parseFloat(row.marks)
        const maxMarks = row.maxMarks || 100
        return !row.studentId || !row.subject || isNaN(marks) || marks < 0 || marks > maxMarks
      })

      if (invalidRows.length > 0) {
        setMessage({
          type: 'warning',
          text: `Please fix invalid rows: ${invalidRows.map(r => r.row).join(', ')} (marks must be between 0 and max marks)`
        })
        setLoading(false)
        return
      }

      const resultsToUpload = bulkPreview.map(row => ({
        studentId: parseInt(row.studentId),
        subject: row.subject,
        marks: row.marks,
        maxMarks: row.maxMarks,
        examType: row.examType,
        // remarks: row.remarks,
        academicYear: row.academicYear
      }))

      await api.post('/result/upload-bulk', resultsToUpload)

      setMessage({
        type: 'success',
        text: `Successfully uploaded ${resultsToUpload.length} results!`
      })

      setBulkFile(null)
      setBulkPreview([])
      fetchResults()

      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to upload results'
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        'Student ID': '1',
        'Roll No': '34',
        'Student Name': 'Pranali Mahadik',
        'Class': '10',
        'Subject': 'Mathematics',
        'Marks': '85',
        'Max Marks': '100',
        'Exam Type': 'Mid-term',
        'Academic Year': '2025-26'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Results Template')
    XLSX.writeFile(wb, 'results_template.xlsx')
  }

  const handleEdit = (result) => {
    setEditFormData({
      studentId: result.studentId,
      subject: result.subject,
      marks: result.marks,
      maxMarks: result.maxMarks || 100,
      examType: result.examType,
      // remarks: result.remarks || '',
      academicYear: result.academicYear
    })
    setEditingResult(result)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const marks = parseFloat(editFormData.marks)
      const maxMarks = parseFloat(editFormData.maxMarks) || 100

      // Validate marks
      if (marks < 0 || marks > maxMarks) {
        setMessage({
          type: 'warning',
          text: `Marks must be between 0 and ${maxMarks}`
        })
        setLoading(false)
        return
      }

      await api.put(`/result/${editingResult.resultId}`, editFormData)
      setMessage({ type: 'success', text: 'Result updated successfully!' })
      setShowEditModal(false)
      setEditingResult(null)
      fetchResults()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to update result'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return

    try {
      await api.delete(`/result/${resultId}`)
      setMessage({ type: 'success', text: 'Result deleted successfully!' })
      fetchResults()
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to delete result' })
    }
  }

  const exportResults = () => {
    const exportData = filteredResults.map(r => ({
      'Student Name': r.studentName,
      'Roll No': r.rollNo,
      'Class': r.className,
      'Subject': r.subject,
      'Marks': r.marks,
      'Max Marks': r.maxMarks,
      'Percentage': ((r.marks / r.maxMarks) * 100).toFixed(2),
      'Grade': r.grade,
      'Exam Type': r.examType,
      'Academic Year': r.academicYear,
      'Date': r.date,
      // 'Remarks': r.remarks || ''
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Results')
    XLSX.writeFile(wb, `results_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="container-fluid py-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left"></i> Back
      </button>

      <h1 className="mb-4">
        <i className="bi bi-graph-up text-success me-2"></i>
        Upload Results
      </h1>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn ${uploadMode === 'manual' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setUploadMode('manual')}
            >
              <i className="bi bi-table me-2"></i>Manual Upload (Tabular)
            </button>
            <button
              type="button"
              className={`btn ${uploadMode === 'bulk' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setUploadMode('bulk')}
            >
              <i className="bi bi-file-earmark-spreadsheet me-2"></i>Bulk Upload (CSV/Excel)
            </button>
          </div>
        </div>
      </div>

      {/* Manual Upload Section */}
      {uploadMode === 'manual' && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="bi bi-table me-2"></i>Manual Result Upload
            </h5>
          </div>
          <div className="card-body">
            {/* Class and Exam Type Selection */}
            <div className="row mb-4">
              <div className="col-md-3">
                <label className="form-label">Select Class *</label>
                <select
                  className="form-select"
                  value={selectedClass}
                  onChange={(e) => handleClassSelect(e.target.value)}
                >
                  <option value="">Choose Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Academic Year</label>
                <select className="form-select" value={filters.academicYear} onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                {selectedClass && (
                  <button
                    className="btn btn-success w-100"
                    onClick={handleManualSubmit}
                    disabled={loading || manualResults.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-2"></i>Upload All Results
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Results Table */}
            {manualResults.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-success">
                    <tr>
                      <th rowSpan="2">Roll No</th>
                      <th rowSpan="2">Student Name</th>
                      {subjects.map(subject => (
                        <th key={subject} colSpan="4" className="text-center">{subject}</th>
                      ))}
                    </tr>
                    <tr>
                      {subjects.map(subject => (
                        <React.Fragment key={subject}>
                          <th className="text-center" style={{ minWidth: '80px' }}>Marks</th>
                          <th className="text-center" style={{ minWidth: '80px' }}>Max</th>
                          <th className="text-center" style={{ minWidth: '60px' }}>Grade</th>
                          <th className="text-center" style={{ minWidth: '120px' }}>Exam Type</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {manualResults.map((student, studentIndex) => (
                      <tr key={student.studentId}>
                        <td>{student.rollNo}</td>
                        <td>{student.studentName}</td>
                        {student.results.map((result, subjectIndex) => {
                          const grade = result.marks ? calculateGrade(parseFloat(result.marks), parseFloat(result.maxMarks) || 100) : '-'
                          return (
                            <React.Fragment key={subjectIndex}>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="0"
                                  max={result.maxMarks}
                                  step="0.01"
                                  value={result.marks}
                                  onChange={(e) => handleManualMarksChange(studentIndex, subjectIndex, e.target.value)}
                                  placeholder="0"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="1"
                                  value={result.maxMarks}
                                  onChange={(e) => handleManualFieldChange(studentIndex, subjectIndex, 'maxMarks', e.target.value)}
                                />
                              </td>
                              <td className="text-center">
                                <span className={`badge bg-${getGradeColor(grade)}`}>{grade}</span>
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={result.examType}
                                  onChange={(e) => handleManualFieldChange(studentIndex, subjectIndex, 'examType', e.target.value)}
                                >
                                  {examTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </td>
                            </React.Fragment>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedClass && manualResults.length === 0 && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                No students found in Class {selectedClass}
              </div>
            )}
          </div>
        </div>
      )}

      {uploadMode === 'bulk' && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-file-earmark-spreadsheet me-2"></i>Bulk Result Upload
            </h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Upload Excel/CSV File</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                />
                <small className="text-muted">
                  Supported formats: .xlsx, .xls, .csv
                </small>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <button className="btn btn-outline-secondary w-100" onClick={downloadTemplate}>
                  <i className="bi bi-download me-2"></i>Download Template
                </button>
              </div>
            </div>

            {/* Preview Table */}
            {bulkPreview.length > 0 && (
              <>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Preview: {bulkPreview.length} records found. Review and upload.
                </div>

                <div className="table-responsive mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-sm table-bordered table-hover">
                    <thead className="table-primary sticky-top">
                      <tr>
                        <th>Row</th>
                        <th>Student ID</th>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Max</th>
                        <th>Grade</th>
                        <th>Exam Type</th>
                        <th>Academic Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.map((row, index) => (
                        <tr key={index} className={!row.studentId || !row.subject || isNaN(row.marks) ? 'table-danger' : ''}>
                          <td>{row.row}</td>
                          <td>{row.studentId}</td>
                          <td>{row.rollNo}</td>
                          <td>{row.studentName}</td>
                          <td>{row.className}</td>
                          <td>{row.subject}</td>
                          <td>{row.marks}</td>
                          <td>{row.maxMarks}</td>
                          <td>
                            <span className={`badge bg-${getGradeColor(row.grade)}`}>{row.grade}</span>
                          </td>
                          <td>{row.examType}</td>
                          <td>{row.academicYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleBulkSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2"></i>
                      Upload {bulkPreview.length} Results
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>All Results
          </h5>
          <button className="btn btn-light btn-sm" onClick={exportResults}>
            <i className="bi bi-download me-2"></i>Export
          </button>
        </div>

        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.className}
                onChange={(e) => setFilters({ ...filters, className: e.target.value })}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.academicYear}
                onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              >
                <option value="">All Years</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.examType}
                onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
              >
                <option value="">All Exam Types</option>
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              >
                <option value="">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                placeholder="From Date"
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control form-control-sm"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                placeholder="To Date"
              />
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table table-hover table-sm">
              <thead className="sticky-top bg-light">
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Exam Type</th>
                  <th>Academic Year</th>
                  <th>Date</th>
                  {/* <th>Remarks</th> */}
                  {user?.role === 'Admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <tr key={result.resultId}>
                      <td>{result.studentName}</td>
                      <td>{result.rollNo}</td>
                      <td>{result.className}</td>
                      <td>{result.subject}</td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {result.marks}/{result.maxMarks}
                        </span>
                        <small className="text-muted ms-1">
                          ({((result.marks / result.maxMarks) * 100).toFixed(1)}%)
                        </small>
                      </td>
                      <td>
                        <span className={`badge bg-${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td>{result.examType}</td>
                      <td>{result.academicYear}</td>
                      <td>{result.date}</td>
                      <td>
                        <small className="text-muted">{result.remarks || '-'}</small>
                      </td>
                      {user?.role === 'Admin' && (
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-1"
                            onClick={() => handleEdit(result)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(result.resultId)}
                            title="Delete"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={user?.role === 'Admin' ? 11 : 10} className="text-center text-muted">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showEditModal && editingResult && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-white">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-fill me-2"></i>Edit Result
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingResult(null)
                  }}
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Student *</label>
                    <select
                      className="form-select"
                      value={editFormData.studentId}
                      onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
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
                  <div className="mb-3">
                    <label className="form-label">Subject *</label>
                    <select
                      className="form-select"
                      value={editFormData.subject}
                      onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                      required
                    >
                      {subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Marks *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.marks}
                        onChange={(e) => setEditFormData({ ...editFormData, marks: e.target.value })}
                        min="0"
                        max={editFormData.maxMarks}
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Max Marks *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.maxMarks}
                        onChange={(e) => setEditFormData({ ...editFormData, maxMarks: e.target.value })}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Grade (Auto-calculated)</label>
                    <div>
                      <span className={`badge bg-${getGradeColor(calculateGrade(editFormData.marks, editFormData.maxMarks))} fs-5`}>
                        {calculateGrade(editFormData.marks, editFormData.maxMarks)}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Exam Type *</label>
                    <select
                      className="form-select"
                      value={editFormData.examType}
                      onChange={(e) => setEditFormData({ ...editFormData, examType: e.target.value })}
                      required
                    >
                      {examTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Academic Year *</label>
                    <select
                      className="form-select"
                      value={editFormData.academicYear}
                      onChange={(e) => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                      required
                    >
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingResult(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Results