package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.PortalStudentDTO.StudentDashboardDTO;
import com.mathbridge.dto.PortalStudentDTO.UpdateStudentProfileDTO;
import com.mathbridge.dto.PortalStudentDTO.RateSessionDTO;
import com.mathbridge.dto.PortalStudentDTO.RateClassDTO;
import com.mathbridge.service.PortalStudent.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal/student")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            // Extract user ID from JWT token
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userId = jwt.getClaimAsString("uid");

            if (userId == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<StudentDashboardDTO>(
                    false,
                    "Không thể xác định ID người dùng từ token",
                    null
                ));
            }

            StudentDashboardDTO dashboard = studentService.getStudentDashboard(userId);

            return ResponseEntity.ok(new ApiResponse<StudentDashboardDTO>(
                true,
                "Lấy dữ liệu dashboard thành công",
                dashboard
            ));

        } catch (RuntimeException e) {
            e.printStackTrace(); // Log for debugging
            return ResponseEntity.badRequest().body(new ApiResponse<StudentDashboardDTO>(
                false,
                e.getMessage() != null ? e.getMessage() : "Lỗi khi lấy dữ liệu dashboard",
                null
            ));
        } catch (Exception e) {
            e.printStackTrace(); // Log for debugging
            return ResponseEntity.internalServerError().body(new ApiResponse<StudentDashboardDTO>(
                false,
                "Lỗi hệ thống: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()),
                null
            ));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<String>> updateProfile(
            @RequestBody UpdateStudentProfileDTO profileDTO,
            Authentication authentication) {
        try {
            // Extract user ID from JWT token
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userId = jwt.getClaimAsString("uid");

            if (userId == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Không thể xác định ID người dùng từ token",
                    null
                ));
            }

            studentService.updateStudentProfile(userId, profileDTO);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Cập nhật hồ sơ thành công",
                "Profile updated successfully"
            ));

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage() != null ? e.getMessage() : "Lỗi khi cập nhật hồ sơ",
                null
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ApiResponse<>(
                false,
                "Lỗi hệ thống: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()),
                null
            ));
        }
    }

    @PostMapping("/rate-session")
    public ResponseEntity<ApiResponse<String>> rateSession(
            @RequestBody RateSessionDTO rateDTO,
            Authentication authentication) {
        try {
            // Extract user ID from JWT token
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userId = jwt.getClaimAsString("uid");

            if (userId == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Không thể xác định ID người dùng từ token",
                    null
                ));
            }

            // Validate rating
            if (rateDTO.getRating() == null || rateDTO.getRating() < 1 || rateDTO.getRating() > 5) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Đánh giá phải từ 1 đến 5 sao",
                    null
                ));
            }

            studentService.rateSession(userId, rateDTO);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Đánh giá buổi học đã được lưu thành công",
                "Session rated successfully"
            ));

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage() != null ? e.getMessage() : "Lỗi khi lưu đánh giá",
                null
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ApiResponse<>(
                false,
                "Lỗi hệ thống: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()),
                null
            ));
        }
    }

    @PostMapping("/rate-class")
    public ResponseEntity<ApiResponse<String>> rateClass(
            @RequestBody RateClassDTO rateDTO,
            Authentication authentication) {
        try {
            // Extract user ID from JWT token
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userId = jwt.getClaimAsString("uid");

            if (userId == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Không thể xác định ID người dùng từ token",
                    null
                ));
            }

            // Validate rating
            if (rateDTO.getRating() == null || rateDTO.getRating() < 1 || rateDTO.getRating() > 5) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Đánh giá phải từ 1 đến 5 sao",
                    null
                ));
            }

            studentService.rateClass(userId, rateDTO);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Đánh giá lớp học đã được lưu thành công",
                "Class rated successfully"
            ));

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                false,
                e.getMessage() != null ? e.getMessage() : "Lỗi khi lưu đánh giá",
                null
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ApiResponse<>(
                false,
                "Lỗi hệ thống: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()),
                null
            ));
        }
    }
}