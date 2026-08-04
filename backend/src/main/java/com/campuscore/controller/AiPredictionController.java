package com.campuscore.controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.campuscore.dto.AiPredictionRequest;
import com.campuscore.dto.AiPredictionResponse;
import com.campuscore.service.AiPredictionService;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiPredictionController {

    private final AiPredictionService aiPredictionService;

    @PostMapping("/predict")
    public AiPredictionResponse predict(@RequestBody AiPredictionRequest request) {
        return aiPredictionService.predict(request);
    }
}