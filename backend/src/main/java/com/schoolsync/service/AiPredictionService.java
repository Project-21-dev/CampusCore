package com.schoolsync.service;

import com.schoolsync.dto.AiPredictionRequest;
import com.schoolsync.dto.AiPredictionResponse;

public interface AiPredictionService {

    AiPredictionResponse predict(AiPredictionRequest request);

}