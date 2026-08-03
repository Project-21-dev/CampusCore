package com.schoolsync.controller;

import com.schoolsync.dto.AdmissionStatusSummaryDTO;
import com.schoolsync.dto.AtRiskStudentDTO;
import com.schoolsync.dto.AttendanceByClassDTO;
import com.schoolsync.dto.DailyAttendanceDTO;
import com.schoolsync.dto.FeeStatusSummaryDTO;
import com.schoolsync.dto.OverviewStatsDTO;
import com.schoolsync.dto.ResultPerformanceDTO;
import com.schoolsync.service.AnalyticsService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<OverviewStatsDTO> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverviewStats());
    }

    @GetMapping("/attendance-by-class")
    public ResponseEntity<List<AttendanceByClassDTO>> getAttendanceByClass() {
        return ResponseEntity.ok(analyticsService.getAttendanceByClass());
    }

    @GetMapping("/attendance-trend")
    public ResponseEntity<List<DailyAttendanceDTO>> getAttendanceTrend(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(analyticsService.getDailyAttendanceTrend(days));
    }

    @GetMapping("/fee-summary")
    public ResponseEntity<List<FeeStatusSummaryDTO>> getFeeSummary() {
        return ResponseEntity.ok(analyticsService.getFeeSummaryByStatus());
    }

    @GetMapping("/admission-funnel")
    public ResponseEntity<List<AdmissionStatusSummaryDTO>> getAdmissionFunnel() {
        return ResponseEntity.ok(analyticsService.getAdmissionFunnel());
    }

    @GetMapping("/result-performance")
    public ResponseEntity<List<ResultPerformanceDTO>> getResultPerformance() {
        return ResponseEntity.ok(analyticsService.getResultPerformanceByClass());
    }

    @GetMapping("/at-risk-students")
    public ResponseEntity<List<AtRiskStudentDTO>> getAtRiskStudents() {
        return ResponseEntity.ok(analyticsService.getAtRiskStudents());
    }

    @GetMapping("/export/at-risk-students.csv")
    public ResponseEntity<byte[]> exportAtRiskStudentsCsv() {
        StringBuilder csv = new StringBuilder(
                "Student ID,Name,Roll No,Class,Attendance %,Pending Fee,Avg Result %,Risk Score,Risk Level\n");
        for (AtRiskStudentDTO s : analyticsService.getAtRiskStudents()) {
            csv.append(s.getStudentId()).append(",")
                    .append(csvSafe(s.getStudentName())).append(",")
                    .append(csvSafe(s.getRollNo())).append(",")
                    .append(csvSafe(s.getClassName())).append(",")
                    .append(s.getAttendancePercentage()).append(",")
                    .append(s.getPendingFeeAmount()).append(",")
                    .append(s.getAverageResultPercentage()).append(",")
                    .append(s.getRiskScore()).append(",")
                    .append(s.getRiskLevel()).append("\n");
        }
        return csvResponse(csv.toString(), "at-risk-students.csv");
    }

    @GetMapping("/export/overview.csv")
    public ResponseEntity<byte[]> exportOverviewCsv() {
        OverviewStatsDTO o = analyticsService.getOverviewStats();
        StringBuilder csv = new StringBuilder("Metric,Value\n");
        csv.append("Total Students,").append(o.getTotalStudents()).append("\n");
        csv.append("Total Teachers,").append(o.getTotalTeachers()).append("\n");
        csv.append("Pending Admissions,").append(o.getTotalPendingAdmissions()).append("\n");
        csv.append("Today Present,").append(o.getTodayPresentCount()).append("\n");
        csv.append("Today Absent,").append(o.getTodayAbsentCount()).append("\n");
        csv.append("Today Attendance %,").append(o.getTodayAttendancePercentage()).append("\n");
        csv.append("Fees Collected,").append(o.getTotalFeeCollected()).append("\n");
        csv.append("Fees Pending,").append(o.getTotalFeePending()).append("\n");
        csv.append("Fee Collection %,").append(o.getFeeCollectionPercentage()).append("\n");
        return csvResponse(csv.toString(), "overview-stats.csv");
    }

    private String csvSafe(String value) {
        if (value == null)
            return "";
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    private ResponseEntity<byte[]> csvResponse(String csv, String filename) {
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(bytes.length);
        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}
