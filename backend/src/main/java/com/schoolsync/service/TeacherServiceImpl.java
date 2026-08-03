package com.schoolsync.service;

import com.schoolsync.dto.TeacherDTO;
import com.schoolsync.entity.Role;
import com.schoolsync.entity.Teacher;
import com.schoolsync.entity.User;
import com.schoolsync.repository.TeacherRepository;
import com.schoolsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    @Override
    public List<TeacherDTO> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        return teachers.stream()
                .map(teacher -> {
                    TeacherDTO dto = modelMapper.map(teacher, TeacherDTO.class);
                    if (teacher.getUser() != null) {
                        dto.setUsername(teacher.getUser().getUsername());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public TeacherDTO getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found"));
        TeacherDTO dto = modelMapper.map(teacher, TeacherDTO.class);
        if (teacher.getUser() != null) {
            dto.setUsername(teacher.getUser().getUsername());
        }
        return dto;
    }

    @Override
    @Transactional
    public void createTeacher(Map<String, String> request) {
        if (userRepository.existsByUsername(request.get("username"))) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.get("username"));
        user.setPassword(passwordEncoder.encode(request.get("password")));
        user.setRole(Role.Teacher);
        user.setEmail(request.get("email"));
        user.setPhone(request.get("phone"));
        user = userRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setSubject(request.get("subject"));
        teacher.setEmail(request.get("email"));
        teacher.setPhone(request.get("phone"));
        teacherRepository.save(teacher);
    }

    @Override
    @Transactional
    public void updateTeacher(Long id, Map<String, String> request) {
        Teacher teacher = teacherRepository.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found"));

        User user = teacher.getUser();
        if (user != null) {
            // Only update username if provided
            if (request.get("username") != null && !request.get("username").isEmpty()) {
                user.setUsername(request.get("username"));
            }
            // Only update password if provided
            if (request.get("password") != null && !request.get("password").isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.get("password")));
            }
            // Update email and phone in User entity if provided
            if (request.get("email") != null) {
                user.setEmail(request.get("email"));
            }
            if (request.get("phone") != null) {
                user.setPhone(request.get("phone"));
            }
            userRepository.save(user);
        }

        // Update teacher-specific fields
        if (request.get("subject") != null) {
            teacher.setSubject(request.get("subject"));
        }
        if (request.get("qualification") != null) {
            teacher.setQualification(request.get("qualification"));
        }
        if (request.get("email") != null) {
            teacher.setEmail(request.get("email"));
        }
        if (request.get("phone") != null) {
            teacher.setPhone(request.get("phone"));
        }
        teacherRepository.save(teacher);
    }

    @Override
    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found"));
        User user = teacher.getUser();
        teacherRepository.delete(teacher);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Override
    public Map<String, Object> getTeacherProfile(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Map<String, Object> response = new java.util.HashMap<>();

        // Teacher Info
        Map<String, Object> teacherInfo = new java.util.HashMap<>();
        teacherInfo.put("teacherId", teacher.getTeacherId());
        teacherInfo.put("username", teacher.getUser().getUsername());
        teacherInfo.put("subject", teacher.getSubject());
        teacherInfo.put("qualification", teacher.getQualification());
        teacherInfo.put("email", teacher.getEmail());
        teacherInfo.put("phone", teacher.getPhone());
        response.put("teacher", teacherInfo);

        // Additional stats can be added here in the future
        // For now, we'll keep it simple with basic information
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("status", "Active");
        response.put("stats", stats);

        return response;
    }
}
