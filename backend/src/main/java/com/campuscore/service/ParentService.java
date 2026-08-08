package com.campuscore.service;

import com.campuscore.dto.ChildSummaryDTO;
import com.campuscore.dto.ParentManagementDTO;

import java.util.List;
import java.util.Map;

public interface ParentService {

    List<ChildSummaryDTO> getChildrenForParent(Long parentUserId);

    void linkChild(Long parentUserId, String childRollNo, String relation);

    void unlinkChild(Long parentUserId, Long linkId);

    Map<String, Object> getChildDetail(Long parentUserId, Long studentId);

    List<ParentManagementDTO> getAllParentsForAdmin();

    void unlinkChildByAdmin(Long parentUserId, Long linkId);

    void deleteParentByAdmin(Long parentUserId);
}