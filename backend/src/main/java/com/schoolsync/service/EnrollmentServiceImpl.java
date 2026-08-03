package com.schoolsync.service;

import com.schoolsync.dto.EnrollmentDTO;
import com.schoolsync.entity.Enrollment;
import com.schoolsync.entity.Student;
import com.schoolsync.repository.EnrollmentRepository;
import com.schoolsync.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public void createEnrollment(Map<String, Object> request) {
        Long studentId = Long.valueOf(request.get("studentId").toString());
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setAcademicYear(request.get("academicYear").toString());
        enrollment.setClassName(request.get("className").toString());
        enrollment.setSection(request.get("section").toString());
        enrollment.setEnrollmentDate(LocalDate.parse(request.get("enrollmentDate").toString()));
        enrollment.setStatus(request.get("status").toString());
        if (request.get("remarks") != null) {
            enrollment.setRemarks(request.get("remarks").toString());
        }

        enrollmentRepository.save(enrollment);
    }

    @Override
    public List<EnrollmentDTO> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(e -> {
                    EnrollmentDTO dto = modelMapper.map(e, EnrollmentDTO.class);
                    dto.setStudentId(e.getStudent().getStudentId());
                    dto.setStudentName(e.getStudent().getUser().getUsername());
                    dto.setRollNo(e.getStudent().getRollNo());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateEnrollment(Long id, Map<String, Object> request) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (request.get("studentId") != null) {
            Long studentId = Long.valueOf(request.get("studentId").toString());
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            enrollment.setStudent(student);
        }

        if (request.get("academicYear") != null)
            enrollment.setAcademicYear(request.get("academicYear").toString());
        if (request.get("className") != null)
            enrollment.setClassName(request.get("className").toString());
        if (request.get("section") != null)
            enrollment.setSection(request.get("section").toString());
        if (request.get("enrollmentDate") != null)
            enrollment.setEnrollmentDate(LocalDate.parse(request.get("enrollmentDate").toString()));
        if (request.get("status") != null)
            enrollment.setStatus(request.get("status").toString());
        if (request.get("remarks") != null)
            enrollment.setRemarks(request.get("remarks").toString());

        enrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional
    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }
}
