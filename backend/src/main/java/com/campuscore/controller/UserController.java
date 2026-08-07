package com.campuscore.controller;

import com.campuscore.dto.StudentDTO;
import com.campuscore.dto.TeacherDTO;
import com.campuscore.service.StudentService;
import com.campuscore.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final StudentService studentService;
    private final TeacherService teacherService;

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/students/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studentService.getStudentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/students")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, String> request) {
        try {
            studentService.createStudent(request);
            return ResponseEntity.ok(Map.of("message", "Student created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            studentService.updateStudent(id, request);
            return ResponseEntity.ok(Map.of("message", "Student updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }



    @PostMapping("/students/bulk-import")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> bulkImportStudents(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            return ResponseEntity.ok(studentService.bulkImportStudents(file));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/classes")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<List<String>> getAllClasses() {
        return ResponseEntity.ok(studentService.getAllClassNames());
    }

    @GetMapping("/students/class/{className}")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<List<StudentDTO>> getStudentsByClass(@PathVariable String className) {
        return ResponseEntity.ok(studentService.getStudentsByClassName(className));
    }



    @GetMapping("/teachers")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @GetMapping("/teachers/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(teacherService.getTeacherById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/teachers")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> createTeacher(@RequestBody Map<String, String> request) {
        try {
            teacherService.createTeacher(request);
            return ResponseEntity.ok(Map.of("message", "Teacher created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Admin manages teachers here; a Teacher also hits this same endpoint to
    // save their own profile edits from TeacherProfile.jsx.
    @PutMapping("/teachers/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'Teacher')")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            teacherService.updateTeacher(id, request);
            return ResponseEntity.ok(Map.of("message", "Teacher updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/teachers/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        try {
            teacherService.deleteTeacher(id);
            return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
