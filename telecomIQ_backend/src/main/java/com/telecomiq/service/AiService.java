package com.telecomiq.service;

import com.telecomiq.dto.response.AiClassifyResponse;
import com.telecomiq.dto.response.AiPriorityResponse;
import com.telecomiq.dto.response.AiResolveResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@Slf4j
public class AiService {

    private final WebClient webClient;

    public AiService(@Value("${app.ai.service-url}") String aiServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    public AiClassifyResponse classify(String title, String description) {
        try {
            log.info("Calling AI service for classification: title={}", title);
            return webClient.post()
                    .uri("/classify")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("title", title, "description", description))
                    .retrieve()
                    .bodyToMono(AiClassifyResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("AI classification failed: {}", e.getMessage());
            return AiClassifyResponse.builder()
                    .category("NETWORK_ISSUE")
                    .confidence_score(50)
                    .build();
        }
    }

    public AiPriorityResponse predictPriority(String title, String description, String category) {
        try {
            log.info("Calling AI service for priority prediction: title={}", title);
            return webClient.post()
                    .uri("/priority")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("title", title, "description", description, "category", category))
                    .retrieve()
                    .bodyToMono(AiPriorityResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("AI priority prediction failed: {}", e.getMessage());
            return AiPriorityResponse.builder()
                    .priority("MEDIUM")
                    .confidence_score(50)
                    .build();
        }
    }

    public AiResolveResponse generateResolution(String title, String description, String category) {
        try {
            log.info("Calling AI service for resolution: title={}", title);
            return webClient.post()
                    .uri("/resolve")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("title", title, "description", description, "category", category))
                    .retrieve()
                    .bodyToMono(AiResolveResponse.class)
                    .block();
        } catch (Exception e) {
            log.error("AI resolution generation failed: {}", e.getMessage());
            return AiResolveResponse.builder()
                    .resolution("Unable to generate AI resolution. Please escalate to a support engineer.")
                    .confidence_score(0)
                    .build();
        }
    }
}
