package com.mathbridge.payment.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.payment.dto.CashPaymentRequest;
import com.mathbridge.payment.dto.CashPaymentResponse;
import com.mathbridge.payment.service.PaymentCashService;
import com.mathbridge.repository.TaiKhoanRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal/payment/cash")
@CrossOrigin(origins = "*")
public class PaymentCashController {

    private final PaymentCashService paymentCashService;
    private final TaiKhoanRepository taiKhoanRepository;

    public PaymentCashController(PaymentCashService paymentCashService,
                                 TaiKhoanRepository taiKhoanRepository) {
        this.paymentCashService = paymentCashService;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    @PostMapping
    public ResponseEntity<?> createCashInvoice(@Valid @RequestBody CashPaymentRequest request,
                                               Authentication authentication) {
        String studentId = extractStudentId(authentication);
        if (studentId == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Không tìm thấy thông tin học sinh trong token", null));
        }

        CashPaymentResponse response = paymentCashService.createCashInvoice(request, studentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã ghi nhận thanh toán tiền mặt", response));
    }

    private String extractStudentId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        if (!(authentication.getPrincipal() instanceof Jwt jwt)) {
            return null;
        }
        String idTk = jwt.getClaimAsString("uid");
        if (idTk == null) {
            String email = jwt.getSubject();
            if (email != null) {
                idTk = taiKhoanRepository.findByEmail(email)
                        .map(tk -> tk.getIdTk())
                        .orElse(null);
            }
        }
        if (idTk == null) {
            return null;
        }
        return taiKhoanRepository.findById(idTk)
                .map(tk -> tk.getIdHs())
                .orElse(null);
    }
}

