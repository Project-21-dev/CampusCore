package com.campuscore.service;

import com.campuscore.dto.ChildSummaryDTO;
import com.campuscore.dto.ParentManagementDTO;
import com.campuscore.entity.Attendance;
import com.campuscore.entity.Fee;
import com.campuscore.entity.ParentStudent;
import com.campuscore.entity.Result;
import com.campuscore.entity.Role;
import com.campuscore.entity.User;
import com.campuscore.entity.Student;
import com.campuscore.repository.AttendanceRepository;
import com.campuscore.repository.FeeRepository;
import com.campuscore.repository.ParentStudentRepository;
import com.campuscore.repository.NotificationRepository;
import com.campuscore.repository.ResultRepository;
import com.campuscore.repository.StudentRepository;
import com.campuscore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ParentServiceImpl implements ParentService {

    private final ParentStudentRepository parentStudentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeeRepository feeRepository;
    private final ResultRepository resultRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public List<ChildSummaryDTO> getChildrenForParent(Long parentUserId) {
        List<ParentStudent> links = parentStudentRepository.findByParentUserId(parentUserId);
        List<ChildSummaryDTO> summaries = new ArrayList<>();

        for (ParentStudent link : links) {
            Student student = link.getStudent();

            List<Attendance> attendance = attendanceRepository.findByStudentStudentId(student.getStudentId());
            long presentDays = attendance.stream().filter(a -> "Present".equalsIgnoreCase(a.getStatus())).count();
            double attendancePct = attendance.isEmpty() ? 0.0 : (presentDays * 100.0) / attendance.size();

            List<Fee> fees = feeRepository.findByStudentStudentId(student.getStudentId());
            double pending = fees.stream()
                    .filter(f -> !"Paid".equalsIgnoreCase(f.getStatus()))
                    .mapToDouble(Fee::getAmount)
                    .sum();

            List<Result> results = resultRepository.findByStudentStudentId(student.getStudentId());
            double avgResult = results.stream().mapToDouble(Result::getPercentage).average().orElse(0.0);

            summaries.add(new ChildSummaryDTO(
                    link.getId(),
                    student.getStudentId(),
                    student.getDisplayName(),
                    student.getRollNo(),
                    student.getClassName(),
                    link.getRelation(),
                    round2(attendancePct),
                    round2(pending),
                    round2(avgResult)));
        }

        return summaries;
    }

    @Override
    @Transactional
    public void linkChild(Long parentUserId, String childRollNo, String relation) {
        com.campuscore.entity.User parent = userRepository.findById(parentUserId)
                .orElseThrow(() -> new RuntimeException("Parent account not found"));

        Student student = studentRepository.findByRollNo(childRollNo)
                .orElseThrow(() -> new RuntimeException("No student found with roll number " + childRollNo));

        if (parentStudentRepository.existsByParentUserIdAndStudentStudentId(parentUserId, student.getStudentId())) {
            throw new RuntimeException("This child is already linked to your account");
        }

        ParentStudent link = new ParentStudent();
        link.setParent(parent);
        link.setStudent(student);
        link.setRelation(relation != null && !relation.isBlank() ? relation : "Guardian");
        link.setLinkedAt(java.time.LocalDateTime.now());
        parentStudentRepository.save(link);
    }

    @Override
    @Transactional
    public void unlinkChild(Long parentUserId, Long linkId) {
        ParentStudent link = parentStudentRepository.findById(linkId)
                .orElseThrow(() -> new RuntimeException("Link not found"));
        if (!link.getParent().getUserId().equals(parentUserId)) {
            throw new RuntimeException("You are not authorized to remove this link");
        }
        parentStudentRepository.delete(link);
    }

    @Override
    public Map<String, Object> getChildDetail(Long parentUserId, Long studentId) {
        parentStudentRepository.findByParentUserIdAndStudentStudentId(parentUserId, studentId)
                .orElseThrow(() -> new RuntimeException("This student is not linked to your account"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", student.getStudentId());
        response.put("name", student.getDisplayName());
        response.put("rollNo", student.getRollNo());
        response.put("className", student.getClassName());
        response.put("attendance", attendanceRepository.findByStudentStudentId(studentId));
        response.put("fees", feeRepository.findByStudentStudentId(studentId));
        response.put("results", resultRepository.findByStudentStudentId(studentId));

        return response;
    }


    @Override
    public List<ParentManagementDTO> getAllParentsForAdmin() {
        return userRepository.findByRole(Role.Parent).stream()
                .map(parent -> new ParentManagementDTO(
                        parent.getUserId(),
                        parent.getUsername(),
                        parent.getEmail(),
                        parent.getPhone(),
                        getChildrenForParent(parent.getUserId())))
                .toList();
    }

    @Override
    @Transactional
    public void unlinkChildByAdmin(Long parentUserId, Long linkId) {
        User parent = userRepository.findById(parentUserId)
                .orElseThrow(() -> new RuntimeException("Parent account not found"));

        if (parent.getRole() != Role.Parent) {
            throw new RuntimeException("Selected user is not a Parent account");
        }

        ParentStudent link = parentStudentRepository.findById(linkId)
                .orElseThrow(() -> new RuntimeException("Parent-child link not found"));

        if (!link.getParent().getUserId().equals(parentUserId)) {
            throw new RuntimeException("This child link does not belong to the selected parent");
        }

        parentStudentRepository.delete(link);
    }

    @Override
    @Transactional
    public void deleteParentByAdmin(Long parentUserId) {
        User parent = userRepository.findById(parentUserId)
                .orElseThrow(() -> new RuntimeException("Parent account not found"));

        if (parent.getRole() != Role.Parent) {
            throw new RuntimeException("Selected user is not a Parent account");
        }

        // Parent and Student are independent accounts. Deleting a parent only
        // removes the links to children; it never deletes any Student record.
        List<ParentStudent> links = parentStudentRepository.findByParentUserId(parentUserId);
        if (!links.isEmpty()) {
            parentStudentRepository.deleteAll(links);
            parentStudentRepository.flush();
        }

        // Notifications reference users directly, so remove the parent's own
        // notifications before deleting the parent user account.
        var notifications = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(parentUserId);
        if (!notifications.isEmpty()) {
            notificationRepository.deleteAll(notifications);
            notificationRepository.flush();
        }

        userRepository.delete(parent);
        userRepository.flush();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
