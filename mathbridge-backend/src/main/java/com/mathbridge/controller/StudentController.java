package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.StudentDashboardDTO;
import com.mathbridge.service.StudentService;
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
            return ResponseEntity.badRequest().body(new ApiResponse<StudentDashboardDTO>(
                false,
                e.getMessage(),
                null
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<StudentDashboardDTO>(
                false,
                "Lỗi hệ thống: " + e.getMessage(),
                null
            ));
        }
    }
}