package com.schoolsync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "fees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String feeType; // Tuition, Library, Sports, Laboratory, Transport, Other

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate paidDate;

    @Column(nullable = false)
    private String status; // Pending, Paid, Overdue

    private String paymentMethod; // Cash, Card, UPI, NetBanking
    private String transactionId;
    private String receiptNumber; // Generated receipt number for paid fees
    private String remarks;
}
