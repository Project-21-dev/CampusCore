package com.campuscore.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campuscore.service.ReportCardService;
import com.campuscore.service.ResultServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/result")
@RequiredArgsConstructor
public class ResultController {

    private final ResultServiceImpl resultService;
    private final ReportCardService reportCardService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<?> uploadResult(@RequestBody Map<String, Object> request, Authentication authentication) {
        return resultService.uploadResult(request, authentication);
    }

    @PostMapping("/upload-bulk")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<?> uploadBulkResults(@RequestBody List<Map<String, Object>> requests, 
                                                Authentication authentication) {
        return resultService.uploadBulkResults(requests, authentication);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<List<Map<String, Object>>> getAllResults(
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return ResponseEntity.ok(resultService.getAllResults(className, subject, examType, academicYear, dateFrom, dateTo));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("@securityAccess.canAccessStudent(authentication, #studentId)")
    public ResponseEntity<List<Map<String, Object>>> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(resultService.getStudentResults(studentId));
    }

    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<List<Map<String, Object>>> getClassResults(@PathVariable String className) {
        return ResponseEntity.ok(resultService.getClassResults(className));
    }

    @GetMapping("/statistics/{className}")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<Map<String, Object>> getClassStatistics(
            @PathVariable String className,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String academicYear
    ) {
        return ResponseEntity.ok(resultService.getClassStatistics(className, subject, examType, academicYear));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<?> updateResult(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        return resultService.updateResult(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<?> deleteResult(@PathVariable Long id) {
        return resultService.deleteResult(id);
    }

    @GetMapping("/report-card/{studentId}")
    @PreAuthorize("@securityAccess.canAccessStudent(authentication, #studentId)")
    public ResponseEntity<byte[]> downloadReportCard(@PathVariable Long studentId,
            @RequestParam(required = false) String academicYear) {
        try {
            byte[] pdfBytes = reportCardService.generateReportCard(studentId, academicYear);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "report-card-" + studentId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
