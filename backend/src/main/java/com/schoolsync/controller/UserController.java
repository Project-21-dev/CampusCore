package com.schoolsync.controller;

import com.schoolsync.dto.StudentDTO;
import com.schoolsync.dto.TeacherDTO;
import com.schoolsync.service.StudentService;
import com.schoolsync.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studentService.getStudentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, String> request) {
        try {
            studentService.createStudent(request);
            return ResponseEntity.ok(Map.of("message", "Student created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            studentService.updateStudent(id, request);
            return ResponseEntity.ok(Map.of("message", "Student updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }



    @PostMapping("/students/bulk-import")
    public ResponseEntity<?> bulkImportStudents(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            return ResponseEntity.ok(studentService.bulkImportStudents(file));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/classes")
    public ResponseEntity<List<String>> getAllClasses() {
        return ResponseEntity.ok(studentService.getAllClassNames());
    }

    @GetMapping("/students/class/{className}")
    public ResponseEntity<List<StudentDTO>> getStudentsByClass(@PathVariable String className) {
        return ResponseEntity.ok(studentService.getStudentsByClassName(className));
    }



    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(teacherService.getTeacherById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/teachers")
    public ResponseEntity<?> createTeacher(@RequestBody Map<String, String> request) {
        try {
            teacherService.createTeacher(request);
            return ResponseEntity.ok(Map.of("message", "Teacher created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            teacherService.updateTeacher(id, request);
            return ResponseEntity.ok(Map.of("message", "Teacher updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        try {
            teacherService.deleteTeacher(id);
            return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
