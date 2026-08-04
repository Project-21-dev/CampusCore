package com.campuscore.service;

import com.campuscore.entity.Announcement;

import java.util.List;
import java.util.Map;

public interface AnnouncementService {

    Announcement createAnnouncement(Map<String, Object> request);

    List<Announcement> getAllAnnouncements();

    List<Announcement> getAnnouncementsFor(String role, String className);

    void deleteAnnouncement(Long id);
}
