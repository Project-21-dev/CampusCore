package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDTO {
    private Long teacherId;
    private String username;
    private String subject;
    private String email;
    private String phone;
}
