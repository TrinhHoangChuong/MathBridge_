package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.DangKyLHRequest;
import com.mathbridge.dto.DangKyLHResponse;
import com.mathbridge.service.DangKyLHService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý API đăng ký khóa học (public, không cần auth)
 */
@RestController
@RequestMapping("/api/public/enroll")
@CrossOrigin(origins = "*")
public class DangKyLHController {

    @Autowired
    private DangKyLHService dangKyLHService;

    /**
     * API: Đăng ký khóa học khi chưa đăng nhập
     * POST /api/public/enroll/pending
     * Tự tạo hoặc lấy học sinh từ SĐT
     */
    @PostMapping("/pending")
    public ResponseEntity<?> enrollPending(@RequestBody DangKyLHRequest req) {
        try {
            // Validate request body
            if (req == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<DangKyLHResponse>(
                    false, 
                    "Yêu cầu không hợp lệ: dữ liệu đăng ký không được để trống", 
                    null
                ));
            }
            
            DangKyLHResponse response = dangKyLHService.createPendingEnrollment(req);
            return ResponseEntity.ok(new ApiResponse<DangKyLHResponse>(
                true, 
                "Đăng ký thành công. Vui lòng đợi xác nhận từ trung tâm. Trạng thái: pending", 
                response
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<DangKyLHResponse>(
                false, 
                e.getMessage(), 
                null
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<DangKyLHResponse>(
                false, 
                "Lỗi hệ thống khi đăng ký: " + e.getMessage(), 
                null
            ));
        }
    }
}


