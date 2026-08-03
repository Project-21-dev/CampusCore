package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtRiskStudentDTO {
    private Long studentId;
    private String studentName;
    private String rollNo;
    private String className;
    private double attendancePercentage;
    private double pendingFeeAmount;
    private double averageResultPercentage;
    private double riskScore; // 0 (low risk) - 100 (high risk)
    private String riskLevel; // Low, Medium, High
}
