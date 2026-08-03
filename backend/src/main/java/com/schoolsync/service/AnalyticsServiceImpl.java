package com.schoolsync.service;

import com.schoolsync.dto.AdmissionStatusSummaryDTO;
import com.schoolsync.dto.AtRiskStudentDTO;
import com.schoolsync.dto.AttendanceByClassDTO;
import com.schoolsync.dto.DailyAttendanceDTO;
import com.schoolsync.dto.FeeStatusSummaryDTO;
import com.schoolsync.dto.OverviewStatsDTO;
import com.schoolsync.dto.ResultPerformanceDTO;
import com.schoolsync.entity.Attendance;
import com.schoolsync.entity.Fee;
import com.schoolsync.entity.Result;
import com.schoolsync.entity.Student;
import com.schoolsync.repository.AdmissionRepository;
import com.schoolsync.repository.AttendanceRepository;
import com.schoolsync.repository.FeeRepository;
import com.schoolsync.repository.ResultRepository;
import com.schoolsync.repository.StudentRepository;
import com.schoolsync.repository.TeacherRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeeRepository feeRepository;
    private final AdmissionRepository admissionRepository;
    private final ResultRepository resultRepository;

    @Override
    public OverviewStatsDTO getOverviewStats() {
        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();
        long totalPendingAdmissions = admissionRepository.countByStatus("Pending");

        LocalDate today = LocalDate.now();
        long todayPresent = attendanceRepository.countByDateAndStatus(today, "Present");
        long todayAbsent = attendanceRepository.countByDateAndStatus(today, "Absent");
        long todayTotal = todayPresent + todayAbsent;
        double todayAttendancePercentage = todayTotal == 0 ? 0.0 : (todayPresent * 100.0) / todayTotal;

        Double totalCollectedRaw = feeRepository.getTotalCollected();
        Double totalFeeAmountRaw = feeRepository.getTotalFeeAmount();
        double collected = totalCollectedRaw != null ? totalCollectedRaw : 0.0;
        double totalAmount = totalFeeAmountRaw != null ? totalFeeAmountRaw : 0.0;
        double pending = totalAmount - collected;
        double collectionPercentage = totalAmount == 0 ? 0.0 : (collected * 100.0) / totalAmount;

        return new OverviewStatsDTO(
                totalStudents,
                totalTeachers,
                totalPendingAdmissions,
                todayPresent,
                todayAbsent,
                round2(todayAttendancePercentage),
                round2(collected),
                round2(pending),
                round2(collectionPercentage)
        );
    }

    @Override
    public List<AttendanceByClassDTO> getAttendanceByClass() {
        List<Object[]> rows = attendanceRepository.getAttendanceSummaryByClass();
        List<AttendanceByClassDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String className = (String) row[0];
            long total = ((Number) row[1]).longValue();
            long present = ((Number) row[2]).longValue();
            double percentage = total == 0 ? 0.0 : (present * 100.0) / total;

            result.add(new AttendanceByClassDTO(className, total, present, round2(percentage)));
        }
        return result;
    }

    @Override
    public List<DailyAttendanceDTO> getDailyAttendanceTrend(int days) {
        int safeDays = days <= 0 ? 14 : days;
        LocalDate startDate = LocalDate.now().minusDays(safeDays - 1);

        List<Object[]> rows = attendanceRepository.getDailyAttendanceTrend(startDate);
        List<DailyAttendanceDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            LocalDate date = (LocalDate) row[0];
            long present = ((Number) row[1]).longValue();
            long absent = ((Number) row[2]).longValue();
            long total = present + absent;
            double percentage = total == 0 ? 0.0 : (present * 100.0) / total;

            result.add(new DailyAttendanceDTO(date, present, absent, round2(percentage)));
        }
        return result;
    }

    @Override
    public List<FeeStatusSummaryDTO> getFeeSummaryByStatus() {
        List<Object[]> rows = feeRepository.getFeeSummaryByStatus();
        List<FeeStatusSummaryDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String status = (String) row[0];
            long count = ((Number) row[1]).longValue();
            double totalAmount = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;

            result.add(new FeeStatusSummaryDTO(status, count, round2(totalAmount)));
        }
        return result;
    }

    @Override
    public List<AdmissionStatusSummaryDTO> getAdmissionFunnel() {
        List<Object[]> rows = admissionRepository.getAdmissionCountsByStatus();
        List<AdmissionStatusSummaryDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String status = (String) row[0];
            long count = ((Number) row[1]).longValue();

            result.add(new AdmissionStatusSummaryDTO(status, count));
        }
        return result;
    }

    @Override
    public List<ResultPerformanceDTO> getResultPerformanceByClass() {
        List<Object[]> rows = resultRepository.getPerformanceByClass();
        List<ResultPerformanceDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String className = (String) row[0];
            double avgPercentage = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            long total = ((Number) row[2]).longValue();

            result.add(new ResultPerformanceDTO(className, round2(avgPercentage), total));
        }
        return result;
    }

    @Override
    public List<AtRiskStudentDTO> getAtRiskStudents() {
        List<Student> students = studentRepository.findAll();
        List<AtRiskStudentDTO> result = new ArrayList<>();

        for (Student student : students) {
            List<Attendance> attendance = attendanceRepository.findByStudentStudentId(student.getStudentId());
            long presentDays = attendance.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
            double attendancePct = attendance.isEmpty() ? 100.0 : (presentDays * 100.0) / attendance.size();

            List<Fee> fees = feeRepository.findByStudentStudentId(student.getStudentId());
            double pendingFee = fees.stream()
                    .filter(f -> !"Paid".equalsIgnoreCase(f.getStatus()))
                    .mapToDouble(Fee::getAmount)
                    .sum();

            List<Result> results = resultRepository.findByStudentStudentId(student.getStudentId());
            double avgResult = results.stream().mapToDouble(Result::getPercentage).average().orElse(100.0);

            // Weighted composite risk score (0 = low risk, 100 = high risk)
            double attendanceRisk = Math.max(0, 100 - attendancePct) * 0.5;
            double resultRisk = Math.max(0, 100 - avgResult) * 0.3;
            double feeRisk = pendingFee <= 0 ? 0 : (pendingFee > 5000 ? 20 : (pendingFee / 5000.0) * 20);

            double riskScore = round2(attendanceRisk + resultRisk + feeRisk);
            String riskLevel = riskScore >= 50 ? "High" : (riskScore >= 25 ? "Medium" : "Low");

            result.add(new AtRiskStudentDTO(
                    student.getStudentId(),
                    student.getUser() != null ? student.getUser().getUsername() : null,
                    student.getRollNo(),
                    student.getClassName(),
                    round2(attendancePct),
                    round2(pendingFee),
                    round2(avgResult),
                    riskScore,
                    riskLevel));
        }

        result.sort(Comparator.comparingDouble(AtRiskStudentDTO::getRiskScore).reversed());
        return result;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
