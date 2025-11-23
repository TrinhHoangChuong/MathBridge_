package com.mathbridge.controller.portaltutor;

import com.mathbridge.dto.portaltutor.TuUpdateSupportStatusRequestDTO;
import com.mathbridge.dto.portaltutor.TuYeuCauHoTroResponseDTO;
import com.mathbridge.service.portaltutor.TuSupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portal/tutor/support")
@CrossOrigin(origins = "*")
public class TuSupportController {

    private final TuSupportService supportService;

    public TuSupportController(TuSupportService supportService) {
        this.supportService = supportService;
    }

    @GetMapping
    public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getAllSupportRequests() {
        try {
            return ResponseEntity.ok(supportService.getAllSupportRequests());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/open")
    public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getOpenSupportRequests() {
        try {
            return ResponseEntity.ok(supportService.getOpenSupportRequests());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/status/{trangThai}")
    public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getSupportRequestsByStatus(@PathVariable String trangThai) {
        try {
            return ResponseEntity.ok(supportService.getSupportRequestsByStatus(trangThai));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/student/{idHs}")
    public ResponseEntity<List<TuYeuCauHoTroResponseDTO>> getSupportRequestsByStudent(@PathVariable String idHs) {
        try {
            return ResponseEntity.ok(supportService.getSupportRequestsByStudent(idHs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{idYc}")
    public ResponseEntity<TuYeuCauHoTroResponseDTO> getSupportRequestById(@PathVariable String idYc) {
        try {
            return ResponseEntity.ok(supportService.getSupportRequestById(idYc));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{idYc}/status")
    public ResponseEntity<TuYeuCauHoTroResponseDTO> updateSupportStatus(
            @PathVariable String idYc,
            @RequestBody TuUpdateSupportStatusRequestDTO request) {
        try {
            return ResponseEntity.ok(supportService.updateSupportStatus(idYc, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
