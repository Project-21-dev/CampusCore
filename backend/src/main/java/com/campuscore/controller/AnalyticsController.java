package com.campuscore.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.campuscore.dto.AdmissionStatusSummaryDTO;
import com.campuscore.dto.AtRiskStudentDTO;
import com.campuscore.dto.AttendanceByClassDTO;
import com.campuscore.dto.DailyAttendanceDTO;
import com.campuscore.dto.FeeStatusSummaryDTO;
import com.campuscore.dto.OverviewStatsDTO;
import com.campuscore.dto.ResultPerformanceDTO;
import com.campuscore.service.AnalyticsService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
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

    @GetMapping("/student/{studentId}/risk")
    @PreAuthorize("@securityAccess.canAccessStudent(authentication, #studentId)")
    public ResponseEntity<?> getStudentRisk(@PathVariable Long studentId) {
        return analyticsService.getAtRiskStudents().stream()
                .filter(item -> studentId.equals(item.getStudentId()))
                .findFirst()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/export/at-risk-students.csv")
    public ResponseEntity<byte[]> exportAtRiskStudentsCsv() {
        StringBuilder csv = new StringBuilder(
                "Student ID,Name,Roll No,Class,Attendance %,Pending Fee,Avg Result %,Absences,Failed Subjects,Performance Trend,Risk Level,Confidence,Data Status\n");
        for (AtRiskStudentDTO s : analyticsService.getAtRiskStudents()) {
            csv.append(s.getStudentId()).append(",")
                    .append(csvSafe(s.getStudentName())).append(",")
                    .append(csvSafe(s.getRollNo())).append(",")
                    .append(csvSafe(s.getClassName())).append(",")
                    .append(s.getAttendancePercentage()).append(",")
                    .append(s.getPendingFeeAmount()).append(",")
                    .append(s.getAverageResultPercentage()).append(",")
                    .append(s.getAbsenceCount()).append(",")
                    .append(s.getFailedSubjects()).append(",")
                    .append(s.getPerformanceTrend()).append(",")
                    .append(csvSafe(s.getRiskLevel())).append(",")
                    .append(s.getConfidence()).append(",")
                    .append(csvSafe(s.getDataStatus())).append("\n");
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
