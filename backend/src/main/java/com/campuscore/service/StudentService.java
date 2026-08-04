package com.campuscore.service;

import com.campuscore.dto.StudentDTO;
import java.util.List;
import java.util.Map;

public interface StudentService {
    List<StudentDTO> getAllStudents();

    StudentDTO getStudentById(Long id);

    void createStudent(Map<String, String> request);

    void updateStudent(Long id, Map<String, String> request);

    void deleteStudent(Long id);

    Map<String, Object> getStudentProfile(Long id);

    // New methods for class-based filtering
    List<String> getAllClassNames();

    List<StudentDTO> getStudentsByClassName(String className);

    Map<String, Object> bulkImportStudents(org.springframework.web.multipart.MultipartFile file);
}
