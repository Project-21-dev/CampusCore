package com.campuscore.repository;

import com.campuscore.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudentStudentId(Long studentId);

    // Analytics: count + total amount grouped by fee status
    @Query("SELECT f.status, COUNT(f), SUM(f.amount) FROM Fee f GROUP BY f.status")
    List<Object[]> getFeeSummaryByStatus();

    @Query("SELECT SUM(f.amount) FROM Fee f WHERE f.status = 'Paid'")
    Double getTotalCollected();

    @Query("SELECT SUM(f.amount) FROM Fee f")
    Double getTotalFeeAmount();
}
