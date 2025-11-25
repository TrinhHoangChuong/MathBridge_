package com.mathbridge.payment.service;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.entity.HoaDon;
import com.mathbridge.payment.dto.MomoIpnRequest;
import com.mathbridge.payment.utils.HmacSignatureUtil;
import com.mathbridge.repository.HoaDonRepository;
import com.mathbridge.service.DangKyLHService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service xử lý IPN callback từ MoMo
 */
@Service
public class PaymentMomoIpnService {

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private DangKyLHService dangKyLHService;

    /**
     * Xử lý IPN callback từ MoMo
     */
    @Transactional
    public ResponseEntity<?> handleIpn(MomoIpnRequest ipn) {
        try {
            System.out.println("[PaymentMomoIpnService] ===== IPN Callback Received =====");
            System.out.println("[PaymentMomoIpnService] OrderId: " + ipn.getOrderId());
            System.out.println("[PaymentMomoIpnService] ResultCode: " + ipn.getResultCode());
            System.out.println("[PaymentMomoIpnService] Amount: " + ipn.getAmount());
            System.out.println("[PaymentMomoIpnService] ExtraData: " + ipn.getExtraData());
            
            // 1. Verify signature
            String rawSignature = String.format(
                    "accessKey=%s&amount=%s&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%s&resultCode=%s&transId=%s",
                    accessKey,
                    ipn.getAmount(),
                    ipn.getExtraData() != null ? ipn.getExtraData() : "",
                    ipn.getMessage() != null ? ipn.getMessage() : "",
                    ipn.getOrderId(),
                    ipn.getOrderInfo() != null ? ipn.getOrderInfo() : "",
                    ipn.getOrderType() != null ? ipn.getOrderType() : "",
                    ipn.getPartnerCode(),
                    ipn.getPayType() != null ? ipn.getPayType() : "",
                    ipn.getRequestId(),
                    ipn.getResponseTime(),
                    ipn.getResultCode(),
                    ipn.getTransId() != null ? ipn.getTransId() : ""
            );

            String expectedSignature;
            try {
                expectedSignature = HmacSignatureUtil.sign(secretKey, rawSignature);
            } catch (Exception e) {
                return ResponseEntity.status(400)
                        .body("{\"resultCode\":5,\"message\":\"Invalid signature generation\"}");
            }

            if (!expectedSignature.equals(ipn.getSignature())) {
                return ResponseEntity.status(400)
                        .body("{\"resultCode\":5,\"message\":\"Invalid signature\"}");
            }

            // 2. Tìm HoaDon theo orderId
            Optional<HoaDon> hoaDonOpt = hoaDonRepository.findById(ipn.getOrderId());
            if (hoaDonOpt.isEmpty()) {
                return ResponseEntity.status(400)
                        .body("{\"resultCode\":5,\"message\":\"Order not found\"}");
            }

            HoaDon hoaDon = hoaDonOpt.get();

            // 3. Verify amount khớp
            if (hoaDon.getTongTien().longValue() != ipn.getAmount()) {
                return ResponseEntity.status(400)
                        .body("{\"resultCode\":5,\"message\":\"Amount mismatch\"}");
            }

            // 4. Cập nhật trạng thái HoaDon
            System.out.println("[PaymentMomoIpnService] Processing IPN for orderId: " + ipn.getOrderId());
            System.out.println("[PaymentMomoIpnService] resultCode: " + ipn.getResultCode());
            System.out.println("[PaymentMomoIpnService] amount: " + ipn.getAmount());
            
            if (ipn.getResultCode() == 0) {
                // Thanh toán thành công
                System.out.println("[PaymentMomoIpnService] Payment successful - updating to 'Da Thanh Toan'");
                hoaDon.setTrangThai("Da Thanh Toan");
                hoaDon.setNgayThanhToan(LocalDate.now());
                hoaDon.setHanThanhToan(null); // Đã thanh toán thì không còn hạn
                System.out.println("[PaymentMomoIpnService] Set NgayThanhToan: " + hoaDon.getNgayThanhToan());
                System.out.println("[PaymentMomoIpnService] Set TrangThai: " + hoaDon.getTrangThai());
                
                // Tự động đăng ký lớp học sau khi thanh toán thành công
                try {
                    String studentId = hoaDon.getIdHs();
                    String classId = hoaDon.getIdLh();
                    boolean enrolled = dangKyLHService.autoEnrollAfterPayment(studentId, classId);
                    if (enrolled) {
                        System.out.println("[PaymentMomoIpnService] Successfully auto-enrolled student " + studentId + " to class " + classId);
                    } else {
                        System.out.println("[PaymentMomoIpnService] Student " + studentId + " already enrolled in class " + classId);
                    }
                } catch (Exception enrollError) {
                    System.err.println("[PaymentMomoIpnService] Error auto-enrolling after payment: " + enrollError.getMessage());
                    // Không throw exception để không ảnh hưởng đến việc cập nhật HoaDon
                    enrollError.printStackTrace();
                }
            } else {
                // Thanh toán thất bại
                System.out.println("[PaymentMomoIpnService] Payment failed (resultCode: " + ipn.getResultCode() + ") - updating to 'Chua Thanh Toan'");
                hoaDon.setTrangThai("Chua Thanh Toan");
                hoaDon.setNgayThanhToan(null); // Xóa ngày thanh toán nếu thất bại
            }

            hoaDonRepository.save(hoaDon);
            System.out.println("[PaymentMomoIpnService] HoaDon updated successfully. ID: " + hoaDon.getIdHoaDon() + ", TrangThai: " + hoaDon.getTrangThai());

            // 5. Trả response cho MoMo
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 0);
            response.put("message", "Success");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("{\"resultCode\":5,\"message\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Kiểm tra trạng thái payment theo orderId
     * Public method để frontend có thể check status
     */
    public ResponseEntity<?> checkPaymentStatus(String orderId) {
        try {
            Optional<HoaDon> hoaDonOpt = hoaDonRepository.findById(orderId);
            if (hoaDonOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>(false, "Không tìm thấy đơn hàng với ID: " + orderId, null));
            }

            HoaDon hoaDon = hoaDonOpt.get();
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", hoaDon.getIdHoaDon());
            data.put("status", hoaDon.getTrangThai());
            data.put("amount", hoaDon.getTongTien());
            data.put("ngayDangKy", hoaDon.getNgayDangKy());
            data.put("ngayThanhToan", hoaDon.getNgayThanhToan());
            data.put("hanThanhToan", hoaDon.getHanThanhToan());
            data.put("isPaid", "Da Thanh Toan".equals(hoaDon.getTrangThai()));

            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy trạng thái thành công", data));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi khi kiểm tra trạng thái: " + e.getMessage(), null));
        }
    }

    /**
     * Query payment status từ MoMo API và update DB nếu cần
     * Dùng khi IPN callback không được gọi (localhost)
     */
    @Transactional
    public ResponseEntity<?> queryAndUpdatePaymentStatus(String orderId) {
        try {
            System.out.println("[PaymentMomoIpnService] ===== Query Payment Status from MoMo =====");
            System.out.println("[PaymentMomoIpnService] OrderId: " + orderId);
            
            // 1. Tìm HoaDon trong DB
            Optional<HoaDon> hoaDonOpt = hoaDonRepository.findById(orderId);
            if (hoaDonOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>(false, "Không tìm thấy đơn hàng với ID: " + orderId, null));
            }

            HoaDon hoaDon = hoaDonOpt.get();
            
            // 2. Nếu đã thanh toán rồi thì không cần query lại
            if ("Da Thanh Toan".equals(hoaDon.getTrangThai())) {
                System.out.println("[PaymentMomoIpnService] Payment already completed, skipping query");
                Map<String, Object> data = new HashMap<>();
                data.put("orderId", hoaDon.getIdHoaDon());
                data.put("status", hoaDon.getTrangThai());
                data.put("ngayThanhToan", hoaDon.getNgayThanhToan());
                data.put("isPaid", true);
                return ResponseEntity.ok(new ApiResponse<>(true, "Đơn hàng đã thanh toán", data));
            }
            
            // 3. Query từ MoMo API (cần implement MoMo query API)
            // Tạm thời: Nếu status là PENDING và đã quá thời gian, có thể user đã thanh toán
            // Nhưng vì không có MoMo query API trong code hiện tại, ta sẽ dùng manual update
            // Hoặc frontend có thể gọi manual-update endpoint sau khi user confirm payment
            
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", hoaDon.getIdHoaDon());
            data.put("status", hoaDon.getTrangThai());
            data.put("message", "Vui lòng xác nhận thanh toán hoặc dùng manual-update endpoint");
            data.put("isPaid", false);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Trạng thái hiện tại", data));
            
        } catch (Exception e) {
            System.out.println("[PaymentMomoIpnService] Error querying status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi khi query trạng thái: " + e.getMessage(), null));
        }
    }

    /**
     * Manually update payment status (for testing/debugging)
     * Chỉ dùng khi IPN callback không được gọi
     */
    @Transactional
    public ResponseEntity<?> manualUpdatePaymentStatus(String orderId, String status) {
        try {
            System.out.println("[PaymentMomoIpnService] ===== Manual Update Payment Status =====");
            System.out.println("[PaymentMomoIpnService] OrderId: " + orderId);
            System.out.println("[PaymentMomoIpnService] Status: " + status);
            
            Optional<HoaDon> hoaDonOpt = hoaDonRepository.findById(orderId);
            if (hoaDonOpt.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(new ApiResponse<>(false, "Không tìm thấy đơn hàng với ID: " + orderId, null));
            }

            HoaDon hoaDon = hoaDonOpt.get();
            
            if ("success".equalsIgnoreCase(status) || "paid".equalsIgnoreCase(status) || "thanhcong".equalsIgnoreCase(status)) {
                hoaDon.setTrangThai("Da Thanh Toan");
                hoaDon.setNgayThanhToan(LocalDate.now());
                hoaDon.setHanThanhToan(null); // Đã thanh toán thì không còn hạn
                System.out.println("[PaymentMomoIpnService] Updated to 'Da Thanh Toan'");
                System.out.println("[PaymentMomoIpnService] Set NgayThanhToan: " + hoaDon.getNgayThanhToan());
                System.out.println("[PaymentMomoIpnService] Set HanThanhToan: null");
                
                // Tự động đăng ký lớp học sau khi thanh toán thành công
                try {
                    String studentId = hoaDon.getIdHs();
                    String classId = hoaDon.getIdLh();
                    boolean enrolled = dangKyLHService.autoEnrollAfterPayment(studentId, classId);
                    if (enrolled) {
                        System.out.println("[PaymentMomoIpnService] Successfully auto-enrolled student " + studentId + " to class " + classId);
                    } else {
                        System.out.println("[PaymentMomoIpnService] Student " + studentId + " already enrolled in class " + classId);
                    }
                } catch (Exception enrollError) {
                    System.err.println("[PaymentMomoIpnService] Error auto-enrolling after payment: " + enrollError.getMessage());
                    enrollError.printStackTrace();
                }
            } else if ("failed".equalsIgnoreCase(status) || "fail".equalsIgnoreCase(status) || "thatbai".equalsIgnoreCase(status)) {
                hoaDon.setTrangThai("Chua Thanh Toan");
                hoaDon.setNgayThanhToan(null); // Xóa ngày thanh toán nếu thất bại
                System.out.println("[PaymentMomoIpnService] Updated to 'Chua Thanh Toan'");
            } else {
                return ResponseEntity.status(400)
                        .body(new ApiResponse<>(false, "Status không hợp lệ. Dùng 'success', 'paid', 'thanhcong' hoặc 'failed', 'fail', 'thatbai'", null));
            }

            HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
            System.out.println("[PaymentMomoIpnService] HoaDon updated successfully. ID: " + savedHoaDon.getIdHoaDon() + 
                             ", TrangThai: " + savedHoaDon.getTrangThai() + 
                             ", NgayThanhToan: " + savedHoaDon.getNgayThanhToan() +
                             ", HanThanhToan: " + savedHoaDon.getHanThanhToan());

            Map<String, Object> data = new HashMap<>();
            data.put("orderId", hoaDon.getIdHoaDon());
            data.put("status", hoaDon.getTrangThai());
            data.put("ngayThanhToan", hoaDon.getNgayThanhToan());

            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái thành công", data));
        } catch (Exception e) {
            System.out.println("[PaymentMomoIpnService] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi khi cập nhật trạng thái: " + e.getMessage(), null));
        }
    }
}

