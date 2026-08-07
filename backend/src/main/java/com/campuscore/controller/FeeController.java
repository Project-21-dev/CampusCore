package com.campuscore.controller;

import com.campuscore.dto.FeeDTO;
import com.campuscore.service.FeeService;
import com.campuscore.service.FeeReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/studentmanagement/fee")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeeController {

    private final FeeService feeService;
    private final FeeReceiptService feeReceiptService;

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> createFee(@RequestBody Map<String, Object> request) {
        try {
            feeService.createFee(request);
            return ResponseEntity.ok(Map.of("message", "Fee created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<FeeDTO>> getAllFees() {
        return ResponseEntity.ok(feeService.getAllFees());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('Admin', 'Student')")
    public ResponseEntity<List<FeeDTO>> getStudentFees(@PathVariable Long studentId) {
        return ResponseEntity.ok(feeService.getStudentFees(studentId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateFee(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            feeService.updateFee(id, request);
            return ResponseEntity.ok(Map.of("message", "Fee updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/pay/{id}")
    @PreAuthorize("hasRole('Student')")
    public ResponseEntity<?> payFee(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            feeService.payFee(id, request);
            return ResponseEntity.ok(Map.of("message", "Fee paid successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> deleteFee(@PathVariable Long id) {
        feeService.deleteFee(id);
        return ResponseEntity.ok(Map.of("message", "Fee deleted successfully"));
    }

    @PostMapping("/remind/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> sendReminder(@PathVariable Long id) {
        try {
            feeService.sendReminder(id);
            return ResponseEntity.ok(Map.of("message", "Reminder email sent"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/remind-overdue")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> sendOverdueReminders() {
        int count = feeService.sendOverdueReminders();
        return ResponseEntity.ok(Map.of("message", "Reminders sent", "count", count));
    }

    @GetMapping("/receipt/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'Student')")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id) {
        try {
            byte[] pdfBytes = feeReceiptService.generateReceipt(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "fee-receipt-" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
