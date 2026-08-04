package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionRequest {

    private double attendancePercentage;
    private double averageResultPercentage;
    private int absenceCount;
    private int failedSubjects;
    private double performanceTrend;

}