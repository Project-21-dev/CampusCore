import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
    email: "",
    phone: "",
    rollNo: "",
    className: "",
    subject: "",
    childRollNo: "",
    relation: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const subjects = [
    "English",
    "Mathematics",
    "Geography",
    "Social Science",
    "Science",
    "Hindi",
  ];

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // setErrors({});
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role) newErrors.role = "Role is required";

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[A-Za-z][A-Za-z0-9_.]*$/.test(formData.username)) {
      newErrors.username =
        "Username must start with a letter and contain only letters, numbers, _ or .";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(formData.password)
    ) {
      newErrors.password =
        "Password must be 8+ characters and include uppercase, lowercase & special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.phone && !/^(\+91)?[6-9][0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid Indian phone number";
    }

    if (formData.role === "Student") {
      if (!formData.rollNo.trim()) newErrors.rollNo = "Roll number is required";
      if (!formData.className) newErrors.className = "Class is required";
    }

    if (formData.role === "Teacher" && !formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (formData.role === "Parent" && !formData.childRollNo.trim()) {
      newErrors.childRollNo = "Your child's roll number is required to link your account";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const registerData = {
      username: formData.username.trim(),
      password: formData.password,
      role: formData.role,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
    };

    if (formData.role === "Student") {
      registerData.rollNo = formData.rollNo.trim() || null;
      registerData.className = formData.className.trim() || null;
    } else if (formData.role === "Teacher") {
      registerData.subject = formData.subject.trim() || null;
    } else if (formData.role === "Parent") {
      registerData.childRollNo = formData.childRollNo.trim() || null;
      registerData.relation = formData.relation || null;
    }

    try {
      const result = await register(registerData);

      if (result.success && result.user) {
        // Registration successful - redirect to login
        setSuccess("Registration successful! Redirecting to login page...");
        setErrors({});

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else if (result.success) {
        // Registration successful but user data not returned
        setSuccess(
          "Registration successful! Please login with your credentials.",
        );
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setErrors({ api: result.message || "Registration failed" });
        setLoading(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ api: "Something went wrong. Please try again." });
      setLoading(false);
    }
    console.log(formData);
  };

  return (
    <div className="auth-page-bg">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg auth-card">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="register-icon-wrapper mb-3">
                    <i className="bi bi-person-plus-fill"></i>
                  </div>
                  <h2 className="register-title">Create Your Account</h2>
                  <p className="register-subtitle">
                    Join Smart School System and unlock your potential!
                  </p>
                </div>

                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                  </div>
                )}

                {errors.api && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errors.api}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Role Selection - Prominent */}
                  <div className="mb-4">
                    <label htmlFor="role" className="form-label fw-bold">
                      <i className="bi bi-person-badge-fill me-2 text-primary"></i>
                      Select Your Role *
                    </label>
                    <select
                      className={`form-select form-select-lg ${errors.role ? "is-invalid" : ""}`}
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      style={{
                        fontSize: "1.1rem",
                        border: formData.role
                          ? "2px solid #198754"
                          : errors.role
                            ? "2px solid #dc3545"
                            : "2px solid #0d6efd",
                        backgroundColor: formData.role ? "#f0f9ff" : "#fff",
                      }}
                    >
                      <option value="">-- Please Select Your Role --</option>
                      <option value="Student">👨‍🎓 Student</option>
                      <option value="Teacher">👩‍🏫 Teacher</option>
                      <option value="Parent">👪 Parent</option>
                      {/* <option value="Admin">
                        👨‍💼 Admin
                      </option> */}
                    </select>
                    {errors.role && (
                      <div className="invalid-feedback d-block">
                        {errors.role}
                      </div>
                    )}
                    {formData.role && (
                      <div className="alert alert-success mt-2 mb-0">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <strong>Selected:</strong> {formData.role} -{" "}
                        {formData.role === "Student"
                          ? "You will be able to view your attendance, results, and fees"
                          : formData.role === "Teacher"
                            ? "You will be able to mark attendance and upload results"
                            : "You will have full system access"}
                      </div>
                    )}
                    {!formData.role && !errors.role && (
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Select your role to continue with registration
                      </small>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="username" className="form-label">
                        <i className="bi bi-person me-2"></i>Username *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.username ? "is-invalid" : ""}`}
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      {errors.username && (
                        <div className="invalid-feedback d-block">
                          {errors.username}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        <i className="bi bi-envelope me-2"></i>Email
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <div className="invalid-feedback d-block">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="bi bi-lock me-2"></i>Password *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      {errors.password && (
                        <div className="invalid-feedback d-block">
                          {errors.password}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        <i className="bi bi-lock-fill me-2"></i>Confirm Password
                        *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback d-block">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">
                        <i className="bi bi-telephone me-2"></i>Phone
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      {errors.phone && (
                        <div className="invalid-feedback d-block">
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.role === "Student" && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="rollNo" className="form-label">
                          <i className="bi bi-123 me-2"></i>Roll Number
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.rollNo ? "is-invalid" : ""}`}
                          id="rollNo"
                          name="rollNo"
                          value={formData.rollNo}
                          onChange={handleChange}
                        />
                        {errors.rollNo && (
                          <div className="invalid-feedback d-block">
                            {errors.rollNo}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="className" className="form-label">
                          <i className="bi bi-book me-2"></i>Class
                        </label>

                        <select
                          className={`form-select ${errors.className ? "is-invalid" : ""}`}
                          id="className"
                          name="className"
                          value={formData.className}
                          onChange={handleChange}
                        >
                          <option value="">-- Select Class --</option>
                          {classes.map((cls) => (
                            <option key={cls} value={cls}>
                              Class {cls}
                            </option>
                          ))}
                        </select>
                        {errors.className && (
                          <div className="invalid-feedback d-block">
                            {errors.className}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.role === "Teacher" && (
                    <div className="mb-3">
                      <label htmlFor="subject" className="form-label">
                        <i className="bi bi-book-half me-2"></i>Subject *
                      </label>
                      <select
                        className={`form-select ${errors.subject ? "is-invalid" : ""}`}
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Select Subject --</option>
                        {subjects.map((subj) => (
                          <option key={subj} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <div className="invalid-feedback d-block">
                          {errors.subject}
                        </div>
                      )}
                    </div>
                  )}

                  {formData.role === "Parent" && (
                    <div className="mb-3">
                      <label htmlFor="childRollNo" className="form-label">
                        <i className="bi bi-person-heart me-2"></i>Child's Roll Number *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.childRollNo ? "is-invalid" : ""}`}
                        id="childRollNo"
                        name="childRollNo"
                        value={formData.childRollNo}
                        onChange={handleChange}
                        placeholder="e.g. 2601"
                        required
                      />
                      {errors.childRollNo && (
                        <div className="invalid-feedback d-block">
                          {errors.childRollNo}
                        </div>
                      )}
                      <label htmlFor="relation" className="form-label mt-3">
                        <i className="bi bi-people me-2"></i>Relation to Child
                      </label>
                      <select
                        className="form-select"
                        id="relation"
                        name="relation"
                        value={formData.relation}
                        onChange={handleChange}
                      >
                        <option value="">-- Select Relation --</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3 btn-lg register-submit-btn"
                    disabled={loading || !formData.role}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus-fill me-2"></i>Create My
                        Account
                      </>
                    )}
                  </button>

                  {!formData.role && (
                    <div className="alert alert-warning mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Please select your role above to continue
                    </div>
                  )}
                </form>

                <hr />
                <div className="text-center">
                  <p className="mb-2">
                    Already have an account?{" "}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      <i className="bi bi-box-arrow-in-right me-1"></i>Login
                      Here
                    </Link>
                  </p>
                  <Link to="/login" className="btn btn-outline-secondary w-100">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Go to Login
                    Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register