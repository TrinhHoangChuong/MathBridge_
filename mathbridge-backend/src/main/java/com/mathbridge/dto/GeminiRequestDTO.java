package com.mathbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiRequestDTO {
    private List<ContentDTO> contents;
    private GenerationConfigDTO generationConfig;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContentDTO {
        private List<PartDTO> parts;
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
    public static class GenerationConfigDTO {
        private Double temperature;
        private Integer maxOutputTokens;
    }
}

