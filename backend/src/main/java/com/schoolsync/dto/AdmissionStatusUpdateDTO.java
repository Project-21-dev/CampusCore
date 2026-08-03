package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionStatusUpdateDTO {
    private String status;
    private String remarks;
    private Boolean createStudentAccount;
}