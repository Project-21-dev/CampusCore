package com.campuscore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyAttendanceDTO {
    private LocalDate date;
    private Long presentCount;
    private Long absentCount;
    private Double attendancePercentage;
}
