package com.campuscore.repository;

import com.campuscore.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByStudentStudentId(Long studentId);

    Optional<Attendance> findByStudentStudentIdAndDate(Long studentId, LocalDate date);

	boolean existsByStudentStudentIdAndDate(Long studentId, LocalDate date);

    long countByDate(LocalDate date);

    long countByDateAndStatus(LocalDate date, String status);

    // Analytics: total records + present count grouped by class
    @Query("SELECT a.student.className, COUNT(a), SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) " +
           "FROM Attendance a GROUP BY a.student.className ORDER BY a.student.className")
    List<Object[]> getAttendanceSummaryByClass();

    // Analytics: daily present/absent counts from a start date onward
    @Query("SELECT a.date, SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) " +
           "FROM Attendance a WHERE a.date >= :startDate GROUP BY a.date ORDER BY a.date")
    List<Object[]> getDailyAttendanceTrend(@Param("startDate") LocalDate startDate);

}
