package com.campuscore.service;

import com.campuscore.dto.ResultDTO;
import java.util.List;
import java.util.Map;

public interface ResultService {
    void uploadResult(Map<String, Object> request);

    List<ResultDTO> getAllResults();

    List<ResultDTO> getStudentResults(Long studentId);

    void updateResult(Long id, Map<String, Object> request);

    void deleteResult(Long id);
}
