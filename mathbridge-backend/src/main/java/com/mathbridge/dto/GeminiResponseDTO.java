package com.mathbridge.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiResponseDTO {
    private List<CandidateDTO> candidates;
    private ErrorDTO error; // Added for API errors

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CandidateDTO {
        private ContentDTO content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ContentDTO {
        private List<PartDTO> parts;
        private String role; // Thêm thuộc tính role để khớp với JSON response từ Gemini API
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartDTO {
        private String text;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDTO {
        private int code;
        private String message;
        private List<Object> details; // Can be more specific if needed
    }
}

