package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceByClassDTO {
    private String className;
    private Long totalRecords;
    private Long presentCount;
    private Double attendancePercentage;
}
