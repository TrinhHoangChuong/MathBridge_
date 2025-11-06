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
            @RequestParam(required = false) String linkProfile,
            @RequestParam(required = false) MultipartFile file) {
        try {
            applicationService.saveApplication(name, phone, email, position, linkProfile, file);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Ứng tuyển đã được gửi. Hồ sơ của bạn đang chờ duyệt. Cảm ơn!");
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            // Log full exception for debugging
            ex.printStackTrace();
            System.err.println("Error saving application: " + ex.getClass().getSimpleName() + " - " + ex.getMessage());
            if (ex.getCause() != null) {
                System.err.println("Cause: " + ex.getCause().getMessage());
            }
            
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Lỗi khi gửi hồ sơ: " + ex.getMessage());
            return ResponseEntity.status(500).body(resp);
        }
    }

    @PutMapping("/applications/{idUv}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String idUv, 
                                                   @RequestParam String status) {
        try {
            applicationService.updateApplicationStatus(idUv, status);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Trạng thái hồ sơ đã được cập nhật thành: " + status);
            return ResponseEntity.ok(resp);
        } catch (Exception ex) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Lỗi khi cập nhật trạng thái: " + ex.getMessage());
            return ResponseEntity.status(500).body(resp);
        }
    }

    @GetMapping("/applications/{idUv}")
    public ResponseEntity<?> getApplication(@PathVariable String idUv) {
        try {
            var application = applicationService.getApplicationById(idUv);
            return ResponseEntity.ok(application);
        } catch (Exception ex) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("message", "Không tìm thấy hồ sơ: " + ex.getMessage());
            return ResponseEntity.status(404).body(resp);
        }
    }
}
