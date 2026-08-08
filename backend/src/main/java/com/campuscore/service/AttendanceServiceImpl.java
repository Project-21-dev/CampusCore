package com.campuscore.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscore.dto.AttendanceDTO;
import com.campuscore.entity.Attendance;
import com.campuscore.entity.Notification;
import com.campuscore.entity.Student;
import com.campuscore.repository.AttendanceRepository;
import com.campuscore.repository.NotificationRepository;
import com.campuscore.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public void markAttendance(Map<String, Object> request) {

        Long studentId = Long.valueOf(
                request.get("studentId").toString()
        );

        LocalDate date = LocalDate.parse(
                request.get("date").toString()
        );

        String status =
                request.get("status").toString();

        Student student = studentRepository
                .findById(studentId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Student not found"
                        )
                );

        Attendance attendance = attendanceRepository
                .findByStudentStudentIdAndDate(
                        studentId,
                        date
                )
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setStatus(status);

        attendanceRepository.save(attendance);

        if ("Absent".equalsIgnoreCase(status)) {
            sendNotification(
                    student,
                    date,
                    "ABSENCE"
            );
        }
    }

    @Override
    public boolean checkAttendanceExists(
            Map<String, Object> request
    ) {

        Long studentId = Long.valueOf(
                request.get("studentId").toString()
        );

        LocalDate date = LocalDate.parse(
                request.get("date").toString()
        );

        return attendanceRepository
                .existsByStudentStudentIdAndDate(
                        studentId,
                        date
                );
    }

    @Override
    public List<AttendanceDTO> getAllAttendance() {

        return attendanceRepository
                .findAll()
                .stream()
                .map(this::toAttendanceDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDTO> getStudentAttendance(
            Long studentId
    ) {

        return attendanceRepository
                .findByStudentStudentId(studentId)
                .stream()
                .map(this::toAttendanceDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateAttendance(
            Long id,
            Map<String, Object> request
    ) {

        Attendance attendance = attendanceRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Attendance not found"
                        )
                );

        Long studentId = Long.valueOf(
                request.get("studentId").toString()
        );

        LocalDate date = LocalDate.parse(
                request.get("date").toString()
        );

        String status =
                request.get("status").toString();

        Student student = studentRepository
                .findById(studentId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Student not found"
                        )
                );

        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setStatus(status);

        attendanceRepository.save(attendance);

        if ("Absent".equalsIgnoreCase(status)) {
            sendNotification(
                    student,
                    date,
                    "ABSENCE_UPDATE"
            );
        }
    }

    @Override
    @Transactional
    public void deleteAttendance(Long id) {

        Attendance attendance = attendanceRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Attendance not found"
                        )
                );

        attendanceRepository.delete(attendance);
    }

    /**
     * Explicit Attendance -> AttendanceDTO mapping.
     *
     * We intentionally do not use ModelMapper here because
     * AttendanceDTO.studentName can ambiguously match:
     *
     * Student.className
     * Student.displayName
     * Student.fullName
     *
     * Explicit mapping avoids that configuration error.
     */
    private AttendanceDTO toAttendanceDTO(
            Attendance attendance
    ) {

        AttendanceDTO dto =
                new AttendanceDTO();

        dto.setAttendanceId(
                attendance.getAttendanceId()
        );

        dto.setDate(
                attendance.getDate()
        );

        dto.setStatus(
                attendance.getStatus()
        );

        Student student =
                attendance.getStudent();

        if (student != null) {

            dto.setStudentId(
                    student.getStudentId()
            );

            dto.setStudentName(
                    student.getDisplayName()
            );

            dto.setRollNo(
                    student.getRollNo()
            );

            dto.setClassName(
                    student.getClassName()
            );
        }

        return dto;
    }

    private void sendNotification(
            Student student,
            LocalDate date,
            String type
    ) {

        // Notification.user is non-nullable,
        // so persist only when Student has a linked User.
        if (student.getUser() != null) {

            Notification notification =
                    new Notification();

            notification.setUser(
                    student.getUser()
            );

            notification.setMessage(
                    "You were marked Absent for "
                            + (
                                date != null
                                    ? date.toString()
                                    : ""
                            )
            );

            notification.setType(type);

            notification.setCreatedAt(
                    LocalDateTime.now()
            );

            notification.setRead(false);

            notificationRepository.save(
                    notification
            );

        } else {

            System.err.println(
                    "Skipping notification persist: "
                            + "student has no linked user "
                            + "(studentId="
                            + student.getStudentId()
                            + ")"
            );
        }

        try {

            emailService.sendAbsentNotification(
                    student,
                    date
            );

        } catch (Exception e) {

            System.err.println(
                    "Email sending failed: "
                            + e.getMessage()
            );
        }
    }
}