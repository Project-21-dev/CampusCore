package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeStatusSummaryDTO {
    private String status;
    private Long count;
    private Double totalAmount;
}
