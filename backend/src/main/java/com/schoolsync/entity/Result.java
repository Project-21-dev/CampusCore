package com.schoolsync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private Double marks;

    @Column(nullable = false)
    private Double maxMarks = 100.0;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private String examType; 

    @Column(length = 500)
    private String remarks;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String uploadedBy; 

    public Double getPercentage() {
        return (marks / maxMarks) * 100;
    }

    @PrePersist
    @PreUpdate
    private void calculateGrade() {
        double percentage = getPercentage();
        if (percentage >= 90) {
            this.grade = "A+";
        } else if (percentage >= 80) {
            this.grade = "A";
        } else if (percentage >= 70) {
            this.grade = "B+";
        } else if (percentage >= 60) {
            this.grade = "B";
        } else if (percentage >= 50) {
            this.grade = "C+";
        } else if (percentage >= 40) {
            this.grade = "C";
        } else if (percentage >= 33) {
            this.grade = "D";
        } else {
            this.grade = "F";
        }
    }
}
