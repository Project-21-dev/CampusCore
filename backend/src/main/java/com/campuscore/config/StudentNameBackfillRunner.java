package com.campuscore.config;

import com.campuscore.entity.Student;
import com.campuscore.repository.AdmissionRepository;
import com.campuscore.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class StudentNameBackfillRunner implements ApplicationRunner {

    private final StudentRepository studentRepository;
    private final AdmissionRepository admissionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (Student student : studentRepository.findAll()) {
            if (student.getFullName() != null && !student.getFullName().isBlank()) {
                continue;
            }
            if (student.getEmail() == null || student.getEmail().isBlank()) {
                continue;
            }
            admissionRepository.findByEmail(student.getEmail()).ifPresent(admission -> {
                String name = ((admission.getFirstName() == null ? "" : admission.getFirstName()) + " "
                        + (admission.getLastName() == null ? "" : admission.getLastName())).trim();
                if (!name.isBlank()) {
                    student.setFullName(name);
                    studentRepository.save(student);
                }
            });
        }
    }
}
