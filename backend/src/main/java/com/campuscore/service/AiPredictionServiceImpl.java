package com.campuscore.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.campuscore.dto.AiPredictionRequest;
import com.campuscore.dto.AiPredictionResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiPredictionServiceImpl implements AiPredictionService {

    private final RestTemplate restTemplate;

    @Value("${ai.service.base-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    @Value("${ai.service.api-key:campuscore-local-ai-key-change-me}")
    private String aiServiceApiKey;

    @Override
    @CircuitBreaker(name = "aiService", fallbackMethod = "predictFallback")
    public AiPredictionResponse predict(AiPredictionRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Api-Key", aiServiceApiKey);
        HttpEntity<AiPredictionRequest> entity = new HttpEntity<>(request, headers);

        return restTemplate.postForObject(
                aiServiceBaseUrl + "/predict",
                entity,
                AiPredictionResponse.class);
    }

    public AiPredictionResponse predictFallback(AiPredictionRequest request, Exception ex) {
        AiPredictionResponse response = new AiPredictionResponse();
        response.setRisk("UNKNOWN");
        response.setConfidence(0.0);
        response.setReasons(List.of("AI service is currently unavailable."));
        response.setRecommendations(List.of("Please try again later."));
        return response;
    }
}
