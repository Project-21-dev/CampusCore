package com.schoolsync.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FeeDTO {
    private Long feeId;
    private Long studentId;
    private String studentName;
    private String feeType;
    private Double amount;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String status;
    private String paymentMethod;
    private String transactionId;
    private String receiptNumber;
    private String remarks;
}
