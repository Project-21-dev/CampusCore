package com.schoolsync.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ResultDTO {
    private Long resultId;
    private Long studentId;
    private String studentName;
    private String rollNo;
    private String className;
    private String subject;
    @Min(value = 0, message = "Marks cannot be negative")
    @Max(value = 100, message = "Marks cannot exceed 100")

    private Double marks;
    private LocalDate date;
}
