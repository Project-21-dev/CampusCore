package com.campuscore.service;

import com.campuscore.dto.AiPredictionRequest;
import com.campuscore.dto.AiPredictionResponse;

public interface AiPredictionService {

    AiPredictionResponse predict(AiPredictionRequest request);

}