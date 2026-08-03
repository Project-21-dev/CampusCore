package com.schoolsync.service;

import com.schoolsync.dto.FeeDTO;
import com.schoolsync.entity.Fee;
import com.schoolsync.entity.Student;
import com.schoolsync.repository.FeeRepository;
import com.schoolsync.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
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
    private final ModelMapper modelMapper;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    @Override
    @Transactional
    public void createFee(Map<String, Object> request) {
        Long studentId = Long.valueOf(request.get("studentId").toString());
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Fee fee = new Fee();
        fee.setStudent(student);
        fee.setFeeType(request.get("feeType").toString());
        fee.setAmount(Double.valueOf(request.get("amount").toString()));
        fee.setDueDate(LocalDate.parse(request.get("dueDate").toString()));
        fee.setStatus(request.get("status").toString());

        if (request.get("paidDate") != null && !request.get("paidDate").toString().isEmpty()) {
            fee.setPaidDate(LocalDate.parse(request.get("paidDate").toString()));
        }
        if (request.get("paymentMethod") != null) {
            fee.setPaymentMethod(request.get("paymentMethod").toString());
        }
        if (request.get("transactionId") != null) {
            fee.setTransactionId(request.get("transactionId").toString());
        }
        if (request.get("remarks") != null) {
            fee.setRemarks(request.get("remarks").toString());
        }

        feeRepository.save(fee);
    }

    @Override
    public List<FeeDTO> getAllFees() {
        return feeRepository.findAll().stream()
                .map(f -> {
                    FeeDTO dto = modelMapper.map(f, FeeDTO.class);
                    dto.setStudentId(f.getStudent().getStudentId());
                    dto.setStudentName(f.getStudent().getUser().getUsername());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<FeeDTO> getStudentFees(Long studentId) {
        return feeRepository.findByStudentStudentId(studentId).stream()
                .map(f -> modelMapper.map(f, FeeDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateFee(Long id, Map<String, Object> request) {
        Fee fee = feeRepository.findById(id).orElseThrow(() -> new RuntimeException("Fee not found"));

        if (request.get("studentId") != null) {
            Long studentId = Long.valueOf(request.get("studentId").toString());
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            fee.setStudent(student);
        }

        if (request.get("feeType") != null)
            fee.setFeeType(request.get("feeType").toString());
        if (request.get("amount") != null)
            fee.setAmount(Double.valueOf(request.get("amount").toString()));
        if (request.get("dueDate") != null)
            fee.setDueDate(LocalDate.parse(request.get("dueDate").toString()));
        if (request.get("paidDate") != null && !request.get("paidDate").toString().isEmpty()) {
            fee.setPaidDate(LocalDate.parse(request.get("paidDate").toString()));
        }
        if (request.get("status") != null)
            fee.setStatus(request.get("status").toString());
        if (request.get("paymentMethod") != null)
            fee.setPaymentMethod(request.get("paymentMethod").toString());
        if (request.get("transactionId") != null)
            fee.setTransactionId(request.get("transactionId").toString());
        if (request.get("remarks") != null)
            fee.setRemarks(request.get("remarks").toString());

        feeRepository.save(fee);
    }

    @Override
    @Transactional
    public void payFee(Long id, Map<String, String> request) {
        Fee fee = feeRepository.findById(id).orElseThrow(() -> new RuntimeException("Fee not found"));

        fee.setStatus("Paid");
        fee.setPaidDate(LocalDate.now());
        fee.setPaymentMethod(request.get("paymentMethod"));
        if (request.get("transactionId") != null) {
            fee.setTransactionId(request.get("transactionId"));
        } else {
            fee.setTransactionId("TXN" + System.currentTimeMillis());
        }

        // Generate receipt number
        fee.setReceiptNumber("RCP-" + id + "-" + System.currentTimeMillis());

        feeRepository.save(fee);

        auditLogService.log("Fee", id, "PAY", "Admin",
                "Fee of " + fee.getAmount() + " marked Paid via " + fee.getPaymentMethod());
    }

    @Override
    @Transactional
    public void deleteFee(Long id) {
        feeRepository.deleteById(id);
        auditLogService.log("Fee", id, "DELETE", "Admin", "Fee record deleted");
    }

    @Override
    public int sendOverdueReminders() {
        List<Fee> overdue = feeRepository.findAll().stream()
                .filter(f -> !"Paid".equalsIgnoreCase(f.getStatus()))
                .collect(Collectors.toList());

        int sentCount = 0;
        for (Fee fee : overdue) {
            try {
                emailService.sendFeeReminderEmail(fee.getStudent(), fee.getFeeType(), fee.getAmount(),
                        fee.getDueDate());
                sentCount++;
            } catch (Exception e) {
                System.err.println("Failed to send fee reminder for fee " + fee.getFeeId() + ": " + e.getMessage());
            }
        }

        auditLogService.log("Fee", null, "REMIND_ALL", "Admin",
                "Sent " + sentCount + " overdue fee reminder emails");

        return sentCount;
    }

    @Override
    public void sendReminder(Long id) {
        Fee fee = feeRepository.findById(id).orElseThrow(() -> new RuntimeException("Fee not found"));
        emailService.sendFeeReminderEmail(fee.getStudent(), fee.getFeeType(), fee.getAmount(), fee.getDueDate());
        auditLogService.log("Fee", id, "REMIND", "Admin", "Sent reminder email for " + fee.getFeeType());
    }
}
