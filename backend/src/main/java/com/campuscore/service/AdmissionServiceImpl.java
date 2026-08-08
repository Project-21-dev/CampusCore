package com.campuscore.service;

import com.campuscore.dto.AdmissionDTO;
import com.campuscore.dto.AdmissionStatusUpdateDTO;
import com.campuscore.entity.Admission;
import com.campuscore.entity.Role;
import com.campuscore.entity.Student;
import com.campuscore.entity.User;
import com.campuscore.repository.AdmissionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AdmissionServiceImpl implements AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final ModelMapper modelMapper;
    private final EmailService emailService;
    private final com.campuscore.repository.StudentRepository studentRepository;
    private final com.campuscore.repository.UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
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
    public Map<String, Object> updateAdmissionStatus(Long id, AdmissionStatusUpdateDTO statusUpdate) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admission not found with ID: " + id));

        String previousStatus = admission.getStatus();
        admission.setStatus(statusUpdate.getStatus());
        admission.setRemarks(statusUpdate.getRemarks());

        auditLogService.log("Admission", id, "STATUS_CHANGE", "Admin",
                "Status changed from " + previousStatus + " to " + statusUpdate.getStatus());

        // If status is Approved, provision the Student + login exactly once.
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admission status updated successfully");

        boolean becomingApproved =
                "Approved".equalsIgnoreCase(statusUpdate.getStatus())
                        && !"Approved".equalsIgnoreCase(previousStatus);

        if (becomingApproved) {
            Map<String, Object> accountInfo = provisionStudentAccount(admission);
            response.putAll(accountInfo);
        } else if ("Approved".equalsIgnoreCase(statusUpdate.getStatus())) {
            response.put("studentAccountCreated", false);
            response.put("rollNumber", admission.getRollNumber());
            response.put("loginEmail", admission.getEmail());
            response.put("message", "Admission is already approved. Existing student account was left unchanged.");
        }

        admissionRepository.save(admission);
        return response;
    }

    /**
     * Creates the Student record and Student login when an admission becomes Approved.
     * The method is intentionally idempotent for already-provisioned admissions so that
     * saving the Approved status again does not create duplicate accounts.
     */
    private Map<String, Object> provisionStudentAccount(Admission admission) {
        Map<String, Object> accountInfo = new HashMap<>();

        // If this admission was already provisioned, keep the existing account unchanged.
        if (admission.getRollNumber() != null && studentRepository.existsByRollNo(admission.getRollNumber())) {
            accountInfo.put("studentAccountCreated", false);
            accountInfo.put("rollNumber", admission.getRollNumber());
            accountInfo.put("loginEmail", admission.getEmail());
            accountInfo.put("message", "Admission approved. Student account already exists.");
            return accountInfo;
        }

        // An email address is the login identifier in the existing CampusCore login flow.
        if (userRepository.findByEmail(admission.getEmail()).isPresent()) {
            throw new RuntimeException(
                    "An account already exists with admission email " + admission.getEmail()
                            + ". Use a different admission email or resolve the existing account before approval.");
        }

        String rollNumber = admission.getRollNumber();
        if (rollNumber == null || rollNumber.isBlank()) {
            rollNumber = generateUniqueRollNumber();
            admission.setRollNumber(rollNumber);
        }

        String username = generateUniqueStudentUsername(rollNumber);
        String temporaryPassword = generateTemporaryPassword();

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setRole(Role.Student);
        user.setEmail(admission.getEmail());
        user.setPhone(admission.getPhone());
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setFullName((admission.getFirstName() + " " + admission.getLastName()).trim());
        student.setRollNo(rollNumber);
        student.setClassName(admission.getAppliedClass());
        student.setEmail(admission.getEmail());
        student.setPhone(admission.getPhone());
        studentRepository.save(student);

        try {
            String applicantName = admission.getFirstName() + " " + admission.getLastName();
            emailService.sendAdmissionApprovalEmail(
                    admission.getEmail(),
                    applicantName,
                    rollNumber,
                    admission.getAppliedClass(),
                    admission.getEmail(),
                    temporaryPassword);
        } catch (Exception e) {
            // Account creation must not be rolled back only because SMTP is unavailable.
            System.err.println("Student account created, but approval email could not be sent: " + e.getMessage());
        }

        // Returned only in the approval response so Admin can complete a demo even when
        // a test/fake email address cannot receive mail. The password is NOT stored in plain text.
        accountInfo.put("studentAccountCreated", true);
        accountInfo.put("rollNumber", rollNumber);
        accountInfo.put("loginEmail", admission.getEmail());
        accountInfo.put("temporaryPassword", temporaryPassword);
        accountInfo.put("message", "Admission approved and student account created successfully");
        return accountInfo;
    }

    private String generateUniqueStudentUsername(String rollNumber) {
        String base = "student" + rollNumber;
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    private String generateTemporaryPassword() {
        final String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder("Cc@");
        for (int i = 0; i < 9; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
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
