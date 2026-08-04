package com.campuscore.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionResponse {

    private String risk;
    private double confidence;
    private List<String> reasons;
    private List<String> recommendations;
}