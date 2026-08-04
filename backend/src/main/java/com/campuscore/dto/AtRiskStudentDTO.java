package com.campuscore.dto;

import java.util.List;

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

    private Double attendancePercentage;
    private Double pendingFeeAmount;
    private Double averageResultPercentage;

    private Integer absenceCount;
    private Integer failedSubjects;
    private Double performanceTrend;

    private String riskLevel;
    private Double confidence;

    private List<String> reasons;
    private List<String> recommendations;

    private String dataStatus;
}