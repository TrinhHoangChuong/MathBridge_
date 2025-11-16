package com.mathbridge.controller.portaltutor;

import com.mathbridge.dto.portaltutor.TuLienHeTuVanResponseDTO;
import com.mathbridge.service.LienHeTuVanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal/tutor/consultations")
@CrossOrigin(origins = "*")
public class TuConsultationController {

    private final LienHeTuVanService lienHeTuVanService;

    public TuConsultationController(LienHeTuVanService lienHeTuVanService) {
        this.lienHeTuVanService = lienHeTuVanService;
    }

    // Lấy danh sách tất cả yêu cầu tư vấn
    @GetMapping
    public ResponseEntity<List<TuLienHeTuVanResponseDTO>> getAllConsultations() {
        try {
            List<TuLienHeTuVanResponseDTO> consultations = lienHeTuVanService.getAllConsultationRequests();
            return ResponseEntity.ok(consultations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Cập nhật trạng thái yêu cầu tư vấn
    @PutMapping("/{idTv}/status")
    public ResponseEntity<TuLienHeTuVanResponseDTO> updateStatus(
            @PathVariable String idTv,
            @RequestBody UpdateStatusRequest request) {
        try {
            TuLienHeTuVanResponseDTO updated = lienHeTuVanService.updateStatus(idTv, request.getTrangThai());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Inner class for request body
    public static class UpdateStatusRequest {
        private String trangThai;

        public String getTrangThai() {
            return trangThai;
        }

        public void setTrangThai(String trangThai) {
            this.trangThai = trangThai;
        }
    }
}

