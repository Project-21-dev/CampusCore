package com.campuscore.repository;

import com.campuscore.entity.Result;
import com.campuscore.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    
    // Find results by student ID
    List<Result> findByStudentStudentId(Long studentId);
    
    // Find results by student
    List<Result> findByStudent(Student student);
    
    // Find results by subject
    List<Result> findBySubject(String subject);
    
    // Find results by exam type
    List<Result> findByExamType(String examType);
    
    // Find results by academic year
    List<Result> findByAcademicYear(String academicYear);
    
    // Find results by student and subject
    List<Result> findByStudentAndSubject(Student student, String subject);
    
    // Check if result exists for duplicate prevention
    boolean existsByStudentAndSubjectAndExamTypeAndAcademicYear(
            Student student, String subject, String examType, String academicYear);
    
    // Find results by student and academic year
    List<Result> findByStudentAndAcademicYear(Student student, String academicYear);
    
    // Find results by student, subject, and academic year
    List<Result> findByStudentAndSubjectAndAcademicYear(
            Student student, String subject, String academicYear);

    // Analytics: average percentage + total results grouped by class
    @Query("SELECT r.student.className, AVG(r.marks / r.maxMarks * 100), COUNT(r) " +
           "FROM Result r GROUP BY r.student.className ORDER BY r.student.className")
    List<Object[]> getPerformanceByClass();
}
