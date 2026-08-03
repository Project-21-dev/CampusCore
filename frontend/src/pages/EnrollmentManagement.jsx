import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const EnrollmentManagement = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    academicYear: new Date().getFullYear().toString(),
    className: "",
    section: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    status: "Active",
    remarks: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, studentsRes] = await Promise.all([
        api.get("/studentmanagement/enrollment/all"),
        api.get("/user/students"),
      ]);
      setEnrollments(enrollmentsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "danger", text: "Failed to load data" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEnrollment) {
        await api.put(
          `/studentmanagement/enrollment/${editingEnrollment.enrollmentId}`,
          formData,
        );
        setMessage({
          type: "success",
          text: "Enrollment updated successfully!",
        });
      } else {
        await api.post("/studentmanagement/enrollment", formData);
        setMessage({
          type: "success",
          text: "Enrollment created successfully!",
        });
      }
      setShowModal(false);
      resetForm();
      fetchData();
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Operation failed",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const handleEdit = (enrollment) => {
    setFormData({
      studentId: enrollment.studentId,
      academicYear: enrollment.academicYear,
      className: enrollment.className,
      section: enrollment.section,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status,
      remarks: enrollment.remarks || "",
    });
    setEditingEnrollment(enrollment);
    setShowModal(true);
  };

  const handleDeleteClick = (enrollmentId) => {
    setEnrollmentToDelete(enrollmentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!enrollmentToDelete) return;

    try {
      await api.delete(`/studentmanagement/enrollment/${enrollmentToDelete}`);
      setMessage({ type: "success", text: "Enrollment deleted successfully!" });
      setShowDeleteModal(false);
      setEnrollmentToDelete(null);
      fetchData();
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to delete enrollment" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      academicYear: new Date().getFullYear().toString(),
      className: "",
      section: "",
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "Active",
      remarks: "",
    });
    setEditingEnrollment(null);
    console.log(formData);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in-up">
      <div className="mb-4">
        <button
          className="btn btn-link text-decoration-none text-muted p-0 hover-glow"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold text-dark">
          <i className="bi bi-book-half text-primary me-3"></i>
          Enrollment Management
        </h1>
        {user?.role === "Admin" && (
          <button
            className="btn btn-primary px-4 rounded-pill shadow-sm hover-glow"
            onClick={openModal}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>New Enrollment
          </button>
        )}
      </div>

      {message.text && (
        <div
          className={`alert alert-${message.type} glass-panel border-0 mb-4 fade show`}
          role="alert"
        >
          <div className="d-flex align-items-center">
            <i
              className={`bi ${message.type === "success" ? "bi-check-circle-fill text-success" : "bi-exclamation-triangle-fill text-danger"} me-3 fs-4`}
            ></i>
            <div>{message.text}</div>
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setMessage({ type: "", text: "" })}
            ></button>
          </div>
        </div>
      )}

      <div className="glass-panel p-4">
        <div className="table-responsive">
          <table className="table modern-table mb-0">
            <thead>
              <tr>
                <th>Student info</th>
                <th>Academic Year</th>
                <th>Class & Sec</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                {user?.role === "Admin" && (
                  <th className="text-end">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.enrollmentId}>
                    <td>
                      <div className="fw-bold text-dark">
                        {enrollment.studentName}
                      </div>
                      <div className="small text-muted">
                        Roll: {enrollment.rollNo}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {enrollment.academicYear}
                      </span>
                    </td>
                    <td>
                      {enrollment.className} - {enrollment.section}
                    </td>
                    <td className="small text-muted">
                      {enrollment.enrollmentDate}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 ${enrollment.status === "Active" ? "bg-success-subtle text-success border-success-subtle" : "bg-light text-muted border-light"}`}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                    {user?.role === "Admin" && (
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-warning border-0 me-2"
                          onClick={() => handleEdit(enrollment)}
                        >
                          <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger border-0"
                          onClick={() =>
                            handleDeleteClick(enrollment.enrollmentId)
                          }
                        >
                          <i className="bi bi-trash3-fill fs-5"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={user?.role === "Admin" ? 6 : 5}
                    className="text-center py-5 text-muted"
                  >
                    <i className="bi bi-folder2-open fs-1 d-block mb-3 opacity-25"></i>
                    No enrollment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && user?.role === "Admin" && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-modal border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-book-fill text-primary me-2"></i>
                  {editingEnrollment
                    ? "Update Enrollment"
                    : "Create New Enrollment"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small text-muted text-uppercase fw-bold">
                      Student
                    </label>
                    <select
                      className="form-select border-0 bg-light"
                      value={formData.studentId}
                      onChange={(e) =>
                        setFormData({ ...formData, studentId: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option
                          key={student.studentId}
                          value={student.studentId}
                        >
                          {student.username} ({student.rollNo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted text-uppercase fw-bold">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicYear: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted text-uppercase fw-bold">
                        Class
                      </label>
                      {/* <input
                        type="text"
                        className="form-control border-0 bg-light"
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        required
                        placeholder="e.g. 10th"
                      /> */}
                      <select
                        className="form-select border-0 bg-light"
                        value={formData.className}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            className: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted text-uppercase fw-bold">
                        Section
                      </label>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        value={formData.section}
                        onChange={(e) =>
                          setFormData({ ...formData, section: e.target.value })
                        }
                        required
                        placeholder="e.g. A"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted text-uppercase fw-bold">
                      Enrollment Date
                    </label>
                    <input
                      type="date"
                      className="form-control border-0 bg-light"
                      value={formData.enrollmentDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enrollmentDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted text-uppercase fw-bold">
                      Status
                    </label>
                    <select
                      className="form-select border-0 bg-light"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Transferred">Transferred</option>
                    </select>
                  </div>
                  <div className="mb-0">
                    <label className="form-label small text-muted text-uppercase fw-bold">
                      Notes
                    </label>
                    <textarea
                      className="form-control border-0 bg-light"
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
                      rows="2"
                      placeholder="Optional enrollment notes..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-link text-muted text-decoration-none"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-pill shadow-sm"
                  >
                    {editingEnrollment ? "Save Changes" : "Create Enrollment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content glass-modal border-0 shadow-lg text-center p-4">
              <div className="modal-body">
                <i className="bi bi-exclamation-triangle-fill text-danger display-4 mb-3 d-block"></i>
                <h4 className="fw-bold mb-2">Remove Enrollment?</h4>
                <p className="text-muted mb-4">
                  Are you sure you want to delete this record? This action
                  cannot be undone.
                </p>
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
                    Yes, Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;
