package com.campuscore.service;

import com.campuscore.dto.AdmissionStatusSummaryDTO;
import com.campuscore.dto.AtRiskStudentDTO;
import com.campuscore.dto.AttendanceByClassDTO;
import com.campuscore.dto.DailyAttendanceDTO;
import com.campuscore.dto.FeeStatusSummaryDTO;
import com.campuscore.dto.OverviewStatsDTO;
import com.campuscore.dto.ResultPerformanceDTO;

import java.util.List;

public interface AnalyticsService {

    OverviewStatsDTO getOverviewStats();

    List<AttendanceByClassDTO> getAttendanceByClass();

    List<DailyAttendanceDTO> getDailyAttendanceTrend(int days);

    List<FeeStatusSummaryDTO> getFeeSummaryByStatus();

    List<AdmissionStatusSummaryDTO> getAdmissionFunnel();

    List<ResultPerformanceDTO> getResultPerformanceByClass();

    List<AtRiskStudentDTO> getAtRiskStudents();
}
