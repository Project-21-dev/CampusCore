package com.schoolsync.service;

import com.schoolsync.dto.FeeDTO;
import java.util.List;
import java.util.Map;

public interface FeeService {
    void createFee(Map<String, Object> request);

    List<FeeDTO> getAllFees();

    List<FeeDTO> getStudentFees(Long studentId);

    void updateFee(Long id, Map<String, Object> request);

    void payFee(Long id, Map<String, String> request);

    void deleteFee(Long id);

    int sendOverdueReminders();

    void sendReminder(Long id);
}
