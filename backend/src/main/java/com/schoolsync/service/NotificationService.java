package com.schoolsync.service;

import com.schoolsync.dto.NotificationDTO;
import java.util.List;

public interface NotificationService {
    List<NotificationDTO> getNotifications(Long userId);

    List<NotificationDTO> getUnreadNotifications(Long userId);

    void markAsRead(Long notificationId);
}
