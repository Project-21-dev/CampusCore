package com.campuscore.service;

import com.campuscore.dto.ChildSummaryDTO;

import java.util.List;
import java.util.Map;

public interface ParentService {

    List<ChildSummaryDTO> getChildrenForParent(Long parentUserId);

    void linkChild(Long parentUserId, String childRollNo, String relation);

    void unlinkChild(Long parentUserId, Long linkId);

    Map<String, Object> getChildDetail(Long parentUserId, Long studentId);
}
