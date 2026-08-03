package com.schoolsync.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolsync.dto.AttendanceDTO;
import com.schoolsync.entity.Attendance;
import com.schoolsync.entity.Notification;
import com.schoolsync.entity.Student;
import com.schoolsync.repository.AttendanceRepository;
import com.schoolsync.repository.NotificationRepository;
import com.schoolsync.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public void markAttendance(Map<String, Object> request) {
        Long studentId = Long.valueOf(request.get("studentId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        String status = request.get("status").toString();

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Attendance attendance = attendanceRepository
                .findByStudentStudentIdAndDate(studentId, date)
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setStatus(status);

        attendanceRepository.save(attendance);

        if (status.equalsIgnoreCase("Absent")) {
            sendNotification(student, date, "ABSENCE");
        }
    }

    public boolean checkAttendanceExists(Map<String, Object> request) {
        Long studentId = Long.valueOf(request.get("studentId").toString());
        String dateStr = request.get("date").toString();
        LocalDate date = LocalDate.parse(dateStr);
        
        return attendanceRepository.existsByStudentStudentIdAndDate(studentId, date);
    }

    @Override
    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(a -> {
                    AttendanceDTO dto = modelMapper.map(a, AttendanceDTO.class);
                    dto.setStudentId(a.getStudent().getStudentId());
                    dto.setStudentName(a.getStudent().getUser().getUsername());
                    dto.setRollNo(a.getStudent().getRollNo());
                    dto.setClassName(a.getStudent().getClassName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDTO> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentStudentId(studentId).stream()
                .map(a -> modelMapper.map(a, AttendanceDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateAttendance(Long id, Map<String, Object> request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));

        Long studentId = Long.valueOf(request.get("studentId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        String status = request.get("status").toString();

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setStatus(status);

        attendanceRepository.save(attendance);

        if (status.equalsIgnoreCase("Absent")) {
            sendNotification(student, date, "ABSENCE_UPDATE");
        }
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
        attendanceRepository.delete(attendance);
    }

    private void sendNotification(Student student, java.time.LocalDate date, String type) {
        // only save notification if linked user exists (DB column is non-nullable)
        if (student.getUser() != null) {
            Notification notification = new Notification();
            notification.setUser(student.getUser());
            notification.setMessage(type.equals("ABSENCE") || type.equals("ABSENCE_UPDATE")
                    ? "You were marked Absent for " + (date != null ? date.toString() : "")
                    : "Notification");
            notification.setType(type);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);
        } else {
            System.err.println("Skipping notification persist: student has no linked user (studentId=" + student.getStudentId() + ")");
        }
        try {
            emailService.sendAbsentNotification(student, date);
        } catch (Exception e) {
            System.err.println("Email sending failed: " + e.getMessage());
        }
    }
}
