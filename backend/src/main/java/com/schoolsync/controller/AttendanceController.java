package com.schoolsync.controller;

import com.schoolsync.dto.AttendanceDTO;
import com.schoolsync.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

//    @PostMapping("/mark")
//    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> request) {
//        try {
//            if (attendanceService.hasAttendanceBeenMarked(request)) {
//    throw new RuntimeException("Attendance already marked for today.");
//}
//attendanceService.markAttendance(request);
//            return ResponseEntity.ok(Map.of("message", "Attendance marked successfully"));
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
//        }
//    }

    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> request) {
        try {
            // Check if attendance already exists
            boolean exists = attendanceService.checkAttendanceExists(request);
            if (exists) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Attendance already marked for this student on this date"));
            }
            
            attendanceService.markAttendance(request);
            return ResponseEntity.ok(Map.of("message", "Attendance marked successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }//
    @GetMapping("/all")
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            attendanceService.updateAttendance(id, request);
            return ResponseEntity.ok(Map.of("message", "Attendance updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.ok(Map.of("message", "Attendance deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
