package com.schoolsync.service;

import com.schoolsync.dto.AdmissionStatusSummaryDTO;
import com.schoolsync.dto.AiPredictionRequest;
import com.schoolsync.dto.AiPredictionResponse;
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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeeRepository feeRepository;
    private final AdmissionRepository admissionRepository;
    private final ResultRepository resultRepository;

    /*
     * This service calls:
     * POST http://localhost:8000/predict
     */
    private final AiPredictionService aiPredictionService;

    @Override
    public OverviewStatsDTO getOverviewStats() {

        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();

        long totalPendingAdmissions =
                admissionRepository.countByStatus("Pending");

        LocalDate today = LocalDate.now();

        long todayPresent =
                attendanceRepository.countByDateAndStatus(
                        today,
                        "Present"
                );

        long todayAbsent =
                attendanceRepository.countByDateAndStatus(
                        today,
                        "Absent"
                );

        long todayTotal =
                todayPresent + todayAbsent;

        double todayAttendancePercentage =
                todayTotal == 0
                        ? 0.0
                        : (todayPresent * 100.0) / todayTotal;

        Double totalCollectedRaw =
                feeRepository.getTotalCollected();

        Double totalFeeAmountRaw =
                feeRepository.getTotalFeeAmount();

        double collected =
                totalCollectedRaw != null
                        ? totalCollectedRaw
                        : 0.0;

        double totalAmount =
                totalFeeAmountRaw != null
                        ? totalFeeAmountRaw
                        : 0.0;

        double pending =
                totalAmount - collected;

        double collectionPercentage =
                totalAmount == 0
                        ? 0.0
                        : (collected * 100.0) / totalAmount;

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

        List<Object[]> rows =
                attendanceRepository.getAttendanceSummaryByClass();

        List<AttendanceByClassDTO> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            String className =
                    (String) row[0];

            long total =
                    ((Number) row[1]).longValue();

            long present =
                    ((Number) row[2]).longValue();

            double percentage =
                    total == 0
                            ? 0.0
                            : (present * 100.0) / total;

            result.add(
                    new AttendanceByClassDTO(
                            className,
                            total,
                            present,
                            round2(percentage)
                    )
            );
        }

        return result;
    }

    @Override
    public List<DailyAttendanceDTO> getDailyAttendanceTrend(
            int days
    ) {

        int safeDays =
                days <= 0 ? 14 : days;

        LocalDate startDate =
                LocalDate.now().minusDays(safeDays - 1);

        List<Object[]> rows =
                attendanceRepository.getDailyAttendanceTrend(
                        startDate
                );

        List<DailyAttendanceDTO> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            LocalDate date =
                    (LocalDate) row[0];

            long present =
                    ((Number) row[1]).longValue();

            long absent =
                    ((Number) row[2]).longValue();

            long total =
                    present + absent;

            double percentage =
                    total == 0
                            ? 0.0
                            : (present * 100.0) / total;

            result.add(
                    new DailyAttendanceDTO(
                            date,
                            present,
                            absent,
                            round2(percentage)
                    )
            );
        }

        return result;
    }

    @Override
    public List<FeeStatusSummaryDTO> getFeeSummaryByStatus() {

        List<Object[]> rows =
                feeRepository.getFeeSummaryByStatus();

        List<FeeStatusSummaryDTO> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            String status =
                    (String) row[0];

            long count =
                    ((Number) row[1]).longValue();

            double totalAmount =
                    row[2] != null
                            ? ((Number) row[2]).doubleValue()
                            : 0.0;

            result.add(
                    new FeeStatusSummaryDTO(
                            status,
                            count,
                            round2(totalAmount)
                    )
            );
        }

        return result;
    }

    @Override
    public List<AdmissionStatusSummaryDTO> getAdmissionFunnel() {

        List<Object[]> rows =
                admissionRepository.getAdmissionCountsByStatus();

        List<AdmissionStatusSummaryDTO> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            String status =
                    (String) row[0];

            long count =
                    ((Number) row[1]).longValue();

            result.add(
                    new AdmissionStatusSummaryDTO(
                            status,
                            count
                    )
            );
        }

        return result;
    }

    @Override
    public List<ResultPerformanceDTO>
            getResultPerformanceByClass() {

        List<Object[]> rows =
                resultRepository.getPerformanceByClass();

        List<ResultPerformanceDTO> result =
                new ArrayList<>();

        for (Object[] row : rows) {

            String className =
                    (String) row[0];

            double averagePercentage =
                    row[1] != null
                            ? ((Number) row[1]).doubleValue()
                            : 0.0;

            long totalResults =
                    ((Number) row[2]).longValue();

            result.add(
                    new ResultPerformanceDTO(
                            className,
                            round2(averagePercentage),
                            totalResults
                    )
            );
        }

        return result;
    }

    @Override
    public List<AtRiskStudentDTO> getAtRiskStudents() {

        List<Student> students =
                studentRepository.findAll();

        List<AtRiskStudentDTO> output =
                new ArrayList<>();

        for (Student student : students) {

            Long studentId =
                    student.getStudentId();

            List<Attendance> attendanceRecords =
                    attendanceRepository
                            .findByStudentStudentId(studentId);

            List<Result> resultRecords =
                    resultRepository
                            .findByStudentStudentId(studentId);

            List<Fee> feeRecords =
                    feeRepository
                            .findByStudentStudentId(studentId);

            AtRiskStudentDTO dto =
                    new AtRiskStudentDTO();

            dto.setStudentId(studentId);

            dto.setStudentName(
                    student.getUser() != null
                            ? student.getUser().getUsername()
                            : null
            );

            dto.setRollNo(
                    student.getRollNo()
            );

            dto.setClassName(
                    student.getClassName()
            );

            double pendingFeeAmount =
                    feeRecords.stream()
                            .filter(fee ->
                                    !"Paid".equalsIgnoreCase(
                                            fee.getStatus()
                                    )
                            )
                            .mapToDouble(Fee::getAmount)
                            .sum();

            dto.setPendingFeeAmount(
                    round2(pendingFeeAmount)
            );

            /*
             * Calculate values only when records exist.
             *
             * Missing data is not treated as 100%.
             */
            Double attendancePercentage =
                    attendanceRecords.isEmpty()
                            ? null
                            : round2(
                                    calculateAttendancePercentage(
                                            attendanceRecords
                                    )
                            );

            Double averageResultPercentage =
                    resultRecords.isEmpty()
                            ? null
                            : round2(
                                    calculateAverageResultPercentage(
                                            resultRecords
                                    )
                            );

            Integer absenceCount =
                    attendanceRecords.isEmpty()
                            ? null
                            : calculateAbsenceCount(
                                    attendanceRecords
                            );

            Integer failedSubjects =
                    resultRecords.isEmpty()
                            ? null
                            : calculateFailedSubjects(
                                    resultRecords
                            );

            dto.setAttendancePercentage(
                    attendancePercentage
            );

            dto.setAverageResultPercentage(
                    averageResultPercentage
            );

            dto.setAbsenceCount(
                    absenceCount
            );

            dto.setFailedSubjects(
                    failedSubjects
            );

            /*
             * Minimum data needed:
             *
             * 10 attendance records
             * 2 result records
             * results from at least 2 dates
             */
            long distinctResultDates =
                    resultRecords.stream()
                            .map(Result::getDate)
                            .distinct()
                            .count();

            boolean insufficientData =
                    attendanceRecords.size() < 10
                            || resultRecords.size() < 2
                            || distinctResultDates < 2;

            if (insufficientData) {

                dto.setPerformanceTrend(null);
                dto.setRiskLevel("INSUFFICIENT_DATA");
                dto.setConfidence(0.0);

                dto.setReasons(
                        List.of(
                                "Not enough attendance or examination "
                                        + "history is available for a "
                                        + "reliable AI prediction."
                        )
                );

                dto.setRecommendations(
                        List.of(
                                "Add at least 10 attendance records "
                                        + "and results from at least two "
                                        + "examination dates."
                        )
                );

                dto.setDataStatus(
                        "INSUFFICIENT_DATA"
                );

                output.add(dto);
                continue;
            }

            double performanceTrend =
                    calculatePerformanceTrend(
                            resultRecords
                    );

            dto.setPerformanceTrend(
                    round2(performanceTrend)
            );

            /*
             * Build the request sent to FastAPI.
             */
            AiPredictionRequest request =
                    new AiPredictionRequest(
                            attendancePercentage,
                            averageResultPercentage,
                            absenceCount,
                            failedSubjects,
                            performanceTrend
                    );

            try {

                AiPredictionResponse prediction =
                        aiPredictionService.predict(
                                request
                        );

                if (prediction == null) {
                    throw new IllegalStateException(
                            "AI service returned an empty response"
                    );
                }

                dto.setRiskLevel(
                        prediction.getRisk()
                );

                dto.setConfidence(
                        round2(prediction.getConfidence())
                );

                dto.setReasons(
                        prediction.getReasons()
                );

                dto.setRecommendations(
                        prediction.getRecommendations()
                );

                dto.setDataStatus(
                        "AVAILABLE"
                );

            } catch (Exception exception) {

                dto.setRiskLevel(
                        "AI_SERVICE_ERROR"
                );

                dto.setConfidence(
                        0.0
                );

                dto.setReasons(
                        List.of(
                                "The AI prediction service is "
                                        + "currently unavailable."
                        )
                );

                dto.setRecommendations(
                        List.of(
                                "Start the FastAPI service and "
                                        + "retry the analysis."
                        )
                );

                dto.setDataStatus(
                        "AI_SERVICE_ERROR"
                );
            }

            output.add(dto);
        }

        /*
         * Sort:
         * High → Medium → Low → Insufficient → Error
         */
        output.sort(
                Comparator.comparingInt(
                        (AtRiskStudentDTO dto) ->
                                getRiskPriority(dto.getRiskLevel())
                ).reversed()
        );

        return output;
    }

    private double calculateAttendancePercentage(
            List<Attendance> attendanceRecords
    ) {

        long presentCount =
                attendanceRecords.stream()
                        .filter(attendance ->
                                "Present".equalsIgnoreCase(
                                        attendance.getStatus()
                                )
                        )
                        .count();

        return (presentCount * 100.0)
                / attendanceRecords.size();
    }

    private int calculateAbsenceCount(
            List<Attendance> attendanceRecords
    ) {

        return (int) attendanceRecords.stream()
                .filter(attendance ->
                        "Absent".equalsIgnoreCase(
                                attendance.getStatus()
                        )
                )
                .count();
    }

    private double calculateAverageResultPercentage(
            List<Result> resultRecords
    ) {

        return resultRecords.stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElseThrow(
                        () -> new IllegalStateException(
                                "Result records are unavailable"
                        )
                );
    }

    /*
     * Counts the latest failed result for each subject.
     *
     * It does not count the same subject repeatedly
     * across old examinations.
     */
    private int calculateFailedSubjects(
            List<Result> resultRecords
    ) {

        Map<String, Result> latestResultBySubject =
                resultRecords.stream()
                        .collect(
                                Collectors.toMap(
                                        result ->
                                                normalizeSubject(
                                                        result.getSubject()
                                                ),
                                        result -> result,
                                        (first, second) ->
                                                first.getDate()
                                                        .isAfter(
                                                                second.getDate()
                                                        )
                                                        ? first
                                                        : second
                                )
                        );

        return (int) latestResultBySubject
                .values()
                .stream()
                .filter(result ->
                        result.getPercentage() < 33.0
                )
                .count();
    }

    private String normalizeSubject(
            String subject
    ) {

        return subject == null
                ? "unknown"
                : subject.trim().toLowerCase();
    }

    /*
     * Performance trend:
     *
     * Latest exam-date average
     * minus
     * previous exam-date average.
     *
     * Positive = improving
     * Negative = declining
     */
    private double calculatePerformanceTrend(
            List<Result> resultRecords
    ) {

        Map<LocalDate, Double> averageByDate =
                resultRecords.stream()
                        .collect(
                                Collectors.groupingBy(
                                        Result::getDate,
                                        Collectors.averagingDouble(
                                                Result::getPercentage
                                        )
                                )
                        );

        List<LocalDate> dates =
                averageByDate.keySet()
                        .stream()
                        .sorted(
                                Comparator.reverseOrder()
                        )
                        .toList();

        LocalDate latestDate =
                dates.get(0);

        LocalDate previousDate =
                dates.get(1);

        double latestAverage =
                averageByDate.get(latestDate);

        double previousAverage =
                averageByDate.get(previousDate);

        return latestAverage - previousAverage;
    }

    private int getRiskPriority(
            String riskLevel
    ) {

        if ("High Risk".equalsIgnoreCase(
                riskLevel
        )) {
            return 5;
        }

        if ("Medium Risk".equalsIgnoreCase(
                riskLevel
        )) {
            return 4;
        }

        if ("Low Risk".equalsIgnoreCase(
                riskLevel
        )) {
            return 3;
        }

        if ("INSUFFICIENT_DATA".equalsIgnoreCase(
                riskLevel
        )) {
            return 2;
        }

        if ("AI_SERVICE_ERROR".equalsIgnoreCase(
                riskLevel
        )) {
            return 1;
        }

        return 0;
    }

    private double round2(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}

