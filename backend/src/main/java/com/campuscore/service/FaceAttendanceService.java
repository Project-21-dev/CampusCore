package com.campuscore.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.campuscore.dto.AttendanceSessionDTO;
import com.campuscore.dto.FaceVerificationResponse;
import com.campuscore.entity.AttendanceSession;
import com.campuscore.entity.Student;
import com.campuscore.repository.AttendanceRepository;
import com.campuscore.repository.AttendanceSessionRepository;
import com.campuscore.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FaceAttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final AttendanceService attendanceService;
    private final FaceVerificationClient faceVerificationClient;

    @Transactional
    public AttendanceSessionDTO createSession(String className, Integer durationMinutes) {
        if (className == null || className.isBlank()) {
            throw new RuntimeException("Class is required.");
        }

        int duration = durationMinutes == null ? 10 : Math.max(1, Math.min(durationMinutes, 60));
        LocalDate today = LocalDate.now();

        List<AttendanceSession> existing = sessionRepository
                .findByClassNameAndDateAndActiveTrue(className, today);
        existing.forEach(session -> session.setActive(false));
        sessionRepository.saveAll(existing);

        AttendanceSession session = new AttendanceSession();
        session.setToken(UUID.randomUUID().toString().replace("-", ""));
        session.setClassName(className);
        session.setDate(today);
        session.setStartedAt(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusMinutes(duration));
        session.setActive(true);

        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public AttendanceSessionDTO getActiveSessionForClass(String className) {
        List<AttendanceSession> sessions = sessionRepository
                .findByClassNameAndDateAndActiveTrue(className, LocalDate.now());

        for (AttendanceSession session : sessions) {
            if (session.getExpiresAt().isAfter(LocalDateTime.now())) {
                return toDto(session);
            }
            finalizeSession(session);
        }
        return null;
    }

    @Transactional
    public AttendanceSessionDTO getActiveSessionForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return getActiveSessionForClass(student.getClassName());
    }

    public FaceVerificationResponse enrollFace(Long studentId, List<MultipartFile> images) {
        studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return faceVerificationClient.enroll(studentId, images);
    }

    public Map<String, Object> enrollmentStatus(Long studentId) {
        studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return faceVerificationClient.enrollmentStatus(studentId);
    }

    @Transactional
    public Map<String, Object> checkIn(Long studentId, String sessionToken, MultipartFile image) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        AttendanceSession session = sessionRepository.findByToken(sessionToken)
                .orElseThrow(() -> new RuntimeException("Attendance session not found."));

        if (!session.isActive()) {
            throw new RuntimeException("Attendance session is closed.");
        }
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            finalizeSession(session);
            throw new RuntimeException("Attendance session has expired.");
        }
        if (!session.getDate().equals(LocalDate.now())) {
            throw new RuntimeException("Attendance session is not for today.");
        }
        if (!student.getClassName().equalsIgnoreCase(session.getClassName())) {
            throw new RuntimeException("This attendance session is for another class.");
        }
        if (attendanceRepository.existsByStudentStudentIdAndDate(studentId, session.getDate())) {
            throw new RuntimeException("Attendance is already recorded for today.");
        }

        FaceVerificationResponse verification = faceVerificationClient.verify(studentId, image);
        if (!verification.isVerified()) {
            throw new RuntimeException(
                    verification.getMessage() == null ? "Face verification failed." : verification.getMessage());
        }

        Map<String, Object> attendanceRequest = new HashMap<>();
        attendanceRequest.put("studentId", studentId);
        attendanceRequest.put("date", session.getDate().toString());
        attendanceRequest.put("status", "Present");
        attendanceService.markAttendance(attendanceRequest);

        return Map.of(
                "message", "Face verified. Attendance marked Present.",
                "status", "Present",
                "studentId", studentId,
                "score", verification.getScore());
    }

    @Transactional
    public AttendanceSessionDTO closeSession(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Attendance session not found."));
        finalizeSession(session);
        return toDto(session);
    }

    private void finalizeSession(AttendanceSession session) {
        if (!session.isActive()) {
            return;
        }

        List<Student> students = studentRepository.findByClassName(session.getClassName());
        for (Student student : students) {
            if (!attendanceRepository.existsByStudentStudentIdAndDate(student.getStudentId(), session.getDate())) {
                Map<String, Object> request = new HashMap<>();
                request.put("studentId", student.getStudentId());
                request.put("date", session.getDate().toString());
                request.put("status", "Absent");
                attendanceService.markAttendance(request);
            }
        }

        session.setActive(false);
        sessionRepository.save(session);
    }

    private AttendanceSessionDTO toDto(AttendanceSession session) {
        return new AttendanceSessionDTO(
                session.getSessionId(),
                session.getToken(),
                session.getClassName(),
                session.getDate(),
                session.getStartedAt(),
                session.getExpiresAt(),
                session.isActive());
    }
}
