package com.schoolsync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "parent_students", uniqueConstraints = @UniqueConstraint(columnNames = { "parent_user_id",
        "student_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent_user_id", nullable = false)
    private User parent;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String relation; // Father, Mother, Guardian

    @Column(nullable = false)
    private LocalDateTime linkedAt;
}
