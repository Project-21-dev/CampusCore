package com.campuscore.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campuscore.entity.AttendanceSession;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByToken(String token);
    List<AttendanceSession> findByClassNameAndDateAndActiveTrue(String className, LocalDate date);
}
