package com.campuscore.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscore.dto.AuthResponse;
import com.campuscore.dto.ChangePasswordRequest;
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
        // Public signup must never allow users to self-assign privileged roles.
        // Student accounts are provisioned after admission approval and Teacher/Admin
        // accounts are created by an administrator. Only Parent remains public signup.
        if (request.getRole() == null || !"Parent".equalsIgnoreCase(request.getRole())) {
            return new AuthResponse(null, null, null, null, null, null, null, null,
                    "Only Parent accounts can be created from public registration. Student accounts are created after admission approval and Teacher accounts are created by Admin.", false);
        }

        // Login email and username must both identify one account unambiguously.
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, null, null, null, null, null, null, null, "Username already exists", false);
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, null, null, null, null, null, null, "Email is already registered", false);
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
            if (request.getChildRollNo() == null || request.getChildRollNo().isBlank()) {
                throw new RuntimeException("Child roll number is required for Parent registration");
            }

            String relation = request.getRelation() == null || request.getRelation().isBlank()
                    ? "Guardian"
                    : request.getRelation().trim();
            if (!java.util.Set.of("Father", "Mother", "Guardian").contains(relation)) {
                throw new RuntimeException("Relation must be Father, Mother or Guardian");
            }

            Student child = studentRepository.findByRollNo(request.getChildRollNo().trim())
                    .orElseThrow(() -> new RuntimeException(
                            "No student found with roll number " + request.getChildRollNo()));

            com.campuscore.entity.ParentStudent link = new com.campuscore.entity.ParentStudent();
            link.setParent(user);
            link.setStudent(child);
            link.setRelation(relation);
            link.setLinkedAt(java.time.LocalDateTime.now());
            parentStudentRepository.save(link);
        }

        // Generate token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        String displayName = user.getStudent() != null ? user.getStudent().getDisplayName() : user.getUsername();

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getRole().name(),
                user.getEmail(),
                studentId,
                teacherId,
                displayName,
                "Registration successful",
                true);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(null, null, null, null, null, null, null, null, "Invalid credentials", false);
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
        String displayName = user.getStudent() != null ? user.getStudent().getDisplayName() : user.getUsername();

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getRole().name(),
                user.getEmail(),
                studentId,
                teacherId,
                displayName,
                "Login successful",
                true);
    }
    @Transactional
    public java.util.Map<String, Object> changePassword(String authorizationHeader, ChangePasswordRequest request) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication is required");
        }

        String token = authorizationHeader.substring(7);
        String username;
        try {
            username = jwtUtil.extractUsername(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired authentication token");
        }

        if (!jwtUtil.validateToken(token, username)) {
            throw new RuntimeException("Invalid or expired authentication token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User account not found"));

        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 8
                || !newPassword.matches(".*[A-Z].*")
                || !newPassword.matches(".*[a-z].*")
                || !newPassword.matches(".*[0-9].*")
                || !newPassword.matches(".*[^A-Za-z0-9].*")) {
            throw new RuntimeException("New password must be at least 8 characters and include uppercase, lowercase, number and special character");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("New password and confirmation do not match");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from the current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return java.util.Map.of(
                "success", true,
                "message", "Password changed successfully"
        );
    }

}
