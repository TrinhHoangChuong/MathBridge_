package com.mathbridge.controller.portaltutor;

import com.mathbridge.dto.JobDTO;
import com.mathbridge.service.portaltutor.TuRecruitmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portal/tutor/recruitment")
@CrossOrigin(origins = "*")
public class TuRecruitmentController {

    private final TuRecruitmentService recruitmentService;

    public TuRecruitmentController(TuRecruitmentService recruitmentService) {
        this.recruitmentService = recruitmentService;
    }

    // Lấy tất cả tin tuyển dụng
    @GetMapping
    public ResponseEntity<List<JobDTO>> getAllJobs() {
        try {
            List<JobDTO> jobs = recruitmentService.getAllJobs();
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Lấy tin tuyển dụng theo ID
    @GetMapping("/{idTd}")
    public ResponseEntity<?> getJobById(@PathVariable String idTd) {
        try {
            JobDTO job = recruitmentService.getJobById(idTd);
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi máy chủ khi lấy thông tin tin tuyển dụng");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Lỗi máy chủ");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Tạo tin tuyển dụng mới
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobDTO jobDTO) {
        try {
            // Validate required fields
            if (jobDTO.getTieuDe() == null || jobDTO.getTieuDe().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Tiêu đề không được để trống");
                errorResponse.put("message", "Tiêu đề không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (jobDTO.getViTri() == null || jobDTO.getViTri().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vị trí không được để trống");
                errorResponse.put("message", "Vị trí không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (jobDTO.getMoTa() == null || jobDTO.getMoTa().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Mô tả công việc không được để trống");
                errorResponse.put("message", "Mô tả công việc không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (jobDTO.getYeuCau() == null || jobDTO.getYeuCau().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Yêu cầu không được để trống");
                errorResponse.put("message", "Yêu cầu không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            JobDTO created = recruitmentService.createJob(jobDTO);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi máy chủ khi tạo tin tuyển dụng");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Lỗi máy chủ");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Cập nhật tin tuyển dụng
    @PutMapping("/{idTd}")
    public ResponseEntity<?> updateJob(@PathVariable String idTd, @RequestBody JobDTO jobDTO) {
        try {
            // Validate required fields
            if (jobDTO.getTieuDe() == null || jobDTO.getTieuDe().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Tiêu đề không được để trống");
                errorResponse.put("message", "Tiêu đề không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (jobDTO.getViTri() == null || jobDTO.getViTri().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Vị trí không được để trống");
                errorResponse.put("message", "Vị trí không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (jobDTO.getMoTa() == null || jobDTO.getMoTa().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Mô tả công việc không được để trống");
                errorResponse.put("message", "Mô tả công việc không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (jobDTO.getYeuCau() == null || jobDTO.getYeuCau().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Yêu cầu không được để trống");
                errorResponse.put("message", "Yêu cầu không được để trống");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            JobDTO updated = recruitmentService.updateJob(idTd, jobDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi máy chủ khi cập nhật tin tuyển dụng");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Lỗi máy chủ");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Xóa tin tuyển dụng
    @DeleteMapping("/{idTd}")
    public ResponseEntity<?> deleteJob(@PathVariable String idTd) {
        try {
            recruitmentService.deleteJob(idTd);
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Xóa tin tuyển dụng thành công");
            return ResponseEntity.ok(successResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Lỗi máy chủ khi xóa tin tuyển dụng");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Lỗi máy chủ");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

