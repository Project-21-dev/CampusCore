package com.schoolsync.service;

import com.schoolsync.dto.AttendanceDTO;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
    void markAttendance(Map<String, Object> request);

    List<AttendanceDTO> getAllAttendance();

    List<AttendanceDTO> getStudentAttendance(Long studentId);

    void updateAttendance(Long id, Map<String, Object> request);

    void deleteAttendance(Long id);

	boolean checkAttendanceExists(Map<String, Object> request);
}
