package com.campuscore.service;

import com.campuscore.dto.StudentDTO;
import com.campuscore.entity.*;
import com.campuscore.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeeRepository feeRepository;
    private final ResultRepository resultRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    @Override
    public List<StudentDTO> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        return students.stream()
                .map(student -> {
                    StudentDTO dto = modelMapper.map(student, StudentDTO.class);
                    if (student.getUser() != null) {
                        dto.setUsername(student.getUser().getUsername());
                    }
                    dto.setFullName(student.getDisplayName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
        StudentDTO dto = modelMapper.map(student, StudentDTO.class);
        if (student.getUser() != null) {
            dto.setUsername(student.getUser().getUsername());
        }
        dto.setFullName(student.getDisplayName());
        return dto;
    }

    @Override
    @Transactional
    public void createStudent(Map<String, String> request) {
        if (request.get("username") == null || request.get("username").isBlank()) {
            throw new RuntimeException("Username is required");
        }
        if (request.get("password") == null || request.get("password").isBlank()) {
            throw new RuntimeException("Password is required");
        }
        if (request.get("rollNo") == null || request.get("rollNo").isBlank()) {
            throw new RuntimeException("Roll number is required");
        }
        if (request.get("className") == null || request.get("className").isBlank()) {
            throw new RuntimeException("Class is required");
        }
        if (userRepository.existsByUsername(request.get("username"))) {
            throw new RuntimeException("Username already exists");
        }
        if (request.get("email") != null && !request.get("email").isBlank() && userRepository.existsByEmail(request.get("email"))) {
            throw new RuntimeException("Email is already registered");
        }
        if (studentRepository.existsByRollNo(request.get("rollNo"))) {
            throw new RuntimeException("Roll number already exists");
        }
        if (request.get("phone") != null && !request.get("phone").isBlank() && studentRepository.existsByPhone(request.get("phone"))) {
            throw new RuntimeException("Phone number already exists");
        }

        User user = new User();
        user.setUsername(request.get("username"));
        user.setPassword(passwordEncoder.encode(request.get("password")));
        user.setRole(Role.Student);
        user.setEmail(request.get("email"));
        user.setPhone(request.get("phone"));
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        String fullName = request.get("fullName");
        student.setFullName(fullName != null && !fullName.isBlank() ? fullName.trim() : request.get("username"));
        student.setRollNo(request.get("rollNo"));
        student.setClassName(request.get("className"));
        student.setEmail(request.get("email"));
        student.setPhone(request.get("phone"));
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public void updateStudent(Long id, Map<String, String> request) {
        Student student = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

        User user = student.getUser();
        if (user != null) {
            user.setUsername(request.get("username"));
            if (request.get("password") != null && !request.get("password").isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.get("password")));
            }
            user.setEmail(request.get("email"));
            user.setPhone(request.get("phone"));
            userRepository.save(user);
        }

        if (request.get("fullName") != null && !request.get("fullName").isBlank()) {
            student.setFullName(request.get("fullName").trim());
        }
        student.setRollNo(request.get("rollNo"));
        student.setClassName(request.get("className"));
        student.setEmail(request.get("email"));
        student.setPhone(request.get("phone"));
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        User studentUser = student.getUser();

        // A parent account can be linked to more than one child. Therefore,
        // deleting a Student removes only ParentStudent links and NEVER deletes
        // the Parent user account.
        List<ParentStudent> parentLinks = parentStudentRepository.findByStudentStudentId(id);
        if (!parentLinks.isEmpty()) {
            parentStudentRepository.deleteAll(parentLinks);
            parentStudentRepository.flush();
        }

        // Remove all rows that own a foreign key to students.student_id.
        List<Attendance> attendance = attendanceRepository.findByStudentStudentId(id);
        if (!attendance.isEmpty()) {
            attendanceRepository.deleteAll(attendance);
            attendanceRepository.flush();
        }

        List<Fee> fees = feeRepository.findByStudentStudentId(id);
        if (!fees.isEmpty()) {
            feeRepository.deleteAll(fees);
            feeRepository.flush();
        }

        List<Result> results = resultRepository.findByStudentStudentId(id);
        if (!results.isEmpty()) {
            resultRepository.deleteAll(results);
            resultRepository.flush();
        }

        enrollmentRepository.findByStudentStudentId(id).ifPresent(enrollmentRepository::delete);
        enrollmentRepository.flush();

        // Notifications reference the student's User row rather than Student.
        // Remove them before deleting the linked login account.
        if (studentUser != null) {
            List<Notification> notifications =
                    notificationRepository.findByUserUserIdOrderByCreatedAtDesc(studentUser.getUserId());
            if (!notifications.isEmpty()) {
                notificationRepository.deleteAll(notifications);
                notificationRepository.flush();
            }
        }

        // Delete the Student after every student_id dependency is gone.
        studentRepository.delete(student);
        studentRepository.flush();

        // Finally remove the Student login account. Parent accounts remain intact.
        if (studentUser != null && userRepository.existsById(studentUser.getUserId())) {
            userRepository.deleteById(studentUser.getUserId());
            userRepository.flush();
        }
    }

    @Override
    public Map<String, Object> getStudentProfile(Long id) {
        Student student = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

        Map<String, Object> response = new HashMap<>();

        // Student Info
        Map<String, Object> studentInfo = new HashMap<>();
        studentInfo.put("studentId", student.getStudentId());
        studentInfo.put("username", student.getUser().getUsername());
        studentInfo.put("fullName", student.getDisplayName());
        studentInfo.put("rollNo", student.getRollNo());
        studentInfo.put("className", student.getClassName());
        studentInfo.put("email", student.getEmail());
        studentInfo.put("phone", student.getPhone());
        response.put("student", studentInfo);

        // Enrollment Info
        Enrollment enrollment = enrollmentRepository.findByStudentStudentId(id).orElse(null);
        if (enrollment != null) {
            Map<String, Object> enrollmentInfo = new HashMap<>();
            enrollmentInfo.put("academicYear", enrollment.getAcademicYear());
            enrollmentInfo.put("className", enrollment.getClassName());
            enrollmentInfo.put("section", enrollment.getSection());
            enrollmentInfo.put("status", enrollment.getStatus());
            response.put("enrollment", enrollmentInfo);
        } else {
            response.put("enrollment", null);
        }

        // Attendance Info
        List<Attendance> attendanceList = attendanceRepository.findByStudentStudentId(id);
        long presentDays = attendanceList.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
        long totalDays = attendanceList.size();
        double percentage = totalDays > 0 ? (double) presentDays / totalDays * 100 : 0;

        Map<String, Object> attendanceInfo = new HashMap<>();
        attendanceInfo.put("percentage", Math.round(percentage * 10.0) / 10.0);
        attendanceInfo.put("presentDays", presentDays);
        attendanceInfo.put("totalDays", totalDays);
        response.put("attendance", attendanceInfo);

        // Fee Info
        List<Fee> fees = feeRepository.findByStudentStudentId(id);
        double totalFees = fees.stream().mapToDouble(Fee::getAmount).sum();
        double pendingFees = fees.stream()
                .filter(f -> !"Paid".equalsIgnoreCase(f.getStatus()))
                .mapToDouble(Fee::getAmount)
                .sum();

        Map<String, Object> feeInfo = new HashMap<>();
        feeInfo.put("total", totalFees);
        feeInfo.put("pending", pendingFees);
        response.put("fees", feeInfo);

        // Result Info
        List<Result> results = resultRepository.findByStudentStudentId(id);
        double averageMarks = results.stream().mapToDouble(Result::getMarks).average().orElse(0.0);

        Map<String, Object> resultInfo = new HashMap<>();
        resultInfo.put("averageMarks", Math.round(averageMarks * 10.0) / 10.0);
        resultInfo.put("count", results.size());
        response.put("results", resultInfo);

        return response;
    }

    @Override
    public List<String> getAllClassNames() {
        // Business logic: Fetch distinct class names from repository and return
        return studentRepository.findDistinctClassNames();
    }

    @Override
    public List<StudentDTO> getStudentsByClassName(String className) {
        // Business logic: Fetch students by class name and transform to DTOs
        List<Student> students = studentRepository.findByClassName(className);
        return students.stream()
                .map(student -> {
                    StudentDTO dto = modelMapper.map(student, StudentDTO.class);
                    if (student.getUser() != null) {
                        dto.setUsername(student.getUser().getUsername());
                    }
                    dto.setFullName(student.getDisplayName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> bulkImportStudents(org.springframework.web.multipart.MultipartFile file) {
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new java.util.ArrayList<>();

        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream()))) {

            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new RuntimeException("CSV file is empty");
            }

            // Expected header: username,password,email,phone,rollNo,className[,fullName]
            String line;
            int rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.isBlank())
                    continue;

                String[] cols = line.split(",", -1);
                if (cols.length < 6) {
                    failCount++;
                    errors.add("Row " + rowNum + ": expected 6 columns, found " + cols.length);
                    continue;
                }

                try {
                    String username = cols[0].trim();
                    String password = cols[1].trim();
                    String email = cols[2].trim();
                    String phone = cols[3].trim();
                    String rollNo = cols[4].trim();
                    String className = cols[5].trim();

                    if (userRepository.existsByUsername(username)) {
                        throw new RuntimeException("Username '" + username + "' already exists");
                    }
                    if (studentRepository.existsByRollNo(rollNo)) {
                        throw new RuntimeException("Roll number '" + rollNo + "' already exists");
                    }

                    User user = new User();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode(password.isBlank() ? "Student@123" : password));
                    user.setRole(Role.Student);
                    user.setEmail(email);
                    user.setPhone(phone);
                    user = userRepository.save(user);

                    Student student = new Student();
                    student.setUser(user);
                    String fullName = cols.length >= 7 && !cols[6].trim().isBlank() ? cols[6].trim() : username;
                    student.setFullName(fullName);
                    student.setRollNo(rollNo);
                    student.setClassName(className);
                    student.setEmail(email);
                    student.setPhone(phone);
                    studentRepository.save(student);

                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errors.add("Row " + rowNum + ": " + e.getMessage());
                }
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bulk import completed");
        response.put("successCount", successCount);
        response.put("failCount", failCount);
        if (!errors.isEmpty()) {
            response.put("errors", errors);
        }
        return response;
    }
}
