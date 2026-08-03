package com.schoolsync.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long studentId;
    private String studentName;
    private String rollNo;
    private String academicYear;
    private String className;
    private String section;
    private LocalDate enrollmentDate;
    private String status;
    private String remarks;
}
