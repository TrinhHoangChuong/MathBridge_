package com.mathbridge.controller;

import com.mathbridge.dto.JobDTO;
import com.mathbridge.service.TinTuyenDungService;
import com.mathbridge.service.ApplicationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/jobs")
@CrossOrigin(origins = "*")
public class CareersController {

    private final TinTuyenDungService jobService;
    private final ApplicationService applicationService;

    public CareersController(TinTuyenDungService jobService, ApplicationService applicationService) {
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<JobDTO> listJobs() {
        return jobService.listAll();
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getJob(@PathVariable String slug) {
        return jobService.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(path = "/apply", consumes = { "multipart/form-data" })
    public ResponseEntity<?> apply(@RequestParam String name,
            @RequestParam String phone,
            @RequestParam String email,
            @RequestParam String position,
            @RequestParam(required = false) MultipartFile file) {
        try {
            applicationService.saveApplication(name, phone, email, position, file);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Ứng tuyển đã được gửi. Cảm ơn!");
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Lỗi khi gửi hồ sơ: " + ex.getMessage());
            return ResponseEntity.status(500).body(resp);
        }
    }
}
