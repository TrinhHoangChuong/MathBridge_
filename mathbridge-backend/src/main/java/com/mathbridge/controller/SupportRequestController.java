package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.CreateSupportRequestDTO;
import com.mathbridge.dto.SupportRequestDTO;
import com.mathbridge.entity.YeuCauHoTro;
import com.mathbridge.repository.YeuCauHoTroRepository;
import com.mathbridge.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/support")
@CrossOrigin(origins = "*")
public class SupportRequestController {

    @Autowired
    private YeuCauHoTroRepository yeuCauHoTroRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Get all support requests for the current user
    @GetMapping
    public ResponseEntity<ApiResponse<List<SupportRequestDTO>>> getSupportRequests(
            @RequestHeader("Authorization") String token) {
        try {
            // Extract user ID from token
            String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));

            // For now, return all support requests (in a real implementation,
            // we would filter by user ID, but the entity doesn't have user reference yet)
            List<YeuCauHoTro> requests = yeuCauHoTroRepository.findAllOrderByThoiDiemTaoDesc();

            List<SupportRequestDTO> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Success", dtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error retrieving support requests: " + e.getMessage(), null));
        }
    }

    // Get support request by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupportRequestDTO>> getSupportRequest(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {
        try {
            Optional<YeuCauHoTro> requestOpt = yeuCauHoTroRepository.findById(id);

            if (!requestOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            SupportRequestDTO dto = convertToDTO(requestOpt.get());
            return ResponseEntity.ok(new ApiResponse<>(true, "Success", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error retrieving support request: " + e.getMessage(), null));
        }
    }

    // Create new support request
    @PostMapping
    public ResponseEntity<ApiResponse<SupportRequestDTO>> createSupportRequest(
            @RequestBody CreateSupportRequestDTO createDTO,
            @RequestHeader("Authorization") String token) {
        try {
            // Extract user ID from token
            String userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));

            // Generate new ID (in a real implementation, this might be auto-generated)
            String newId = "YC" + System.currentTimeMillis();

            YeuCauHoTro request = new YeuCauHoTro();
            request.setIdYc(newId);
            request.setTieuDe(createDTO.getTitle());
            request.setNoiDung(createDTO.getDescription());
            request.setLoaiYeuCau(createDTO.getType());
            request.setFileUrl(createDTO.getFileUrl());
            request.setTrangThai("pending");
            request.setThoiDiemTao(LocalDateTime.now());

            // Set class if provided
            if (createDTO.getClassId() != null && !createDTO.getClassId().isEmpty()) {
                // In a real implementation, we would fetch the LopHoc entity
                // For now, we'll leave it null
            }

            YeuCauHoTro saved = yeuCauHoTroRepository.save(request);
            SupportRequestDTO dto = convertToDTO(saved);

            return ResponseEntity.ok(new ApiResponse<>(true, "Support request created successfully", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error creating support request: " + e.getMessage(), null));
        }
    }

    // Update support request (for admin responses)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupportRequestDTO>> updateSupportRequest(
            @PathVariable String id,
            @RequestBody SupportRequestDTO updateDTO,
            @RequestHeader("Authorization") String token) {
        try {
            Optional<YeuCauHoTro> requestOpt = yeuCauHoTroRepository.findById(id);

            if (!requestOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            YeuCauHoTro request = requestOpt.get();

            // Update fields
            if (updateDTO.getStatus() != null) {
                request.setTrangThai(updateDTO.getStatus());
            }
            if (updateDTO.getResponse() != null) {
                // In a real implementation, we might have a separate response field
                // For now, we'll store response in noiDung or create a new field
            }

            if ("resolved".equals(updateDTO.getStatus()) || "closed".equals(updateDTO.getStatus())) {
                request.setThoiDiemDong(LocalDateTime.now());
            }

            YeuCauHoTro saved = yeuCauHoTroRepository.save(request);
            SupportRequestDTO dto = convertToDTO(saved);

            return ResponseEntity.ok(new ApiResponse<>(true, "Support request updated successfully", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error updating support request: " + e.getMessage(), null));
        }
    }

    // Delete support request
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupportRequest(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {
        try {
            Optional<YeuCauHoTro> requestOpt = yeuCauHoTroRepository.findById(id);

            if (!requestOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            yeuCauHoTroRepository.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Support request deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error deleting support request: " + e.getMessage(), null));
        }
    }

    // Get support requests by status
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<SupportRequestDTO>>> getSupportRequestsByStatus(
            @PathVariable String status,
            @RequestHeader("Authorization") String token) {
        try {
            List<YeuCauHoTro> requests = yeuCauHoTroRepository.findByTrangThaiOrderByThoiDiemTaoDesc(status);

            List<SupportRequestDTO> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Success", dtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error retrieving support requests: " + e.getMessage(), null));
        }
    }

    // Helper method to convert entity to DTO
    private SupportRequestDTO convertToDTO(YeuCauHoTro entity) {
        SupportRequestDTO dto = new SupportRequestDTO();
        dto.setId(entity.getIdYc());
        dto.setType(entity.getLoaiYeuCau());
        dto.setTitle(entity.getTieuDe());
        dto.setDescription(entity.getNoiDung());
        dto.setStatus(entity.getTrangThai());
        dto.setCreatedAt(entity.getThoiDiemTao());
        dto.setRespondedAt(entity.getThoiDiemDong());
        dto.setFileUrl(entity.getFileUrl());

        // Set class info if available
        if (entity.getLopHoc() != null) {
            dto.setClassId(entity.getLopHoc().getIdLh());
            dto.setClassName(entity.getLopHoc().getTenLop());
        }

        return dto;
    }
}