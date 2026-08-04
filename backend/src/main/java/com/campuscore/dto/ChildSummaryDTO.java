package com.campuscore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChildSummaryDTO {
    private Long linkId;
    private Long studentId;
    private String studentName;
    private String rollNo;
    private String className;
    private String relation;
    private double attendancePercentage;
    private double pendingFeeAmount;
    private double averageResultPercentage;
}
