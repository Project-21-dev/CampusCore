package com.schoolsync.repository;

import com.schoolsync.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByRollNo(String rollNo);
    
    boolean existsByPhone(String phone);

    // Find all students by class name
    List<Student> findByClassName(String className);

    // Get all distinct class names
    @Query("SELECT DISTINCT s.className FROM Student s ORDER BY s.className")
    List<String> findDistinctClassNames();
}
