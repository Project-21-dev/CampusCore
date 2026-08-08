package com.campuscore.repository;

import com.campuscore.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByRollNo(String rollNo);
    
    boolean existsByPhone(String phone);

    Optional<Student> findByRollNo(String rollNo);

    // Find all students by class name
    List<Student> findByClassName(String className);

    // Get all distinct class names
    @Query("SELECT DISTINCT s.className FROM Student s ORDER BY s.className")
    List<String> findDistinctClassNames();
}
