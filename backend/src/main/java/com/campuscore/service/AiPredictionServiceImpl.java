package com.campuscore.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.campuscore.dto.AiPredictionRequest;
import com.campuscore.dto.AiPredictionResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class AiPredictionServiceImpl implements AiPredictionService {

    @Autowired
    private RestTemplate restTemplate;

    private static final String AI_SERVICE_URL = "http://localhost:8000/predict";

    @Override
    @CircuitBreaker(name = "aiService", fallbackMethod = "predictFallback")
    public AiPredictionResponse predict(AiPredictionRequest request) {

        return restTemplate.postForObject(
                AI_SERVICE_URL,
                request,
                AiPredictionResponse.class
        );
    }

    public AiPredictionResponse predictFallback(
            AiPredictionRequest request,
            Exception ex) {

        AiPredictionResponse response = new AiPredictionResponse();

        response.setRisk("UNKNOWN");
        response.setConfidence(0.0);
        response.setReasons(List.of("AI service is currently unavailable."));
        response.setRecommendations(
                List.of("Please try again later.")
        );

        return response;
    }
}