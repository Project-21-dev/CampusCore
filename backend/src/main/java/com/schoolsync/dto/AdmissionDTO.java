package com.schoolsync.dto;


import java.time.LocalDate;
import java.time.Period;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionDTO {

    private Long admissionId;

    @NotBlank(message = "Application number is required")
    private String applicationNumber;

    @NotBlank(message = "First name is required")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "First name must contain only letters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Last name must contain only letters")
    private String lastName;

    private String fullName;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "Male|Female|Other", message = "Gender must be Male, Female or Other")
    private String gender;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @AssertTrue(message = "Student must be at least 5 years old")
    public boolean isAgeValid() {
        if (dateOfBirth == null) return false;
        return Period.between(dateOfBirth, LocalDate.now()).getYears() >= 5;
    }

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(min = 10, message = "Address must be at least 10 characters long")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Father name is required")
    private String fatherName;

    @NotBlank(message = "Mother name is required")
    private String motherName;

    @NotBlank(message = "Applied class is required")
    private String appliedClass;

    @NotBlank(message = "Academic year is required")
    @Pattern(regexp = "\\d{4}-\\d{4}", message = "Academic year format must be YYYY-YYYY")
    private String academicYear;

    private String previousSchool;

    @Pattern(regexp = "^(100|\\d{1,2})$", message = "Previous marks must be between 0 and 100")
    private String previousMarks;

    @NotBlank(message = "Status is required")
    private String status;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;

    @NotBlank(message = "Application date is required")
    private String applicationDate;
}

