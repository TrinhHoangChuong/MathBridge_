package com.mathbridge.controller;

import com.mathbridge.service.CoSoService;
import com.mathbridge.dto.FooterCenterDTO;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/centers")
@CrossOrigin(origins = "*")
public class PublicCentersController {

    private final CoSoService coSoService;

    public PublicCentersController(CoSoService coSoService) {
        this.coSoService = coSoService;
    }
    @GetMapping
    public Map<String, Object> getCenters() {
        List<FooterCenterDTO> centers = coSoService.getCentersForFooter();

        // Trả theo cấu trúc { "centers": [...] }
        Map<String, Object> response = new HashMap<>();
        response.put("centers", centers);
        return response;
    }
}
