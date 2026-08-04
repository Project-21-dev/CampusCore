package com.campuscore.service;

import java.util.List;
import java.util.Map;

import com.campuscore.dto.AdmissionDTO;
import com.campuscore.dto.AdmissionStatusUpdateDTO;
import com.campuscore.entity.Admission;

public interface AdmissionService {
    Map<String, Object> applyAdmission(Admission admission);

    Map<String, Object> checkStatus(String email, String phone);

    List<AdmissionDTO> getAllAdmissions();
    
    AdmissionDTO getAdmissionById(Long id);
    
    void updateAdmissionStatus(Long id, AdmissionStatusUpdateDTO statusUpdate);


    void updateAdmission(Long id, Admission updatedAdmission);

    void deleteAdmission(Long id);
}
