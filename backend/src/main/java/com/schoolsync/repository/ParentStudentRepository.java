package com.schoolsync.repository;

import com.schoolsync.entity.ParentStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentStudentRepository extends JpaRepository<ParentStudent, Long> {

    List<ParentStudent> findByParentUserId(Long parentUserId);

    List<ParentStudent> findByStudentStudentId(Long studentId);

    Optional<ParentStudent> findByParentUserIdAndStudentStudentId(Long parentUserId, Long studentId);

    boolean existsByParentUserIdAndStudentStudentId(Long parentUserId, Long studentId);
}
