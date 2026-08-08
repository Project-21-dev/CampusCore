package com.campuscore.service;

import com.campuscore.dto.FeeDTO;
import com.campuscore.entity.Fee;
import com.campuscore.entity.Student;
import com.campuscore.repository.FeeRepository;
import com.campuscore.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeServiceImpl implements FeeService {

    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    @Override
    @Transactional
    public void createFee(Map<String, Object> request) {

        Long studentId = Long.valueOf(
                request.get("studentId").toString()
        );

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Fee fee = new Fee();

        fee.setStudent(student);
        fee.setFeeType(request.get("feeType").toString());
        double amount = Double.parseDouble(request.get("amount").toString());
        if (amount <= 0) {
            throw new RuntimeException("Fee amount must be greater than zero");
        }
        fee.setAmount(amount);
        fee.setDueDate(LocalDate.parse(request.get("dueDate").toString()));
        String requestedStatus = request.get("status") != null ? request.get("status").toString() : "Pending";
        if ("Paid".equalsIgnoreCase(requestedStatus)) {
            throw new RuntimeException("Use Record Payment to mark a fee as Paid");
        }
        fee.setStatus(requestedStatus);

        if (request.get("remarks") != null) {
            fee.setRemarks(
                    request.get("remarks").toString()
            );
        }

        feeRepository.save(fee);
    }

    @Override
    public List<FeeDTO> getAllFees() {

        return feeRepository.findAll()
                .stream()
                .map(this::toFeeDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeeDTO> getStudentFees(Long studentId) {

        return feeRepository.findByStudentStudentId(studentId)
                .stream()
                .map(this::toFeeDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateFee(Long id, Map<String, Object> request) {

        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if (request.get("studentId") != null) {

            Long studentId = Long.valueOf(
                    request.get("studentId").toString()
            );

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            fee.setStudent(student);
        }

        if (request.get("feeType") != null) {
            fee.setFeeType(request.get("feeType").toString());
        }

        if (request.get("amount") != null) {
            double amount = Double.parseDouble(request.get("amount").toString());
            if (amount <= 0) {
                throw new RuntimeException("Fee amount must be greater than zero");
            }
            fee.setAmount(amount);
        }

        if (request.get("dueDate") != null) {
            fee.setDueDate(
                    LocalDate.parse(request.get("dueDate").toString())
            );
        }

        if (request.get("paidDate") != null
                && !request.get("paidDate").toString().isEmpty()) {

            fee.setPaidDate(
                    LocalDate.parse(request.get("paidDate").toString())
            );
        }

        if (request.get("status") != null) {
            String requestedStatus = request.get("status") != null ? request.get("status").toString() : "Pending";
        if ("Paid".equalsIgnoreCase(requestedStatus)) {
            throw new RuntimeException("Use Record Payment to mark a fee as Paid");
        }
        fee.setStatus(requestedStatus);
        }

        if (request.get("paymentMethod") != null) {
            fee.setPaymentMethod(
                    request.get("paymentMethod").toString()
            );
        }

        if (request.get("transactionId") != null) {
            fee.setTransactionId(
                    request.get("transactionId").toString()
            );
        }

        if (request.get("remarks") != null) {
            fee.setRemarks(
                    request.get("remarks").toString()
            );
        }

        feeRepository.save(fee);
    }

    @Override
    @Transactional
    public void payFee(Long id, Map<String, String> request) {

        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if ("Paid".equalsIgnoreCase(fee.getStatus())) {
            throw new RuntimeException("This fee is already marked as Paid");
        }

        String paymentMethod = request.get("paymentMethod");
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new RuntimeException("Payment method is required");
        }
        if (!java.util.Set.of("Cash", "Cheque", "Bank Transfer", "Other").contains(paymentMethod)) {
            throw new RuntimeException("Only offline payment methods can be recorded here");
        }

        fee.setStatus("Paid");
        fee.setPaidDate(LocalDate.now());
        fee.setPaymentMethod(paymentMethod);

        String reference = request.get("transactionId");
        if (reference != null && !reference.isBlank()) {
            fee.setTransactionId(reference.trim());
        } else {
            fee.setTransactionId("OFFLINE-" + System.currentTimeMillis());
        }

        fee.setReceiptNumber(
                "RCP-" + id + "-" + System.currentTimeMillis()
        );

        feeRepository.save(fee);

        auditLogService.log(
                "Fee",
                id,
                "PAY",
                "Admin",
                "Fee of "
                        + fee.getAmount()
                        + " marked Paid via "
                        + fee.getPaymentMethod()
        );
    }

    @Override
    @Transactional
    public void deleteFee(Long id) {

        feeRepository.deleteById(id);

        auditLogService.log(
                "Fee",
                id,
                "DELETE",
                "Admin",
                "Fee record deleted"
        );
    }

    @Override
    public int sendOverdueReminders() {

        List<Fee> overdue = feeRepository.findAll()
                .stream()
                .filter(f -> !"Paid".equalsIgnoreCase(f.getStatus()))
                .filter(f -> f.getDueDate() != null && f.getDueDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());

        int sentCount = 0;

        for (Fee fee : overdue) {

            try {

                emailService.sendFeeReminderEmail(
                        fee.getStudent(),
                        fee.getFeeType(),
                        fee.getAmount(),
                        fee.getDueDate()
                );

                sentCount++;

            } catch (Exception e) {

                System.err.println(
                        "Failed to send fee reminder for fee "
                                + fee.getFeeId()
                                + ": "
                                + e.getMessage()
                );
            }
        }

        auditLogService.log(
                "Fee",
                null,
                "REMIND_ALL",
                "Admin",
                "Sent "
                        + sentCount
                        + " overdue fee reminder emails"
        );

        return sentCount;
    }

    @Override
    public void sendReminder(Long id) {

        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        emailService.sendFeeReminderEmail(
                fee.getStudent(),
                fee.getFeeType(),
                fee.getAmount(),
                fee.getDueDate()
        );

        auditLogService.log(
                "Fee",
                id,
                "REMIND",
                "Admin",
                "Sent reminder email for "
                        + fee.getFeeType()
        );
    }

    private FeeDTO toFeeDTO(Fee fee) {

        FeeDTO dto = new FeeDTO();

        dto.setFeeId(fee.getFeeId());
        dto.setFeeType(fee.getFeeType());
        dto.setAmount(fee.getAmount());
        dto.setDueDate(fee.getDueDate());
        dto.setPaidDate(fee.getPaidDate());
        dto.setStatus(fee.getStatus());
        dto.setPaymentMethod(fee.getPaymentMethod());
        dto.setTransactionId(fee.getTransactionId());
        dto.setReceiptNumber(fee.getReceiptNumber());
        dto.setRemarks(fee.getRemarks());

        if (fee.getStudent() != null) {

            Student student = fee.getStudent();

            dto.setStudentId(
                    student.getStudentId()
            );

            dto.setStudentName(
                    student.getDisplayName()
            );
        }

        return dto;
    }
}