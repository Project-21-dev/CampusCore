package com.campuscore.repository;

import com.campuscore.entity.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    Optional<Admission> findByEmailAndPhone(String email, String phone);

    Optional<Admission> findByEmail(String email);

    Optional<Admission> findByPhone(String phone);

    boolean existsByRollNumber(String rollNumber);

    long countByStatus(String status);

    // Analytics: admission funnel counts grouped by status
    @Query("SELECT a.status, COUNT(a) FROM Admission a GROUP BY a.status")
    List<Object[]> getAdmissionCountsByStatus();
}
