package com.mathbridge.payment.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.payment.dto.MomoCreatePaymentRequest;
import com.mathbridge.payment.dto.MomoCreatePaymentResponse;
import com.mathbridge.payment.dto.MomoIpnRequest;
import com.mathbridge.payment.service.PaymentMomo;
import com.mathbridge.payment.service.PaymentMomoIpnService;
import com.mathbridge.service.StudentContextService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý payment MoMo
 */
@RestController
@RequestMapping("/api/portal/payment/momo")
public class PaymentMomoController {

    @Autowired
    private PaymentMomo paymentMomo;

    @Autowired
    private PaymentMomoIpnService ipnService;

    @Autowired
    private StudentContextService studentContextService;

    /**
     * Tạo payment request
     * POST /api/portal/payment/momo/create
     * 
     * Cần JWT token với role R001 (HOC_SINH)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestBody @Valid MomoCreatePaymentRequest req,
            Authentication authentication) {
        try {
            // Lấy studentId từ JWT token
            String studentId = studentContextService.resolveStudentId(authentication);
            if (studentId == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<>(false, "Không tìm thấy thông tin học sinh trong token", null));
            }

            // Gọi service tạo payment
            MomoCreatePaymentResponse response = paymentMomo.createPayment(req, studentId);

            if (response.getResultCode() == 0) {
                // Thành công
                Map<String, Object> data = new HashMap<>();
                data.put("payUrl", response.getPayUrl());
                data.put("orderId", response.getOrderId());
                data.put("amount", response.getAmount());
                data.put("deeplink", response.getDeeplink());
                return ResponseEntity.ok(new ApiResponse<>(true, "Tạo payment thành công", data));
            } else {
                // Lỗi từ MoMo
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "MoMo trả về lỗi: " + response.getMessage(), null));
            }

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi khi tạo payment: " + e.getMessage(), null));
        }
    }

    /**
     * IPN callback từ MoMo
     * POST /api/portal/payment/momo/ipn
     * 
     * Endpoint này là PUBLIC (không cần JWT) vì MoMo sẽ gọi từ server
     */
    @PostMapping("/ipn")
    public ResponseEntity<?> handleIpn(@RequestBody MomoIpnRequest ipn) {
        try {
            System.out.println("[PaymentMomoController] ===== IPN Endpoint Called =====");
            System.out.println("[PaymentMomoController] Request body received");
            return ipnService.handleIpn(ipn);
        } catch (Exception e) {
            System.out.println("[PaymentMomoController] IPN Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("{\"resultCode\":5,\"message\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Kiểm tra trạng thái payment theo orderId
     * GET /api/portal/payment/momo/status?orderId=HD119
     * 
     * Public endpoint để frontend có thể check status sau khi redirect về
     */
    @GetMapping("/status")
    public ResponseEntity<?> checkPaymentStatus(@RequestParam String orderId) {
        try {
            return ipnService.checkPaymentStatus(orderId);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi khi kiểm tra trạng thái: " + e.getMessage(), null));
        }
    }
    
    /**
     * Query và update payment status từ MoMo (khi IPN không được gọi)
     * GET /api/portal/payment/momo/query-status?orderId=HD119
     * 
     * Endpoint này sẽ query từ MoMo và update DB nếu cần
     */
    @GetMapping("/query-status")
    public ResponseEntity<?> queryAndUpdatePaymentStatus(@RequestParam String orderId) {
        try {
            return ipnService.queryAndUpdatePaymentStatus(orderId);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi khi query trạng thái: " + e.getMessage(), null));
        }
    }

    /**
     * Manually update payment status (for testing/debugging)
     * GET/POST /api/portal/payment/momo/manual-update?orderId=HD119&status=success
     * 
     * Chỉ dùng cho testing khi IPN callback không được gọi
     * Hỗ trợ cả GET và POST để dễ test từ browser
     * PUBLIC endpoint - không cần authentication
     */
    @RequestMapping(value = "/manual-update", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> manualUpdatePaymentStatus(
            @RequestParam String orderId,
            @RequestParam(defaultValue = "success") String status) {
        try {
            System.out.println("[PaymentMomoController] Manual update payment status - OrderId: " + orderId + ", Status: " + status);
            return ipnService.manualUpdatePaymentStatus(orderId, status);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi khi cập nhật trạng thái: " + e.getMessage(), null));
        }
    }
    
    /**
     * Callback endpoint khi user redirect về từ MoMo sau khi thanh toán
     * GET /api/portal/payment/momo/callback?orderId=HD119&resultCode=0
     * 
     * Endpoint này sẽ tự động update payment status và redirect về trang chính
     * PUBLIC endpoint - không cần authentication
     * Tự động redirect về frontend sau khi update DB (ẩn việc update)
     */
    @GetMapping("/callback")
    public ResponseEntity<?> paymentCallback(
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) Integer resultCode,
            @RequestParam(required = false) String message) {
        try {
            System.out.println("[PaymentMomoController] ===== Payment Callback =====");
            System.out.println("[PaymentMomoController] OrderId: " + orderId);
            System.out.println("[PaymentMomoController] ResultCode: " + resultCode);
            System.out.println("[PaymentMomoController] Message: " + message);
            
            // URL redirect về frontend
            String redirectUrl = "http://localhost:8000/pages/Courses.html";
            
            if (orderId != null && !orderId.isEmpty()) {
                // Tự động update status dựa trên resultCode (ẩn - không hiển thị cho user)
                String status = (resultCode != null && resultCode == 0) ? "success" : "failed";
                try {
                    ipnService.manualUpdatePaymentStatus(orderId, status);
                    System.out.println("[PaymentMomoController] Payment status updated successfully for orderId: " + orderId);
                    // Thêm orderId vào redirect URL để frontend có thể hiển thị thông báo
                    redirectUrl += "?payment=success&orderId=" + orderId;
                } catch (Exception updateError) {
                    System.err.println("[PaymentMomoController] Error updating payment status: " + updateError.getMessage());
                    // Vẫn redirect về frontend dù có lỗi update
                    redirectUrl += "?payment=error&orderId=" + orderId;
                }
            } else {
                // Không có orderId, vẫn redirect về trang chính
                redirectUrl += "?payment=error";
            }
            
            // HTTP 302 Redirect về frontend (ẩn việc update DB)
            return ResponseEntity.status(302)
                    .header("Location", redirectUrl)
                    .build();
            
        } catch (Exception e) {
            System.out.println("[PaymentMomoController] Callback Error: " + e.getMessage());
            e.printStackTrace();
            // Nếu có lỗi, vẫn redirect về frontend
            return ResponseEntity.status(302)
                    .header("Location", "http://localhost:8000/pages/Courses.html?payment=error")
                    .build();
        }
    }
}

