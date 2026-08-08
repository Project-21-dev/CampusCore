import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import FaceAttendanceStudent from './pages/FaceAttendanceStudent'
import StudentResults from './pages/StudentResults'
import FaceAttendanceTeacher from './pages/FaceAttendanceTeacher'
import Results from './pages/Results'
import AdminManageStudents from './pages/AdminManageStudents'
import AdminManageTeachers from './pages/AdminManageTeachers'
import AdminManageParents from './pages/AdminManageParents'
import AdminManageAttendance from './pages/AdminManageAttendance'
import StudentProfile from './pages/StudentProfile'
import TeacherProfile from './pages/TeacherProfile'
import EnrollmentManagement from './pages/EnrollmentManagement'
import FeeManagement from './pages/FeeManagement'
import AdmissionForm from './pages/AdmissionForm'
import CheckAdmissionStatus from './pages/CheckAdmissionStatus'
import AdminManageAdmissions from './pages/AdminManageAdmissions'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import ParentDashboard from './pages/ParentDashboard'
import ParentChildRecords from './pages/ParentChildRecords'
import Announcements from './pages/Announcements'
import AuditLogViewer from './pages/AuditLogViewer'
import ChangePassword from './pages/ChangePassword'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-center p-5"><div className="spinner-border" role="status"></div></div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<><Header /><Home /><Footer /></>} />
      <Route path="/about" element={<><Header /><About /><Footer /></>} />
      <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
      <Route path="/login" element={<><Header /><Login /><Footer /></>} />
      <Route path="/register" element={<><Header /><Register /><Footer /></>} />
      <Route path="/admission" element={<><Header /><AdmissionForm /><Footer /></>} />
      <Route path="/admission/status" element={<><Header /><CheckAdmissionStatus /><Footer /></>} />

      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AdminDashboard /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AnalyticsDashboard /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/teacher/dashboard"
        element={
          <PrivateRoute allowedRoles={['Teacher']}>
            <><Header /><TeacherDashboard /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <PrivateRoute allowedRoles={['Student']}>
            <><Header /><StudentDashboard /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/student/attendance"
        element={
          <PrivateRoute allowedRoles={['Student']}>
            <><Header /><FaceAttendanceStudent /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/student/results"
        element={
          <PrivateRoute allowedRoles={['Student']}>
            <><Header /><StudentResults /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <PrivateRoute allowedRoles={['Teacher']}>
            <><Header /><FaceAttendanceTeacher /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/results"
        element={
          <PrivateRoute allowedRoles={['Teacher', 'Admin']}>
            <><Header /><Results /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AdminManageStudents /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/teachers"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AdminManageTeachers /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/parents"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AdminManageParents /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/attendance"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AdminManageAttendance /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/results"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><Results /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/student/profile/:studentId?"
        element={
          <PrivateRoute>
            <><Header /><StudentProfile /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/teacher/profile/:teacherId?"
        element={
          <PrivateRoute allowedRoles={['Teacher']}>
            <><Header /><TeacherProfile /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/enrollment"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Teacher']}>
            <><Header /><EnrollmentManagement /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/fees"
        element={
          <PrivateRoute allowedRoles={['Admin', 'Student', 'Parent']}>
            <><Header /><FeeManagement /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/admissions"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AdminManageAdmissions /><Footer /></>
          </PrivateRoute>
        }
      />


      <Route
        path="/parent/attendance"
        element={
          <PrivateRoute allowedRoles={['Parent']}>
            <><Header /><ParentChildRecords mode="attendance" /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/parent/results"
        element={
          <PrivateRoute allowedRoles={['Parent']}>
            <><Header /><ParentChildRecords mode="results" /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/parent/analysis"
        element={
          <PrivateRoute allowedRoles={['Parent']}>
            <><Header /><ParentChildRecords mode="analysis" /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/parent/dashboard"
        element={
          <PrivateRoute allowedRoles={['Parent']}>
            <><Header /><ParentDashboard /><Footer /></>
          </PrivateRoute>
        }
      />


      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <><Header /><ChangePassword /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/announcements"
        element={
          <PrivateRoute>
            <><Header /><Announcements /><Footer /></>
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/audit-log"
        element={
          <PrivateRoute allowedRoles={['Admin']}>
            <><Header /><AuditLogViewer /><Footer /></>
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App

