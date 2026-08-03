import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Swal from "sweetalert2";

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showSmsAlert, setShowSmsAlert] = useState(false);
  const [failedDetails, setFailedDetails] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    checkAttendanceStatus();
  }, [selectedDate, selectedClass, students]);

  const handleBack = () => {
    navigate(-1);
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/user/classes");
      setAvailableClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      let response;
      if (selectedClass) {
        response = await api.get(`/user/students/class/${selectedClass}`);
      } else {
        response = await api.get("/user/students");
      }
      setStudents(response.data);

      // Load attendance for selected date
      const attendanceRes = await api.get("/attendance/all");
      const dateAttendance = attendanceRes.data.filter(
        (a) => a.date === selectedDate,
      );

      const attendanceMap = {};
      dateAttendance.forEach((a) => {
        attendanceMap[a.studentId] = a.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const checkAttendanceStatus = async () => {
    if (students.length === 0) {
      setAttendanceSubmitted(false);
      return;
    }

    try {
      const attendanceRes = await api.get("/attendance/all");
      const dateAttendance = attendanceRes.data.filter(
        (a) => a.date === selectedDate,
      );

      // Filter by selected class if applicable
      let relevantStudentIds = students.map((s) => s.studentId);
      const markedStudents = dateAttendance.filter((a) =>
        relevantStudentIds.includes(a.studentId),
      );

      // If attendance is marked for all students in the current view, consider it submitted
      if (
        markedStudents.length > 0 &&
        markedStudents.length === students.length
      ) {
        setAttendanceSubmitted(true);
      } else {
        setAttendanceSubmitted(false);
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
      setAttendanceSubmitted(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    if (attendanceSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Attendance Already Submitted",
        text: "You cannot modify attendance that has already been submitted for this date.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (attendanceSubmitted) {
      Swal.fire({
        icon: "error",
        title: "Attendance Already Submitted!",
        text: "Attendance for this date has already been marked. You cannot submit it again.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setShowSmsAlert(false);

    try {
      const absentStudents = [];
      const failed = [];
      const succeeded = [];

      for (const student of students) {
        const status = attendance[student.studentId] || "Present";
        try {
          await api.post("/attendance/mark", {
            studentId: student.studentId,
            date: selectedDate,
            status: status,
          });

          setAttendance((prev) => ({ ...prev, [student.studentId]: status }));

          const name =
            student.username ||
            (student.user && student.user.username) ||
            `Student ${student.studentId}`;
          if (status === "Absent") absentStudents.push(name);
          succeeded.push(name);
        } catch (err) {
          const name =
            student.username ||
            (student.user && student.user.username) ||
            `Student ${student.studentId}`;
          const statusCode = err.response?.status;
          const serverMsg =
            err.response?.data?.message || err.response?.data || err.message;

          if (statusCode === 400 && serverMsg.includes("already marked")) {
            Swal.fire({
              icon: "error",
              title: "Duplicate Attendance Detected!",
              text: "Attendance for this date has already been marked.",
              confirmButtonColor: "#0d6efd",
            });
            setLoading(false);
            setAttendanceSubmitted(true);
            return;
          }

          failed.push({ name, statusCode, serverMsg });
          console.error("Failed saving attendance for", name, {
            statusCode,
            serverMsg,
            err,
          });
        }
      }

      if (succeeded.length > 0 && failed.length === 0) {
        setFailedDetails([]);
        setAttendanceSubmitted(true);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Attendance marked successfully!",
          confirmButtonColor: "#0d6efd",
        });

        if (absentStudents.length > 0) {
          setShowSmsAlert(true);
          setTimeout(() => setShowSmsAlert(false), 10000);
        }
      } else if (succeeded.length > 0 && failed.length > 0) {
        setFailedDetails(failed);
        setMessage({
          type: "warning",
          text: `Saved for ${succeeded.length} students. Failed for ${failed.length}: ${failed.map((f) => f.name).join(", ")}`,
        });

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Attendance marked successfully`,
          confirmButtonColor: "#0d6efd",
        });
      } else {
        setFailedDetails(failed);
        setMessage({
          type: "danger",
          text: `Failed to save attendance for all students`,
        });
        console.error("Attendance failures (all):", failed);
        console.log("Failed Details:", failed);
      }
    } catch (error) {
      console.error("Unexpected error marking attendance:", error);
      setMessage({ type: "danger", text: "Unexpected error. See console." });

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#0d6efd",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAllPresent = () => {
    if (attendanceSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Attendance Already Submitted",
        text: "You cannot modify attendance that has already been submitted for this date.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const allPresent = {};
    students.forEach((student) => {
      allPresent[student.studentId] = "Present";
    });
    setAttendance(allPresent);
  };

  const markAllAbsent = () => {
    if (attendanceSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Attendance Already Submitted",
        text: "You cannot modify attendance that has already been submitted for this date.",
        confirmButtonColor: "#0d6efd",
      });
      return;
    }

    const allAbsent = {};
    students.forEach((student) => {
      allAbsent[student.studentId] = "Absent";
    });
    setAttendance(allAbsent);
  };

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-3" onClick={handleBack}>
        <i className="bi bi-arrow-left"></i> Back
      </button>
      <h1 className="mb-4">
        <i className="bi bi-calendar-check text-primary me-2"></i>
        Mark Attendance
      </h1>

      {attendanceSubmitted && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          <strong>Attendance Submitted:</strong> Attendance for this date has
          already been marked.
          <button
            type="button"
            className="btn-close"
            onClick={() => setAttendanceSubmitted(false)}
          ></button>
        </div>
      )}

      {showSmsAlert && (
        <div
          className="alert alert-info alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-chat-dots-fill me-2"></i>
          <strong>SMS Notification:</strong> Absence notifications have been
          sent to parents via SMS.
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowSmsAlert(false)}
          ></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                Select Date
              </h5>
            </div>
            <div className="col-md-6 text-end">
              <button
                className="btn btn-light btn-sm me-2"
                onClick={markAllPresent}
                disabled={attendanceSubmitted}
              >
                <i className="bi bi-check-all me-1"></i>Mark All Present
              </button>
              <button
                className="btn btn-light btn-sm"
                onClick={markAllAbsent}
                disabled={attendanceSubmitted}
              >
                <i className="bi bi-x-lg me-1"></i>Mark All Absent
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6">
                <label htmlFor="class" className="form-label">
                  <i className="bi bi-building me-2"></i>Select Class
                </label>
                <select
                  className="form-select"
                  id="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={attendanceSubmitted}
                >
                  <option value="">All Classes</option>
                  {availableClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="date" className="form-label">
                  <i className="bi bi-calendar-date me-2"></i>Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.studentId}>
                      <td>{student.rollNo}</td>
                      <td>{student.username}</td>
                      <td>{student.className}</td>
                      <td>
                        <button
                          type="button"
                          className={`btn me-2 ${attendance[student.studentId] === "Present" || !attendance[student.studentId] ? "btn-success" : "btn-outline-success"}`}
                          style={{
                            minWidth: 90,
                            fontWeight:
                              attendance[student.studentId] === "Present" ||
                                !attendance[student.studentId]
                                ? "bold"
                                : "normal",
                            transition: "none",
                          }}
                          onClick={() =>
                            handleStatusChange(student.studentId, "Present")
                          }
                          disabled={attendanceSubmitted}
                          tabIndex={-1}
                        >
                          <i className="bi bi-check-circle me-1"></i>Present
                        </button>
                        <button
                          type="button"
                          className={`btn ${attendance[student.studentId] === "Absent" ? "btn-danger" : "btn-outline-danger"}`}
                          style={{
                            minWidth: 90,
                            fontWeight:
                              attendance[student.studentId] === "Absent"
                                ? "bold"
                                : "normal",
                            transition: "none",
                          }}
                          onClick={() =>
                            handleStatusChange(student.studentId, "Absent")
                          }
                          disabled={attendanceSubmitted}
                          tabIndex={-1}
                        >
                          <i className="bi bi-x-circle me-1"></i>Absent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-end">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={
                  loading || students.length === 0 || attendanceSubmitted
                }
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : attendanceSubmitted ? (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Attendance
                    Submitted
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>Save Attendance
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4">
        <div className="alert alert-info">
          <i className="bi bi-info-circle-fill me-2"></i>
          <strong>Note:</strong> When a student is marked as absent, an email
          notification will be automatically sent to the registered email
          address. SMS notifications are shown as UI alerts only.
          {attendanceSubmitted && (
            <>
              <br />
              <strong>Important:</strong> Attendance for this date has already
              been submitted and cannot be modified.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;