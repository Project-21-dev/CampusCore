package com.schoolsync.service;

import com.schoolsync.dto.TeacherDTO;
import java.util.List;
import java.util.Map;

public interface TeacherService {
    List<TeacherDTO> getAllTeachers();

    TeacherDTO getTeacherById(Long id);

    void createTeacher(Map<String, String> request);

    void updateTeacher(Long id, Map<String, String> request);

    void deleteTeacher(Long id);

    Map<String, Object> getTeacherProfile(Long id);
}
