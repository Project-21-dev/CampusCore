package com.campuscore.security;

import com.campuscore.entity.Fee;
import com.campuscore.entity.Notification;
import com.campuscore.entity.User;
import com.campuscore.repository.FeeRepository;
import com.campuscore.repository.NotificationRepository;
import com.campuscore.repository.ParentStudentRepository;
import com.campuscore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("securityAccess")
@RequiredArgsConstructor
public class SecurityAccess {

    private final UserRepository userRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final NotificationRepository notificationRepository;
    private final FeeRepository feeRepository;

    public boolean canAccessStudent(Authentication authentication, Long studentId) {
        User user = currentUser(authentication);
        if (user == null) return false;
        switch (user.getRole()) {
            case Admin:
            case Teacher:
                return true;
            case Student:
                return user.getStudent() != null && studentId.equals(user.getStudent().getStudentId());
            case Parent:
                return parentStudentRepository
                        .findByParentUserIdAndStudentStudentId(user.getUserId(), studentId)
                        .isPresent();
            default:
                return false;
        }
    }

    public boolean canAccessTeacher(Authentication authentication, Long teacherId) {
        User user = currentUser(authentication);
        return user != null && (user.getRole().name().equals("Admin")
                || (user.getRole().name().equals("Teacher")
                && user.getTeacher() != null
                && teacherId.equals(user.getTeacher().getTeacherId())));
    }

    public boolean canAccessUser(Authentication authentication, Long userId) {
        User user = currentUser(authentication);
        return user != null && (user.getRole().name().equals("Admin") || userId.equals(user.getUserId()));
    }

    public boolean canAccessParent(Authentication authentication, Long parentUserId) {
        User user = currentUser(authentication);
        return user != null && (user.getRole().name().equals("Admin")
                || (user.getRole().name().equals("Parent") && parentUserId.equals(user.getUserId())));
    }


    public boolean canAccessFee(Authentication authentication, Long feeId) {
        User user = currentUser(authentication);
        if (user == null) return false;
        if (user.getRole().name().equals("Admin")) return true;
        Fee fee = feeRepository.findById(feeId).orElse(null);
        if (fee == null || fee.getStudent() == null) return false;
        Long studentId = fee.getStudent().getStudentId();
        if (user.getRole().name().equals("Student")) {
            return user.getStudent() != null && studentId.equals(user.getStudent().getStudentId());
        }
        if (user.getRole().name().equals("Parent")) {
            return parentStudentRepository.findByParentUserIdAndStudentStudentId(user.getUserId(), studentId).isPresent();
        }
        return false;
    }

    public boolean canAccessNotification(Authentication authentication, Long notificationId) {
        User user = currentUser(authentication);
        if (user == null) return false;
        if (user.getRole().name().equals("Admin")) return true;
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        return notification != null
                && notification.getUser() != null
                && user.getUserId().equals(notification.getUser().getUserId());
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }
}
