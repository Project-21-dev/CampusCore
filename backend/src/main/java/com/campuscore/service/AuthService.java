package com.campuscore.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscore.dto.AuthResponse;
import com.campuscore.dto.LoginRequest;
import com.campuscore.dto.RegisterRequest;
import com.campuscore.entity.Role;
import com.campuscore.entity.Student;
import com.campuscore.entity.Teacher;
import com.campuscore.entity.User;
import com.campuscore.exception.ResourceAlreadyExistsException;
import com.campuscore.repository.StudentRepository;
import com.campuscore.repository.TeacherRepository;
import com.campuscore.repository.UserRepository;
import com.campuscore.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final com.campuscore.repository.ParentStudentRepository parentStudentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // Roles obtainable through public self-registration. Admin is
    // deliberately excluded — administrator accounts are provisioned
    // out-of-band and must never be reachable by sending a different
    // request body to this endpoint.
    private static final java.util.Set<Role> SELF_REGISTERABLE_ROLES =
            java.util.EnumSet.of(Role.Student, Role.Teacher, Role.Parent);

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, null, null, null, null, null, null, "Username already exists", false);
        }

        // Resolve and validate the requested role against the self-registration
        // allow-list before anything is persisted. The role is never trusted
        // as-is: an unknown value or a non-self-registerable role (e.g. Admin)
        // is rejected here rather than handed to Role.valueOf() further down.
        Role role;
        try {
            role = Role.valueOf(request.getRole());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new RuntimeException("Invalid role");
        }
        if (!SELF_REGISTERABLE_ROLES.contains(role)) {
            throw new RuntimeException(
                    "Role '" + request.getRole() + "' cannot self-register. Contact an administrator.");
        }

        if (request.getRole().equals("Student")) {

            if (studentRepository.existsByRollNo(request.getRollNo())) {
                throw new ResourceAlreadyExistsException(
                        "rollNo",
                        "Roll number already exists");
            }

            if (studentRepository.existsByPhone(request.getPhone())) {
                throw new ResourceAlreadyExistsException(
                        "phone",
                        "Phone number already exists");
            }
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user = userRepository.save(user);

        // Create Student or Teacher based on role
        Long studentId = null;
        Long teacherId = null;

        if (request.getRole().equals("Student")) {
            Student student = new Student();
            student.setUser(user);
            student.setRollNo(request.getRollNo());
            student.setClassName(request.getClassName());
            student.setEmail(request.getEmail());
            student.setPhone(request.getPhone());
            student = studentRepository.save(student);
            studentId = student.getStudentId();
        } else if (request.getRole().equals("Teacher")) {
            Teacher teacher = new Teacher();
            teacher.setUser(user);
            teacher.setEmail(request.getEmail());
            teacher.setPhone(request.getPhone());
            teacher.setSubject(request.getSubject());
            teacher = teacherRepository.save(teacher);
            teacherId = teacher.getTeacherId();
        } else if (request.getRole().equals("Parent")) {
            if (request.getChildRollNo() != null && !request.getChildRollNo().isBlank()) {
                Student child = studentRepository.findAll().stream()
                        .filter(s -> request.getChildRollNo().equalsIgnoreCase(s.getRollNo()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException(
                                "No student found with roll number " + request.getChildRollNo()));

                com.campuscore.entity.ParentStudent link = new com.campuscore.entity.ParentStudent();
                link.setParent(user);
                link.setStudent(child);
                link.setRelation(request.getRelation() != null && !request.getRelation().isBlank()
                        ? request.getRelation()
                        : "Guardian");
                link.setLinkedAt(java.time.LocalDateTime.now());
                parentStudentRepository.save(link);
            }
        }

        // Generate token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getRole().name(),
                user.getEmail(),
                studentId,
                teacherId,
                "Registration successful",
                true);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new AuthResponse(null, null, null, null, null, null, null, "Invalid credentials", false);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));
        } catch (AuthenticationException ex) {
            return new AuthResponse(null, null, null, null, null, null, null, "Invalid credentials", false);
        }

        Long studentId = null;
        Long teacherId = null;

        if (user.getStudent() != null) {
            studentId = user.getStudent().getStudentId();
        }
        if (user.getTeacher() != null) {
            teacherId = user.getTeacher().getTeacherId();
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getRole().name(),
                user.getEmail(),
                studentId,
                teacherId,
                "Login successful",
                true);
    }
}
