package com.campuscore.service;

import com.campuscore.entity.Result;
import com.campuscore.entity.Student;
import com.campuscore.repository.ResultRepository;
import com.campuscore.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResultServiceImpl {

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;

    public ResponseEntity<?> uploadResult(
            Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            Long studentId = Long.valueOf(
                    request.get("studentId").toString()
            );

            String subject = request.get("subject").toString();

            Double marks = Double.valueOf(
                    request.get("marks").toString()
            );

            Double maxMarks = request.containsKey("maxMarks")
                    ? Double.valueOf(
                            request.get("maxMarks").toString()
                    )
                    : 100.0;

            String examType = request
                    .getOrDefault("examType", "Mid-term")
                    .toString();

            String remarks = request
                    .getOrDefault("remarks", "")
                    .toString();

            String academicYear = request
                    .getOrDefault("academicYear", "2025-26")
                    .toString();

            LocalDate date = request.containsKey("date")
                    ? LocalDate.parse(
                            request.get("date").toString()
                    )
                    : LocalDate.now();

            validateMarks(marks, maxMarks);

            Student student = studentRepository
                    .findById(studentId)
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Student not found"
                            )
                    );

            boolean exists =
                    resultRepository
                            .existsByStudentAndSubjectAndExamTypeAndAcademicYear(
                                    student,
                                    subject,
                                    examType,
                                    academicYear
                            );

            if (exists) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Result already exists for this "
                                                + "student, subject, "
                                                + "exam type and "
                                                + "academic year"
                                )
                        );
            }

            Result result = createResult(
                    student,
                    subject,
                    marks,
                    maxMarks,
                    examType,
                    remarks,
                    academicYear,
                    date,
                    authentication
            );

            resultRepository.save(result);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Result uploaded successfully",

                            "resultId",
                            result.getResultId(),

                            "grade",
                            result.getGrade(),

                            "date",
                            result.getDate().toString()
                    )
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to upload result: "
                                            + exception.getMessage()
                            )
                    );
        }
    }

    public ResponseEntity<?> uploadBulkResults(
            List<Map<String, Object>> requests,
            Authentication authentication
    ) {
        try {
            int successCount = 0;
            int failCount = 0;

            List<String> errors = new ArrayList<>();

            for (Map<String, Object> request : requests) {
                try {
                    Long studentId = Long.valueOf(
                            request.get("studentId").toString()
                    );

                    String subject =
                            request.get("subject").toString();

                    Double marks = Double.valueOf(
                            request.get("marks").toString()
                    );

                    Double maxMarks =
                            request.containsKey("maxMarks")
                                    ? Double.valueOf(
                                            request.get("maxMarks")
                                                    .toString()
                                    )
                                    : 100.0;

                    String examType = request
                            .getOrDefault(
                                    "examType",
                                    "Mid-term"
                            )
                            .toString();

                    String remarks = request
                            .getOrDefault("remarks", "")
                            .toString();

                    String academicYear = request
                            .getOrDefault(
                                    "academicYear",
                                    "2025-26"
                            )
                            .toString();

                    LocalDate date =
                            request.containsKey("date")
                                    ? LocalDate.parse(
                                            request.get("date")
                                                    .toString()
                                    )
                                    : LocalDate.now();

                    validateMarks(marks, maxMarks);

                    Student student =
                            studentRepository
                                    .findById(studentId)
                                    .orElseThrow(
                                            () -> new RuntimeException(
                                                    "Student ID "
                                                            + studentId
                                                            + " not found"
                                            )
                                    );

                    boolean exists =
                            resultRepository
                                    .existsByStudentAndSubjectAndExamTypeAndAcademicYear(
                                            student,
                                            subject,
                                            examType,
                                            academicYear
                                    );

                    if (exists) {
                        failCount++;

                        errors.add(
                                "Duplicate entry for Student ID: "
                                        + studentId
                                        + ", Subject: "
                                        + subject
                                        + ", Exam type: "
                                        + examType
                        );

                        continue;
                    }

                    Result result = createResult(
                            student,
                            subject,
                            marks,
                            maxMarks,
                            examType,
                            remarks,
                            academicYear,
                            date,
                            authentication
                    );

                    resultRepository.save(result);

                    successCount++;

                } catch (Exception exception) {

                    failCount++;

                    errors.add(
                            "Error processing record: "
                                    + exception.getMessage()
                    );
                }
            }

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Bulk upload completed"
            );

            response.put(
                    "totalRecords",
                    requests.size()
            );

            response.put(
                    "successCount",
                    successCount
            );

            response.put(
                    "failCount",
                    failCount
            );

            if (!errors.isEmpty()) {
                response.put(
                        "errors",
                        errors
                );
            }

            return ResponseEntity.ok(response);

        } catch (Exception exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to upload bulk results: "
                                            + exception.getMessage()
                            )
                    );
        }
    }

    public List<Map<String, Object>> getAllResults(
            String className,
            String subject,
            String examType,
            String academicYear,
            LocalDate dateFrom,
            LocalDate dateTo
    ) {
        List<Result> results =
                resultRepository.findAll();

        results = filterResults(
                results,
                className,
                subject,
                examType,
                academicYear,
                dateFrom,
                dateTo
        );

        return results.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStudentResults(
            Long studentId
    ) {
        List<Result> results =
                resultRepository
                        .findByStudentStudentId(studentId);

        return results.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getClassResults(
            String className
    ) {
        List<Result> results =
                resultRepository
                        .findAll()
                        .stream()
                        .filter(
                                result ->
                                        result.getStudent()
                                                .getClassName()
                                                .equals(className)
                        )
                        .collect(Collectors.toList());

        return results.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getClassStatistics(
            String className,
            String subject,
            String examType,
            String academicYear
    ) {
        List<Result> results =
                resultRepository
                        .findAll()
                        .stream()
                        .filter(
                                result ->
                                        result.getStudent()
                                                .getClassName()
                                                .equals(className)
                        )
                        .collect(Collectors.toList());

        results = filterResults(
                results,
                null,
                subject,
                examType,
                academicYear,
                null,
                null
        );

        if (results.isEmpty()) {
            return Map.of(
                    "message",
                    "No results found"
            );
        }

        return calculateStatistics(results);
    }

    public ResponseEntity<?> updateResult(
            Long id,
            Map<String, Object> request
    ) {
        try {
            Result result =
                    resultRepository
                            .findById(id)
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "Result not found"
                                    )
                            );

            updateResultFields(
                    result,
                    request
            );

            validateMarks(
                    result.getMarks(),
                    result.getMaxMarks()
            );

            resultRepository.save(result);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Result updated successfully",

                            "grade",
                            result.getGrade(),

                            "date",
                            result.getDate().toString()
                    )
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to update result: "
                                            + exception.getMessage()
                            )
                    );
        }
    }

    public ResponseEntity<?> deleteResult(
            Long id
    ) {
        try {
            if (!resultRepository.existsById(id)) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            resultRepository.deleteById(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Result deleted successfully"
                    )
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to delete result: "
                                            + exception.getMessage()
                            )
                    );
        }
    }

    private Result createResult(
            Student student,
            String subject,
            Double marks,
            Double maxMarks,
            String examType,
            String remarks,
            String academicYear,
            LocalDate date,
            Authentication authentication
    ) {
        Result result = new Result();

        result.setStudent(student);
        result.setSubject(subject);
        result.setMarks(marks);
        result.setMaxMarks(maxMarks);
        result.setExamType(examType);
        result.setRemarks(remarks);
        result.setAcademicYear(academicYear);
        result.setDate(date);

        result.setUploadedBy(
                authentication != null
                        ? authentication.getName()
                        : "System"
        );

        return result;
    }

    private List<Result> filterResults(
            List<Result> results,
            String className,
            String subject,
            String examType,
            String academicYear,
            LocalDate dateFrom,
            LocalDate dateTo
    ) {
        if (className != null
                && !className.isEmpty()) {

            results = results.stream()
                    .filter(
                            result ->
                                    result.getStudent()
                                            .getClassName()
                                            .equals(className)
                    )
                    .collect(Collectors.toList());
        }

        if (subject != null
                && !subject.isEmpty()) {

            results = results.stream()
                    .filter(
                            result ->
                                    result.getSubject()
                                            .equalsIgnoreCase(
                                                    subject
                                            )
                    )
                    .collect(Collectors.toList());
        }

        if (examType != null
                && !examType.isEmpty()) {

            results = results.stream()
                    .filter(
                            result ->
                                    result.getExamType()
                                            .equalsIgnoreCase(
                                                    examType
                                            )
                    )
                    .collect(Collectors.toList());
        }

        if (academicYear != null
                && !academicYear.isEmpty()) {

            results = results.stream()
                    .filter(
                            result ->
                                    result.getAcademicYear()
                                            .equals(
                                                    academicYear
                                            )
                    )
                    .collect(Collectors.toList());
        }

        if (dateFrom != null) {

            results = results.stream()
                    .filter(
                            result ->
                                    !result.getDate()
                                            .isBefore(dateFrom)
                    )
                    .collect(Collectors.toList());
        }

        if (dateTo != null) {

            results = results.stream()
                    .filter(
                            result ->
                                    !result.getDate()
                                            .isAfter(dateTo)
                    )
                    .collect(Collectors.toList());
        }

        return results;
    }

    private void updateResultFields(
            Result result,
            Map<String, Object> request
    ) {
        if (request.containsKey("studentId")) {

            Long studentId = Long.valueOf(
                    request.get("studentId").toString()
            );

            Student student =
                    studentRepository
                            .findById(studentId)
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "Student not found"
                                    )
                            );

            result.setStudent(student);
        }

        if (request.containsKey("subject")) {
            result.setSubject(
                    request.get("subject").toString()
            );
        }

        if (request.containsKey("marks")) {
            result.setMarks(
                    Double.valueOf(
                            request.get("marks").toString()
                    )
            );
        }

        if (request.containsKey("maxMarks")) {
            result.setMaxMarks(
                    Double.valueOf(
                            request.get("maxMarks").toString()
                    )
            );
        }

        if (request.containsKey("examType")) {
            result.setExamType(
                    request.get("examType").toString()
            );
        }

        if (request.containsKey("remarks")) {
            result.setRemarks(
                    request.get("remarks").toString()
            );
        }

        if (request.containsKey("academicYear")) {
            result.setAcademicYear(
                    request.get("academicYear").toString()
            );
        }

        if (request.containsKey("date")) {
            result.setDate(
                    LocalDate.parse(
                            request.get("date").toString()
                    )
            );
        }
    }

    private void validateMarks(
            Double marks,
            Double maxMarks
    ) {
        if (marks == null) {
            throw new RuntimeException(
                    "Marks are required"
            );
        }

        if (maxMarks == null
                || maxMarks <= 0) {

            throw new RuntimeException(
                    "Maximum marks must be greater than zero"
            );
        }

        if (marks < 0) {
            throw new RuntimeException(
                    "Marks cannot be negative"
            );
        }

        if (marks > maxMarks) {
            throw new RuntimeException(
                    "Marks cannot be greater than maximum marks"
            );
        }
    }

    private Map<String, Object> calculateStatistics(
            List<Result> results
    ) {
        double average = results.stream()
                .mapToDouble(Result::getPercentage)
                .average()
                .orElse(0.0);

        double highest = results.stream()
                .mapToDouble(Result::getMarks)
                .max()
                .orElse(0.0);

        double lowest = results.stream()
                .mapToDouble(Result::getMarks)
                .min()
                .orElse(0.0);

        long passCount = results.stream()
                .filter(
                        result ->
                                result.getPercentage() >= 33
                )
                .count();

        long failCount =
                results.size() - passCount;

        Map<String, Long> gradeDistribution =
                results.stream()
                        .collect(
                                Collectors.groupingBy(
                                        Result::getGrade,
                                        Collectors.counting()
                                )
                        );

        Map<String, Object> statistics =
                new HashMap<>();

        statistics.put(
                "totalResults",
                results.size()
        );

        statistics.put(
                "averagePercentage",
                String.format("%.2f", average)
        );

        statistics.put(
                "highestMarks",
                highest
        );

        statistics.put(
                "lowestMarks",
                lowest
        );

        statistics.put(
                "passCount",
                passCount
        );

        statistics.put(
                "failCount",
                failCount
        );

        statistics.put(
                "gradeDistribution",
                gradeDistribution
        );

        return statistics;
    }

    private Map<String, Object> convertToMap(
            Result result
    ) {
        Map<String, Object> map =
                new HashMap<>();

        map.put(
                "resultId",
                result.getResultId()
        );

        map.put(
                "studentId",
                result.getStudent().getStudentId()
        );

        map.put(
                "studentName",
                result.getStudent()
                        .getUser()
                        .getUsername()
        );

        map.put(
                "rollNo",
                result.getStudent().getRollNo()
        );

        map.put(
                "className",
                result.getStudent().getClassName()
        );

        map.put(
                "subject",
                result.getSubject()
        );

        map.put(
                "marks",
                result.getMarks()
        );

        map.put(
                "maxMarks",
                result.getMaxMarks()
        );

        map.put(
                "percentage",
                String.format(
                        "%.2f",
                        result.getPercentage()
                )
        );

        map.put(
                "grade",
                result.getGrade()
        );

        map.put(
                "examType",
                result.getExamType()
        );

        map.put(
                "remarks",
                result.getRemarks()
        );

        map.put(
                "academicYear",
                result.getAcademicYear()
        );

        map.put(
                "date",
                result.getDate().toString()
        );

        map.put(
                "uploadedBy",
                result.getUploadedBy()
        );

        return map;
    }
}