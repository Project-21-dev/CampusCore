package com.campuscore.service;

import com.campuscore.dto.StudentDTO;
import com.campuscore.entity.Role;
import com.campuscore.entity.Student;
import com.campuscore.entity.User;
import com.campuscore.repository.AttendanceRepository;
import com.campuscore.repository.EnrollmentRepository;
import com.campuscore.repository.FeeRepository;
import com.campuscore.repository.ResultRepository;
import com.campuscore.repository.StudentRepository;
import com.campuscore.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link StudentServiceImpl}.
 * All collaborators are mocked; no Spring context is started and no database is used.
 */
@ExtendWith(MockitoExtension.class)
class StudentServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private FeeRepository feeRepository;

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private StudentServiceImpl studentService;

    private Student buildStudent(Long id, String rollNo, String className, String username) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);
        user.setRole(Role.Student);

        Student student = new Student();
        student.setStudentId(id);
        student.setRollNo(rollNo);
        student.setClassName(className);
        student.setEmail(username + "@campuscore.com");
        student.setPhone("9876543210");
        student.setUser(user);
        return student;
    }

    // ---------- getStudentById() ----------

    @Test
    void shouldReturnStudentWhenIdExists() {
        Student student = buildStudent(1L, "R100", "10A", "alice");
        StudentDTO dto = new StudentDTO(1L, null, "R100", "10A", student.getEmail(), student.getPhone());

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(modelMapper.map(eq(student), eq(StudentDTO.class))).thenReturn(dto);

        StudentDTO result = studentService.getStudentById(1L);

        assertEquals("R100", result.getRollNo());
        assertEquals("alice", result.getUsername());
    }

    @Test
    void shouldThrowExceptionWhenStudentNotFound() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> studentService.getStudentById(99L));
        assertEquals("Student not found", ex.getMessage());
    }

    // ---------- getAllStudents() ----------

    @Test
    void shouldReturnAllStudents() {
        Student s1 = buildStudent(1L, "R100", "10A", "alice");
        Student s2 = buildStudent(2L, "R101", "10B", "bob");
        StudentDTO dto1 = new StudentDTO(1L, null, "R100", "10A", s1.getEmail(), s1.getPhone());
        StudentDTO dto2 = new StudentDTO(2L, null, "R101", "10B", s2.getEmail(), s2.getPhone());

        when(studentRepository.findAll()).thenReturn(List.of(s1, s2));
        when(modelMapper.map(eq(s1), eq(StudentDTO.class))).thenReturn(dto1);
        when(modelMapper.map(eq(s2), eq(StudentDTO.class))).thenReturn(dto2);

        List<StudentDTO> result = studentService.getAllStudents();

        assertEquals(2, result.size());
        assertEquals("alice", result.get(0).getUsername());
        assertEquals("bob", result.get(1).getUsername());
    }

    // ---------- createStudent() ----------

    @Test
    void shouldCreateStudentSuccessfully() {
        Map<String, String> request = new HashMap<>();
        request.put("username", "charlie");
        request.put("password", "Passw0rd!");
        request.put("email", "charlie@campuscore.com");
        request.put("phone", "9876500001");
        request.put("rollNo", "R200");
        request.put("className", "9A");

        when(userRepository.existsByUsername("charlie")).thenReturn(false);
        when(passwordEncoder.encode("Passw0rd!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        studentService.createStudent(request);

        verify(userRepository, times(1)).save(any(User.class));
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void shouldThrowExceptionWhenCreatingStudentWithDuplicateUsername() {
        Map<String, String> request = new HashMap<>();
        request.put("username", "existinguser");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> studentService.createStudent(request));
        assertEquals("Username already exists", ex.getMessage());
        verify(studentRepository, never()).save(any(Student.class));
    }

    // ---------- updateStudent() ----------

    @Test
    void shouldUpdateStudentSuccessfully() {
        Student existing = buildStudent(1L, "R100", "10A", "alice");

        Map<String, String> request = new HashMap<>();
        request.put("username", "alice-updated");
        request.put("password", "");
        request.put("email", "alice-updated@campuscore.com");
        request.put("phone", "9876500099");
        request.put("rollNo", "R100-U");
        request.put("className", "10B");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        studentService.updateStudent(1L, request);

        assertEquals("R100-U", existing.getRollNo());
        assertEquals("10B", existing.getClassName());
        assertEquals("alice-updated", existing.getUser().getUsername());
        verify(userRepository, times(1)).save(existing.getUser());
        verify(studentRepository, times(1)).save(existing);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentStudent() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentService.updateStudent(99L, new HashMap<>()));
    }

    // ---------- deleteStudent() ----------

    @Test
    void shouldDeleteStudentSuccessfully() {
        Student existing = buildStudent(1L, "R100", "10A", "alice");
        when(studentRepository.findById(1L)).thenReturn(Optional.of(existing));

        studentService.deleteStudent(1L);

        verify(studentRepository, times(1)).delete(existing);
        verify(userRepository, times(1)).delete(existing.getUser());
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentStudent() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentService.deleteStudent(99L));
        verify(studentRepository, never()).delete(any(Student.class));
    }

    // ---------- class name business rules ----------

    @Test
    void shouldReturnStudentsByClassName() {
        Student student = buildStudent(1L, "R100", "10A", "alice");
        StudentDTO dto = new StudentDTO(1L, null, "R100", "10A", student.getEmail(), student.getPhone());

        when(studentRepository.findByClassName("10A")).thenReturn(List.of(student));
        when(modelMapper.map(eq(student), eq(StudentDTO.class))).thenReturn(dto);

        List<StudentDTO> result = studentService.getStudentsByClassName("10A");

        assertEquals(1, result.size());
        assertEquals("10A", result.get(0).getClassName());
    }

    @Test
    void shouldReturnAllClassNames() {
        when(studentRepository.findDistinctClassNames()).thenReturn(List.of("10A", "10B", "9A"));

        List<String> result = studentService.getAllClassNames();

        assertEquals(3, result.size());
        assertTrue(result.contains("10A"));
    }
}
