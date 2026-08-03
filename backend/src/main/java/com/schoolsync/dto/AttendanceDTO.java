package com.schoolsync.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceDTO {
    private Long attendanceId;
    private Long studentId;
    private String studentName;
    private String rollNo;
    private String className;
    private LocalDate date;
    private String status;
}
