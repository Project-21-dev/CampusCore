package com.campuscore.service;

import com.campuscore.dto.AdmissionDTO;
import com.campuscore.dto.AdmissionStatusUpdateDTO;
import com.campuscore.entity.Admission;
import com.campuscore.repository.AdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdmissionServiceImpl implements AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final ModelMapper modelMapper;
    private final EmailService emailService;
    private final com.campuscore.repository.StudentRepository studentRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public Map<String, Object> applyAdmission(Admission admission) {
        String applicationNumber = "APP" + System.currentTimeMillis();
        admission.setApplicationNumber(applicationNumber);
        admission.setStatus("Pending");
        admission.setApplicationDate(LocalDateTime.now());

        admissionRepository.save(admission);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Application submitted successfully!");
        response.put("applicationNumber", applicationNumber);

        return response;
    }

    @Override
    public Map<String, Object> checkStatus(String email, String phone) {
        Admission admission = null;

        if (email != null && phone != null) {
            admission = admissionRepository.findByEmailAndPhone(email, phone).orElse(null);
        } else if (email != null) {
            admission = admissionRepository.findByEmail(email).orElse(null);
        } else if (phone != null) {
            admission = admissionRepository.findByPhone(phone).orElse(null);
        }

        if (admission == null) {
            throw new RuntimeException("No application found");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("applicationNumber", admission.getApplicationNumber());
        response.put("fullName", admission.getFirstName() + " " + admission.getLastName());
        response.put("appliedClass", admission.getAppliedClass());
        response.put("applicationDate", admission.getApplicationDate().toLocalDate().toString());
        response.put("status", admission.getStatus());
        response.put("remarks", admission.getRemarks());

        return response;
    }

    @Override
    public List<AdmissionDTO> getAllAdmissions() {
        return admissionRepository.findAll().stream()
                .map(a -> modelMapper.map(a, AdmissionDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateAdmission(Long id, Admission updatedAdmission) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found"));
        admission.setStatus(updatedAdmission.getStatus());
        admission.setRemarks(updatedAdmission.getRemarks());
        admissionRepository.save(admission);
    }

    @Override
    @Transactional
    public void deleteAdmission(Long id) {
        admissionRepository.deleteById(id);
    }

    @Override
    public AdmissionDTO getAdmissionById(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found with ID: " + id));
        return modelMapper.map(admission, AdmissionDTO.class);
    }

    @Override
    @Transactional
    public void updateAdmissionStatus(Long id, AdmissionStatusUpdateDTO statusUpdate) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found with ID: " + id));

        String previousStatus = admission.getStatus();
        admission.setStatus(statusUpdate.getStatus());
        admission.setRemarks(statusUpdate.getRemarks());

        auditLogService.log("Admission", id, "STATUS_CHANGE", "Admin",
                "Status changed from " + previousStatus + " to " + statusUpdate.getStatus());

        // If status is Approved, generate roll number and send email
        if ("Approved".equalsIgnoreCase(statusUpdate.getStatus())) {
            // Generate unique roll number
            String rollNumber = generateUniqueRollNumber();
            admission.setRollNumber(rollNumber);

            // Send approval email
            try {
                String applicantName = admission.getFirstName() + " " + admission.getLastName();
                emailService.sendAdmissionApprovalEmail(
                        admission.getEmail(),
                        applicantName,
                        rollNumber,
                        admission.getAppliedClass());
            } catch (Exception e) {
                System.err.println("Failed to send admission approval email: " + e.getMessage());
                // Don't fail the status update if email fails
            }
        }

        admissionRepository.save(admission);
    }

    /**
     * Generates a unique 4-digit roll number in format: YYXX
     * YY = last 2 digits of current year
     * XX = sequential number starting from 01
     */
    private String generateUniqueRollNumber() {
        // Get current year (last 2 digits)
        int currentYear = java.time.Year.now().getValue();
        String yearPrefix = String.valueOf(currentYear).substring(2);

        // Find the next available sequential number
        int sequentialNumber = 1;
        String rollNumber;

        do {
            rollNumber = yearPrefix + String.format("%02d", sequentialNumber);
            sequentialNumber++;

            // Safety check to prevent infinite loop
            if (sequentialNumber > 99) {
                throw new RuntimeException("Maximum roll numbers reached for year " + currentYear);
            }
        } while (studentRepository.existsByRollNo(rollNumber) || admissionRepository.existsByRollNumber(rollNumber));

        return rollNumber;
    }
}
