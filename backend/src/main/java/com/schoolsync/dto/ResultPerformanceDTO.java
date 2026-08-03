package com.schoolsync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultPerformanceDTO {
    private String className;
    private Double averagePercentage;
    private Long totalResults;
}
