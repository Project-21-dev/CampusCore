package com.campuscore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String rollNo;

    @Column(nullable = false)
    private String className;

    @Column(length = 150)
    private String fullName;

    private String email;
    private String phone;

    @Transient
    public String getDisplayName() {
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim();
        }
        if (user != null && user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return rollNo != null ? rollNo : "Student";
    }
}

