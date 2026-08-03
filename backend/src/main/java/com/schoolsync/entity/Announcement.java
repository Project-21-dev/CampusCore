package com.schoolsync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long announcementId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    // All, Admin, Teacher, Student, Parent
    @Column(nullable = false)
    private String targetRole;

    // Optional: restrict to a specific class (e.g. "10-A"); null/blank means all classes
    private String targetClassName;

    @Column(nullable = false)
    private String priority; // Normal, Important, Urgent

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
