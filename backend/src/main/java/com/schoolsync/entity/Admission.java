package com.schoolsync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "admissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long admissionId;

    @Column(nullable = false, unique = true)
    private String applicationNumber;

    // Personal Details
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    // Academic Information
    @Column(nullable = false)
    private String appliedClass;

    @Column(nullable = false)
    private String academicYear;

    // Parent/Guardian Information
    @Column(nullable = false)
    private String fatherName;

    @Column(nullable = false)
    private String fatherOccupation;

    @Column(nullable = false)
    private String fatherPhone;

    @Column(nullable = false)
    private String motherName;

    @Column(nullable = false)
    private String motherOccupation;

    @Column(nullable = false)
    private String motherPhone;

    private String guardianName;
    private String guardianRelation;
    private String guardianPhone;

    // Previous School Information
    private String previousSchool;
    private String previousClass;
    private Double previousMarks;

    // Application Status
    @Column(nullable = false)
    private String status; // Pending, Under Review, Approved, Rejected

    @Column(nullable = false)
    private LocalDateTime applicationDate;

    private String remarks;

    // Roll Number (generated when approved)
    @Column(unique = true)
    private String rollNumber;
}
