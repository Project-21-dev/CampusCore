package com.schoolsync.service;

import com.schoolsync.dto.EnrollmentDTO;
import java.util.List;
import java.util.Map;

public interface EnrollmentService {
    void createEnrollment(Map<String, Object> request);

    List<EnrollmentDTO> getAllEnrollments();

    void updateEnrollment(Long id, Map<String, Object> request);

    void deleteEnrollment(Long id);
}
