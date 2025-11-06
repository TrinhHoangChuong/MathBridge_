package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.StudentDashboardDTO;
import com.mathbridge.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            // Extract student ID from authentication context
            String studentId = extractStudentId(authentication);

            if (studentId == null) {
                return ResponseEntity.status(403)
                        .body(new ApiResponse<>(false, "Không có quyền truy cập", null));
            }

            StudentDashboardDTO dashboard = studentService.getStudentDashboard(studentId);

            if (dashboard == null) {
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>(false, "Không tìm thấy thông tin học sinh", null));
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy dữ liệu dashboard thành công", dashboard));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi server: " + e.getMessage(), null));
        }
    }

    private String extractStudentId(Authentication authentication) {
        // In a real implementation, extract from JWT token or authentication principal
        // For now, return a mock student ID
        return "HS001";
    }
}