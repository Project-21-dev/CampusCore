package com.campuscore.service;

import com.campuscore.dto.AuthResponse;
import com.campuscore.dto.LoginRequest;
import com.campuscore.dto.RegisterRequest;
import com.campuscore.entity.ParentStudent;
import com.campuscore.entity.Role;
import com.campuscore.entity.Student;
import com.campuscore.entity.Teacher;
import com.campuscore.entity.User;
import com.campuscore.exception.ResourceAlreadyExistsException;
import com.campuscore.repository.ParentStudentRepository;
import com.campuscore.repository.StudentRepository;
import com.campuscore.repository.TeacherRepository;
import com.campuscore.repository.UserRepository;
import com.campuscore.util.JwtUtil;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AuthService}.
 * All collaborators are mocked; no Spring context is started and no database is used.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private ParentStudentRepository parentStudentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest baseStudentRequest;

    @BeforeEach
    void setUp() {
        baseStudentRequest = new RegisterRequest();
        baseStudentRequest.setUsername("newuser");
        baseStudentRequest.setPassword("Passw0rd!");
        baseStudentRequest.setRole("Student");
        baseStudentRequest.setEmail("newuser@campuscore.com");
        baseStudentRequest.setPhone("9876543210");
        baseStudentRequest.setRollNo("R100");
        baseStudentRequest.setClassName("10A");
    }

    // ---------- register() ----------

    @Test
    void shouldReturnFailureResponseWhenUsernameAlreadyExistsDuringRegister() {
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        AuthResponse response = authService.register(baseStudentRequest);

        assertFalse(response.isSuccess());
        assertEquals("Username already exists", response.getMessage());
        assertNull(response.getToken());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenRollNoAlreadyExistsForStudentRegistration() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(studentRepository.existsByRollNo("R100")).thenReturn(true);

        ResourceAlreadyExistsException ex = assertThrows(ResourceAlreadyExistsException.class,
                () -> authService.register(baseStudentRequest));

        assertEquals("rollNo", ex.getField());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenPhoneAlreadyExistsForStudentRegistration() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(studentRepository.existsByRollNo("R100")).thenReturn(false);
        when(studentRepository.existsByPhone("9876543210")).thenReturn(true);

        ResourceAlreadyExistsException ex = assertThrows(ResourceAlreadyExistsException.class,
                () -> authService.register(baseStudentRequest));

        assertEquals("phone", ex.getField());
    }

    @Test
    void shouldRegisterStudentSuccessfully() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(studentRepository.existsByRollNo("R100")).thenReturn(false);
        when(studentRepository.existsByPhone("9876543210")).thenReturn(false);
        when(passwordEncoder.encode("Passw0rd!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(1L);
            return u;
        });
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            s.setStudentId(10L);
            return s;
        });
        when(jwtUtil.generateToken("newuser", "Student")).thenReturn("jwt-token");

        AuthResponse response = authService.register(baseStudentRequest);

        assertTrue(response.isSuccess());
        assertEquals("jwt-token", response.getToken());
        assertEquals("Registration successful", response.getMessage());
        assertEquals(10L, response.getStudentId());
        assertNull(response.getTeacherId());
        verify(userRepository, times(1)).save(any(User.class));
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void shouldRegisterTeacherSuccessfully() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newteacher");
        request.setPassword("Passw0rd!");
        request.setRole("Teacher");
        request.setEmail("teacher@campuscore.com");
        request.setPhone("9876500000");
        request.setSubject("Mathematics");

        when(userRepository.existsByUsername("newteacher")).thenReturn(false);
        when(passwordEncoder.encode("Passw0rd!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(2L);
            return u;
        });
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(invocation -> {
            Teacher t = invocation.getArgument(0);
            t.setTeacherId(20L);
            return t;
        });
        when(jwtUtil.generateToken("newteacher", "Teacher")).thenReturn("jwt-token-teacher");

        AuthResponse response = authService.register(request);

        assertTrue(response.isSuccess());
        assertEquals(20L, response.getTeacherId());
        assertNull(response.getStudentId());
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    void shouldRegisterParentAndLinkChildSuccessfully() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newparent");
        request.setPassword("Passw0rd!");
        request.setRole("Parent");
        request.setEmail("parent@campuscore.com");
        request.setPhone("9876511111");
        request.setChildRollNo("R100");
        request.setRelation("Mother");

        Student child = new Student();
        child.setStudentId(10L);
        child.setRollNo("R100");

        when(userRepository.existsByUsername("newparent")).thenReturn(false);
        when(passwordEncoder.encode("Passw0rd!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(3L);
            return u;
        });
        when(studentRepository.findAll()).thenReturn(List.of(child));
        when(jwtUtil.generateToken("newparent", "Parent")).thenReturn("jwt-token-parent");

        AuthResponse response = authService.register(request);

        assertTrue(response.isSuccess());
        verify(parentStudentRepository, times(1)).save(any(ParentStudent.class));
    }

    @Test
    void shouldThrowExceptionWhenParentRegistersWithUnknownChildRollNo() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newparent2");
        request.setPassword("Passw0rd!");
        request.setRole("Parent");
        request.setEmail("parent2@campuscore.com");
        request.setPhone("9876522222");
        request.setChildRollNo("UNKNOWN");

        when(userRepository.existsByUsername("newparent2")).thenReturn(false);
        when(passwordEncoder.encode("Passw0rd!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.findAll()).thenReturn(List.of());

        assertThrows(RuntimeException.class, () -> authService.register(request));
        verify(parentStudentRepository, never()).save(any(ParentStudent.class));
    }

    // ---------- login() ----------

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() {
        LoginRequest request = new LoginRequest("student@campuscore.com", "Passw0rd!");

        User user = new User();
        user.setUserId(1L);
        user.setUsername("newuser");
        user.setPassword("encoded-password");
        user.setRole(Role.Student);
        user.setEmail("student@campuscore.com");

        when(userRepository.findByEmail("student@campuscore.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Passw0rd!", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken("newuser", "Student")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertTrue(response.isSuccess());
        assertEquals("jwt-token", response.getToken());
        assertEquals("Login successful", response.getMessage());
    }

    @Test
    void shouldReturnFailureResponseWhenLoginWithInvalidPassword() {
        LoginRequest request = new LoginRequest("student@campuscore.com", "wrong-password");

        User user = new User();
        user.setUsername("newuser");
        user.setPassword("encoded-password");
        user.setRole(Role.Student);

        when(userRepository.findByEmail("student@campuscore.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        AuthResponse response = authService.login(request);

        assertFalse(response.isSuccess());
        assertEquals("Invalid credentials", response.getMessage());
        assertNull(response.getToken());
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }

    @Test
    void shouldReturnFailureResponseWhenLoginWithNonExistentEmail() {
        LoginRequest request = new LoginRequest("missing@campuscore.com", "whatever");

        when(userRepository.findByEmail("missing@campuscore.com")).thenReturn(Optional.empty());

        AuthResponse response = authService.login(request);

        assertFalse(response.isSuccess());
        assertEquals("Invalid credentials", response.getMessage());
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }
}
