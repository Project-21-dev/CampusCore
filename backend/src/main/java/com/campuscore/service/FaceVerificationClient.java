package com.campuscore.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.campuscore.dto.FaceVerificationResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FaceVerificationClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.base-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    @Value("${ai.service.api-key:campuscore-local-ai-key-change-me}")
    private String aiServiceApiKey;

    public FaceVerificationResponse enroll(Long studentId, List<MultipartFile> images) {
        if (images == null || images.size() < 3) {
            throw new RuntimeException("Please capture at least 3 face samples.");
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("student_id", studentId.toString());
        for (MultipartFile image : images) {
            body.add("images", filePart(image));
        }

        return postMultipart("/face/enroll", body);
    }

    public FaceVerificationResponse verify(Long studentId, MultipartFile image) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("student_id", studentId.toString());
        body.add("image", filePart(image));
        return postMultipart("/face/verify", body);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> enrollmentStatus(Long studentId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Api-Key", aiServiceApiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(
                aiServiceBaseUrl + "/face/enrollment/" + studentId,
                org.springframework.http.HttpMethod.GET,
                entity,
                Map.class).getBody();
    }

    private FaceVerificationResponse postMultipart(String path, MultiValueMap<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-Internal-Api-Key", aiServiceApiKey);
        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        FaceVerificationResponse response = restTemplate.postForObject(
                aiServiceBaseUrl + path,
                entity,
                FaceVerificationResponse.class);

        if (response == null) {
            throw new RuntimeException("Face service returned an empty response.");
        }
        return response;
    }

    private HttpEntity<ByteArrayResource> filePart(MultipartFile file) {
        try {
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    String original = file.getOriginalFilename();
                    return original == null || original.isBlank() ? "capture.jpg" : original;
                }
            };
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            return new HttpEntity<>(resource, headers);
        } catch (IOException e) {
            throw new RuntimeException("Could not read captured image.", e);
        }
    }
}
