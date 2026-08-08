package com.campuscore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentManagementDTO {
    private Long userId;
    private String username;
    private String email;
    private String phone;
    private List<ChildSummaryDTO> children;
}
