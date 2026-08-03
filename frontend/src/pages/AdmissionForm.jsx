import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Base64 image for the side card
const admissionDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANUAAADt..."; // truncated for brevity

const AdmissionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [applicationNumber, setApplicationNumber] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    appliedClass: "",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
    previousSchool: "",
    previousClass: "",
    previousMarks: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
  const newErrors = {};

  if (!formData.firstName.trim()) {
    newErrors.firstName = "First name is required";
  } else if (!/^[A-Za-z ]+$/.test(formData.firstName)) {
    newErrors.firstName = "First name must contain only letters";
  }

  if (!formData.lastName.trim()) {
    newErrors.lastName = "Last name is required";
  } else if (!/^[A-Za-z ]+$/.test(formData.lastName)) {
    newErrors.lastName = "Last name must contain only letters";
  }

  if (!formData.gender) {
    newErrors.gender = "Gender is required";
  }

  if (!formData.dateOfBirth) {
    newErrors.dateOfBirth = "Date of birth is required";
  } else {
    const dob = new Date(formData.dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 5) {
      newErrors.dateOfBirth = "Student must be at least 5 years old";
    }
  }

   if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else {
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
  }

  if (!formData.phone.trim()) {
    newErrors.phone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
    newErrors.phone = "Invalid Indian mobile number";
  }

  if (!formData.address.trim()) {
    newErrors.address = "Address is required";
  } else if (formData.address.length < 10) {
    newErrors.address = "Address must be at least 10 characters";
  }

  if (!formData.city.trim()) {
    newErrors.city = "City is required";
  } else if (!/^[A-Za-z\s]+$/.test(formData.city)) {
    newErrors.city = "City must contain only letters";
  }

  if (!formData.state.trim()) {
    newErrors.state = "State is required";
  } else if (!/^[A-Za-z\s]+$/.test(formData.state)) {
    newErrors.state = "State must contain only letters";
  }

  if (!formData.pincode.trim()) {
    newErrors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(formData.pincode)) {
    newErrors.pincode = "Pincode must be exactly 6 digits";
  }
  if (!formData.appliedClass) {
    newErrors.appliedClass = "Applied class is required";
  }

  if (!/^\d{4}-\d{4}$/.test(formData.academicYear)) {
    newErrors.academicYear = "Academic year format must be YYYY-YYYY";
  }

  if (formData.previousMarks) {
    const marks = Number(formData.previousMarks);
    if (marks < 0 || marks > 100) {
      newErrors.previousMarks = "Marks must be between 0 and 100";
    }
  }

  if (!formData.fatherName.trim()) {
    newErrors.fatherName = "Father name is required";
  } else if (!/^[A-Za-z ]+$/.test(formData.fatherName)) {
    newErrors.fatherName = "Father name must contain only letters";
  }

   if (!formData.motherName.trim()) {
    newErrors.motherName = "Mother name is required";
  } else if (!/^[A-Za-z ]+$/.test(formData.motherName)) {
    newErrors.motherName = "Mother name must contain only letters";
  }



  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
    setLoading(false);
    return;
  }
    try {
      const response = await api.post("/admission/apply", {
        ...formData,
        previousMarks: formData.previousMarks
          ? parseFloat(formData.previousMarks)
          : null,
      });

      setApplicationNumber(response.data.applicationNumber);
      setMessage({ type: "success", text: response.data.message });

      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          appliedClass: "",
          academicYear: new Date().getFullYear().toString(),
          fatherName: "",
          fatherOccupation: "",
          fatherPhone: "",
          motherName: "",
          motherOccupation: "",
          motherPhone: "",
          guardianName: "",
          guardianRelation: "",
          guardianPhone: "",
          previousSchool: "",
          previousClass: "",
          previousMarks: "",
        });
        setApplicationNumber("");
      }, 10000);
      console.log("Form Data Submitted:", formData);
    } catch (error) {
       if (error.response?.data?.field) {
      setErrors({ [error.response.data.field]: error.response.data.message });
    } else {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Submission failed",
      });
    }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="mb-0">Online Admission Form</h2>
              <p className="mb-0 mt-2">
                Fill in all the details to apply for admission
              </p>
            </div>

            <div className="card-body p-4">
              <div className="row">
                {/* Form Section */}
                <div className="col-lg-8">
                  {message.text && (
                    <div
                      className={`alert alert-${message.type} alert-dismissible fade show`}
                      role="alert"
                    >
                      {message.text}
                      {applicationNumber && (
                        <div className="mt-2">
                          <strong>
                            Application Number: {applicationNumber}
                          </strong>
                        </div>
                      )}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage({ type: "", text: "" })}
                      ></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Personal Details */}
                    <h5 className="mb-3">Personal Details</h5>
                    <div className="row mb-3">
                      <div className="col">
                        <input
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          className="form-control"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                        {errors.firstName && (
                          <div className="text-danger">{errors.firstName}</div>
                        )}
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          className="form-control"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                        {errors.lastName && (
                          <div className="text-danger">{errors.lastName}</div>
                        )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col">
                        <input
                          type="date"
                          name="dateOfBirth"
                          className="form-control"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          required
                        />
                        {errors.dateOfBirth && (
                          <div className="text-danger">
                            {errors.dateOfBirth}
                          </div>
                        )}
                      </div>
                      <div className="col">
                        <select
                          name="gender"
                          className="form-select"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <div className="text-danger">{errors.gender}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {errors.email && (
                        <div className="text-danger">{errors.email}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                        {errors.phone && (
                          <div className="text-danger">{errors.phone}</div>
                        )}
                    </div>

                    <div className="mb-3">
                      <textarea
                        name="address"
                        placeholder="Address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        required
                      />
                      {errors.address && (
                        <div className="text-danger">{errors.address}</div>
                      )}
                    </div>

                    <div className="row mb-3">
                       <div className="col">
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          className="form-control"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                        {errors.state && (
                          <div className="text-danger">{errors.state}</div>
                        )}
                      </div>
                      
                      <div className="col">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          className="form-control"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                        {errors.city && (
                          <div className="text-danger">{errors.city}</div>
                        )}
                      </div>
                     
                      <div className="col">
                        <input
                          type="text"
                          name="pincode"
                          placeholder="Pincode"
                          className="form-control"
                          value={formData.pincode}
                          onChange={handleChange}
                          required
                        />
                        {errors.pincode && (
                          <div className="text-danger">{errors.pincode}</div>
                        )}
                      </div>
                    </div>

                    {/* Academic Information */}
                    <h5 className="mb-3">Academic Information</h5>
                    <div className="row mb-3">
                      <div className="col">
                        <select
                          name="appliedClass"
                          className="form-select"
                          value={formData.appliedClass}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Class</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option
                              key={i}
                              value={`${i + 1}`}
                            >{`class ${i + 1}`}</option>
                          ))}
                        </select>
                        {errors.appliedClass && (
                          <div className="text-danger">{errors.appliedClass}</div>
                        )}
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          name="academicYear"
                          className="form-control"
                          value={formData.academicYear}
                          onChange={handleChange}
                          required
                        />
                        {errors.academicYear && (
                          <div className="text-danger">{errors.academicYear}</div>
                        )}
                      </div>
                    </div>

                    {/* Parent / Guardian */}
                    <h5 className="mb-3">Parent / Guardian</h5>
                    <div className="row mb-3">
                      <div className="col">
                        <input
                          type="text"
                          name="fatherName"
                          placeholder="Father Name"
                          className="form-control"
                          value={formData.fatherName}
                          onChange={handleChange}
                          required
                        />
                        {errors.fatherName && (
                          <div className="text-danger">{errors.fatherName}</div>
                        )}
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          name="fatherOccupation"
                          placeholder="Father Occupation"
                          className="form-control"
                          value={formData.fatherOccupation}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col">
                        <input
                          type="tel"
                          name="fatherPhone"
                          placeholder="Father Phone"
                          className="form-control"
                          value={formData.fatherPhone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col">
                        <input
                          type="text"
                          name="motherName"
                          placeholder="Mother Name"
                          className="form-control"
                          value={formData.motherName}
                          onChange={handleChange}
                          required
                        />
                        {errors.motherName && (
                          <div className="text-danger">{errors.motherName}</div>
                        )}
                      </div>
                      <div className="col">
                        <input
                          type="text"
                          name="motherOccupation"
                          placeholder="Mother Occupation"
                          className="form-control"
                          value={formData.motherOccupation}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col">
                        <input
                          type="tel"
                          name="motherPhone"
                          placeholder="Mother Phone"
                          className="form-control"
                          value={formData.motherPhone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Previous School */}
                    <h5 className="mb-3">Previous School</h5>
                    <div className="row mb-3">
                      <div className="col">
                        <input
                          type="text"
                          name="previousSchool"
                          placeholder="Previous School Name"
                          className="form-control"
                          value={formData.previousSchool}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col">
                        {/* <input
                          type="text"
                          name="previousClass"
                          placeholder="Previous Class"
                          className="form-control"
                          value={formData.previousClass}
                          onChange={handleChange}
                        /> */}
                        <select
                          name="previousClass"
                          className="form-select"
                          value={formData.previousClass}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Previous Class</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option
                              key={i}
                              value={`${i + 1}`}
                            >{`class ${i + 1}`}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col">
                        <input
                          type="number"
                          name="previousMarks"
                          placeholder="Marks %"
                          className="form-control"
                          value={formData.previousMarks}
                          onChange={handleChange}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="text-center mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Side Card */}
                <div className="col-lg-4 d-none d-lg-block">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">How to Apply</h5>
                      <p className="small">
                        Fill the form and submit. You'll receive an application
                        number and follow-up details via email.
                      </p>
                      <ul className="small">
                        <li>Keep scanned copies of certificates ready.</li>
                        <li>Ensure contact details are correct.</li>
                        <li>For assistance, call +91 9876543210.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionForm;
