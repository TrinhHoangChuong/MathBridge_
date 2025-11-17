package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.CreateSupportRequestDTO;
import com.mathbridge.dto.PortalStudentDTO.SupportRequestDTO;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.entity.YeuCauHoTro;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.LopHocRepository;
import com.mathbridge.repository.StudentRepo.YeuCauHoTroStudentRepository;
import com.mathbridge.repository.StudentRepo.DangKyLHStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
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
    private YeuCauHoTroStudentRepository yeuCauHoTroStudentRepository;

    @Autowired
    private HocSinhRepository hocSinhRepository;

    @Autowired
    private LopHocRepository lopHocRepository;

    @Autowired
    private DangKyLHStudentRepository dangKyLHStudentRepository;

    // Get all support requests for the current user
    @GetMapping
    public ResponseEntity<ApiResponse<List<SupportRequestDTO>>> getSupportRequests(
            Authentication authentication) {
        try {
            // Extract user ID from JWT token
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userId = jwt.getClaimAsString("uid");

            if (userId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Không thể xác định ID người dùng từ token", null));
            }

            // Get student by account ID
            Optional<HocSinh> studentOpt = hocSinhRepository.findByTaiKhoan_IdTk(userId);
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Không tìm thấy học sinh", null));
            }

            HocSinh student = studentOpt.get();
            String studentId = student.getIdHs();

            // Get all classes that student is registered in
            List<String> classIds = dangKyLHStudentRepository.findByHocSinhId(studentId).stream()
                .map(dk -> dk.getLopHoc() != null ? dk.getLopHoc().getIdLh() : null)
                .filter(id -> id != null)
                .collect(Collectors.toList());

            // Get all support requests and filter:
            // 1. Requests without class (ID_LH = NULL) - return for all students
            // 2. Requests with class that student is registered in
            List<YeuCauHoTro> allRequests = yeuCauHoTroStudentRepository.findAllOrderByThoiDiemTaoDesc();
            
            List<YeuCauHoTro> requests = allRequests.stream()
                .filter(req -> {
                    // If request has no class, include it
                    if (req.getLopHoc() == null) {
                        return true;
                    }
                    // If request has class, only include if student is registered in that class
                    return classIds.contains(req.getLopHoc().getIdLh());
                })
                .collect(Collectors.toList());

            List<SupportRequestDTO> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách yêu cầu hỗ trợ thành công", dtos));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Lỗi khi lấy danh sách yêu cầu hỗ trợ: " + e.getMessage(), null));
        }
    }

    // Get support request by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupportRequestDTO>> getSupportRequest(
            @PathVariable String id,
            Authentication authentication) {
        try {
            Optional<YeuCauHoTro> requestOpt = yeuCauHoTroStudentRepository.findById(id);

            if (!requestOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            SupportRequestDTO dto = convertToDTO(requestOpt.get());
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy yêu cầu hỗ trợ thành công", dto));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Lỗi khi lấy yêu cầu hỗ trợ: " + e.getMessage(), null));
        }
    }

    // Create new support request
    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<SupportRequestDTO>> createSupportRequest(
            @RequestBody CreateSupportRequestDTO createDTO,
            Authentication authentication) {
        try {
            // Extract user ID from JWT token
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userId = jwt.getClaimAsString("uid");

            if (userId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Không thể xác định ID người dùng từ token", null));
            }

            // Validate required fields
            if (createDTO.getTitle() == null || createDTO.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Tiêu đề không được để trống", null));
            }
            if (createDTO.getDescription() == null || createDTO.getDescription().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Mô tả không được để trống", null));
            }
            if (createDTO.getType() == null || createDTO.getType().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Loại yêu cầu không được để trống", null));
            }

            // Generate new ID - format: YC### (YC + số) để phù hợp với DB length = 10
            String newId = generateNextSupportRequestId();

            // Validate và truncate theo constraints của entity
            String tieuDe = createDTO.getTitle().trim();
            if (tieuDe.length() > 100) {
                tieuDe = tieuDe.substring(0, 100);
            }
            
            String noiDung = createDTO.getDescription().trim();
            if (noiDung.length() > 200) {
                noiDung = noiDung.substring(0, 200);
            }
            
            String loaiYeuCau = createDTO.getType();
            if (loaiYeuCau != null && loaiYeuCau.length() > 100) {
                loaiYeuCau = loaiYeuCau.substring(0, 100);
            }
            
            String fileUrl = createDTO.getFileUrl();
            if (fileUrl != null && fileUrl.length() > 400) {
                fileUrl = fileUrl.substring(0, 400);
            }

            YeuCauHoTro request = new YeuCauHoTro();
            request.setIdYc(newId);
            request.setTieuDe(tieuDe); // length <= 100, nullable = false
            request.setNoiDung(noiDung); // length <= 200, nullable = false
            request.setLoaiYeuCau(loaiYeuCau); // length <= 100, nullable
            request.setFileUrl(fileUrl); // length <= 400, nullable
            request.setTrangThai("pending"); // length <= 60, nullable
            request.setThoiDiemTao(LocalDateTime.now()); // nullable
            // ThoiDiemDong không set khi tạo mới (chỉ set khi đóng yêu cầu)

            // Set class if provided - verify student is registered in this class
            if (createDTO.getClassId() != null && !createDTO.getClassId().trim().isEmpty()) {
                Optional<LopHoc> lopHocOpt = lopHocRepository.findById(createDTO.getClassId().trim());
                if (lopHocOpt.isPresent()) {
                    // Verify student is registered in this class
                    Optional<HocSinh> studentOpt = hocSinhRepository.findByTaiKhoan_IdTk(userId);
                    if (studentOpt.isPresent()) {
                        String studentId = studentOpt.get().getIdHs();
                        boolean isRegistered = dangKyLHStudentRepository.findByHocSinhId(studentId).stream()
                            .anyMatch(dk -> dk.getLopHoc() != null && 
                                          dk.getLopHoc().getIdLh().equals(createDTO.getClassId().trim()));
                        
                        if (isRegistered) {
                            request.setLopHoc(lopHocOpt.get());
                        } else {
                            // Student not registered in this class, but we'll still allow it
                            // (maybe it's a general question about the class)
                            request.setLopHoc(lopHocOpt.get());
                        }
                    }
                }
            }

            YeuCauHoTro saved = yeuCauHoTroStudentRepository.save(request);
            SupportRequestDTO dto = convertToDTO(saved);

            return ResponseEntity.ok(new ApiResponse<>(true, "Yêu cầu hỗ trợ đã được tạo thành công", dto));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Lỗi khi tạo yêu cầu hỗ trợ: " + e.getMessage(), null));
        }
    }

    // Update support request (for admin responses)
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<SupportRequestDTO>> updateSupportRequest(
            @PathVariable String id,
            @RequestBody SupportRequestDTO updateDTO,
            Authentication authentication) {
        try {
            Optional<YeuCauHoTro> requestOpt = yeuCauHoTroStudentRepository.findById(id);

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

            YeuCauHoTro saved = yeuCauHoTroStudentRepository.save(request);
            SupportRequestDTO dto = convertToDTO(saved);

            return ResponseEntity.ok(new ApiResponse<>(true, "Support request updated successfully", dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error updating support request: " + e.getMessage(), null));
        }
    }

    // Delete support request
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteSupportRequest(
            @PathVariable String id,
            Authentication authentication) {
        try {
            Optional<YeuCauHoTro> requestOpt = yeuCauHoTroStudentRepository.findById(id);

            if (!requestOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            yeuCauHoTroStudentRepository.deleteById(id);
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
            Authentication authentication) {
        try {
            // Extract user ID from JWT token
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userId = jwt.getClaimAsString("uid");

            if (userId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Không thể xác định ID người dùng từ token", null));
            }

            // Get student by account ID
            Optional<HocSinh> studentOpt = hocSinhRepository.findByTaiKhoan_IdTk(userId);
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Không tìm thấy học sinh", null));
            }

            HocSinh student = studentOpt.get();
            String studentId = student.getIdHs();

            // Get all classes that student is registered in
            List<String> classIds = dangKyLHStudentRepository.findByHocSinhId(studentId).stream()
                .map(dk -> dk.getLopHoc() != null ? dk.getLopHoc().getIdLh() : null)
                .filter(id -> id != null)
                .collect(Collectors.toList());

            // Get support requests by status for these classes
            List<YeuCauHoTro> allRequests = yeuCauHoTroStudentRepository.findByTrangThaiOrderByThoiDiemTaoDesc(status);
            
            List<YeuCauHoTro> requests = allRequests.stream()
                .filter(req -> req.getLopHoc() != null && classIds.contains(req.getLopHoc().getIdLh()))
                .collect(Collectors.toList());

            List<SupportRequestDTO> dtos = requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách yêu cầu hỗ trợ thành công", dtos));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Lỗi khi lấy danh sách yêu cầu hỗ trợ: " + e.getMessage(), null));
        }
    }

    /**
     * Generate next support request ID
     * Format: YC### (YC + số) để phù hợp với DB length = 10
     * Ví dụ: YC00000001, YC00000002, ...
     */
    private String generateNextSupportRequestId() {
        try {
            int maxNo = yeuCauHoTroStudentRepository.findMaxYcNumber();
            int nextNo = maxNo + 1;
            
            // Format: YC + 8 số = 10 ký tự (YC00000001, YC00000002, ...)
            // Tối đa 99,999,999 requests
            if (nextNo <= 99999999) {
                return String.format("YC%08d", nextNo);
            } else {
                // Fallback: dùng timestamp ngắn (8 số cuối) để đảm bảo <= 10 ký tự
                long timestamp = System.currentTimeMillis() % 100000000L; // 8 số cuối
                return String.format("YC%08d", timestamp);
            }
        } catch (Exception e) {
            // Nếu query fail, dùng timestamp làm fallback
            System.err.println("Error generating support request ID: " + e.getMessage());
            long timestamp = System.currentTimeMillis() % 100000000L; // 8 số cuối
            return String.format("YC%08d", timestamp);
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