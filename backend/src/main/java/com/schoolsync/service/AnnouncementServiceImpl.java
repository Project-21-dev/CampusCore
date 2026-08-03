package com.schoolsync.service;

import com.schoolsync.entity.Announcement;
import com.schoolsync.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public Announcement createAnnouncement(Map<String, Object> request) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.get("title").toString());
        announcement.setMessage(request.get("message").toString());
        announcement.setTargetRole(request.getOrDefault("targetRole", "All").toString());
        announcement.setTargetClassName(request.get("targetClassName") != null
                ? request.get("targetClassName").toString()
                : null);
        announcement.setPriority(request.getOrDefault("priority", "Normal").toString());
        announcement.setCreatedBy(request.getOrDefault("createdBy", "Admin").toString());
        announcement.setCreatedAt(LocalDateTime.now());

        Announcement saved = announcementRepository.save(announcement);

        auditLogService.log("Announcement", saved.getAnnouncementId(), "CREATE", saved.getCreatedBy(),
                "Posted announcement: " + saved.getTitle());

        return saved;
    }

    @Override
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Announcement> getAnnouncementsFor(String role, String className) {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(a -> "All".equalsIgnoreCase(a.getTargetRole()) || a.getTargetRole().equalsIgnoreCase(role))
                .filter(a -> a.getTargetClassName() == null || a.getTargetClassName().isBlank()
                        || (className != null && a.getTargetClassName().equalsIgnoreCase(className)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
        auditLogService.log("Announcement", id, "DELETE", "Admin", "Deleted announcement");
    }
}
