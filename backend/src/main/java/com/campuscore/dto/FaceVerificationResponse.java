package com.campuscore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceVerificationResponse {
    private boolean verified;
    private double score;
    private String message;
    private Integer enrolledSamples;
}
