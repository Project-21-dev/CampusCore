package com.schoolsync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.schoolsync.dto.AiPredictionRequest;
import com.schoolsync.dto.AiPredictionResponse;

@Service
public class AiPredictionServiceImpl implements AiPredictionService {

    @Autowired
    private RestTemplate restTemplate;

    private static final String AI_SERVICE_URL =
            "http://localhost:8000/predict";

    @Override
    public AiPredictionResponse predict(AiPredictionRequest request) {

        return restTemplate.postForObject(
                AI_SERVICE_URL,
                request,
                AiPredictionResponse.class
        );
    }
}