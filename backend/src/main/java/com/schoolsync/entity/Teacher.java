package com.schoolsync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teacherId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String subject;
    private String qualification;
    private String email;
    private String phone;
}
