package com.mathbridge.payment.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.payment.dto.MomoCreatePaymentRequest;
import com.mathbridge.payment.dto.MomoCreatePaymentResponse;
import com.mathbridge.payment.dto.MomoIpnRequest;
import com.mathbridge.payment.service.PaymentMomo;
import com.mathbridge.payment.service.PaymentMomoIpnService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý payment MoMo
 */
@RestController
@RequestMapping("/api/portal/payment/momo")
@CrossOrigin(origins = "*")
public class PaymentMomoController {

    @Autowired
    private PaymentMomo paymentMomo;

    @Autowired
    private PaymentMomoIpnService ipnService;

    @Autowired
    private com.mathbridge.repository.TaiKhoanRepository taiKhoanRepository;

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
            String studentId = extractStudentId(authentication);
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
     * Manually update payment status (for testing/debugging)
     * GET/POST /api/portal/payment/momo/manual-update?orderId=HD119&status=success
     * 
     * Chỉ dùng cho testing khi IPN callback không được gọi
     * Hỗ trợ cả GET và POST để dễ test từ browser
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
     * Lấy studentId từ JWT token
     * JWT có claim "uid" (ID_TK), từ đó lấy idHsRef từ TaiKhoan
     */
    private String extractStudentId(Authentication authentication) {
        if (authentication == null) {
            System.out.println("[PaymentMomoController] Authentication is null");
            return null;
        }
        
        if (!(authentication.getPrincipal() instanceof Jwt)) {
            System.out.println("[PaymentMomoController] Principal is not Jwt: " + authentication.getPrincipal().getClass().getName());
            return null;
        }
        
        Jwt jwt = (Jwt) authentication.getPrincipal();
        
        // Debug: Log tất cả claims
        System.out.println("[PaymentMomoController] JWT claims: " + jwt.getClaims().keySet());
        
        // Thử lấy uid từ claim
        String idTk = jwt.getClaimAsString("uid");
        System.out.println("[PaymentMomoController] idTk from claim 'uid': " + idTk);
        
        // Nếu không có uid, thử lấy từ subject (email) và tìm TaiKhoan
        if (idTk == null) {
            String email = jwt.getSubject();
            System.out.println("[PaymentMomoController] Email from subject: " + email);
            if (email != null) {
                // Tìm TaiKhoan theo email
                idTk = taiKhoanRepository.findByEmail(email)
                        .map(tk -> tk.getIdTk())
                        .orElse(null);
                System.out.println("[PaymentMomoController] idTk from email: " + idTk);
            }
        }
        
        if (idTk == null) {
            System.out.println("[PaymentMomoController] Cannot find idTk");
            return null;
        }
        
        // Lấy TaiKhoan và trả về idHsRef
        String idHsRef = taiKhoanRepository.findById(idTk)
                .map(tk -> tk.getIdHs())
                .orElse(null);
        System.out.println("[PaymentMomoController] idHsRef: " + idHsRef);
        return idHsRef;
    }
}

