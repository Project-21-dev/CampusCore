package com.schoolsync.service;

import com.schoolsync.dto.AdmissionStatusSummaryDTO;
import com.schoolsync.dto.AtRiskStudentDTO;
import com.schoolsync.dto.AttendanceByClassDTO;
import com.schoolsync.dto.DailyAttendanceDTO;
import com.schoolsync.dto.FeeStatusSummaryDTO;
import com.schoolsync.dto.OverviewStatsDTO;
import com.schoolsync.dto.ResultPerformanceDTO;

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
