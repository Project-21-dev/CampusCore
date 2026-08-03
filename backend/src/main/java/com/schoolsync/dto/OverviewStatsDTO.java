package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverviewStatsDTO {
    private Long totalStudents;
    private Long totalTeachers;
    private Long totalPendingAdmissions;
    private Long todayPresentCount;
    private Long todayAbsentCount;
    private Double todayAttendancePercentage;
    private Double totalFeeCollected;
    private Double totalFeePending;
    private Double feeCollectionPercentage;
}
