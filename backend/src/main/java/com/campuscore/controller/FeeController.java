package com.campuscore.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.campuscore.dto.FeeDTO;
import com.campuscore.service.FeeService;
import com.campuscore.service.FeeReceiptService;
import com.campuscore.service.RazorpayPaymentService;
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
public class FeeController {

    private final FeeService feeService;
    private final FeeReceiptService feeReceiptService;
    private final RazorpayPaymentService razorpayPaymentService;

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
    @PreAuthorize("@securityAccess.canAccessStudent(authentication, #studentId)")
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

    /**
     * Admin-only: records money that was received outside CampusCore
     * (cash, cheque, bank transfer, etc.).
     */
    @PutMapping("/pay/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> payFee(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            feeService.payFee(id, request);
            return ResponseEntity.ok(Map.of("message", "Offline payment recorded successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Student/Parent online-payment step 1: create a Razorpay order on the server.
     * Ownership is checked against the fee before the order can be created.
     */
    @PostMapping("/online/order/{id}")
    @PreAuthorize("hasAnyRole('Student','Parent') and @securityAccess.canAccessFee(authentication, #id)")
    public ResponseEntity<?> createOnlinePaymentOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(razorpayPaymentService.createOrder(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Student/Parent online-payment step 2: verify Razorpay signature and payment
     * details server-side. A fee is marked Paid only after successful verification.
     */
    @PostMapping("/online/verify/{id}")
    @PreAuthorize("hasAnyRole('Student','Parent') and @securityAccess.canAccessFee(authentication, #id)")
    public ResponseEntity<?> verifyOnlinePayment(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            razorpayPaymentService.verifyAndRecordPayment(id, request);
            return ResponseEntity.ok(Map.of("message", "Online payment verified and receipt generated"));
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
    @PreAuthorize("@securityAccess.canAccessFee(authentication, #id)")
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
