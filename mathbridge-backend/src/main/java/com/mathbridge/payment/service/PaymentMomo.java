package com.mathbridge.payment.service;

import com.mathbridge.entity.HoaDon;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.payment.dto.MomoCreatePaymentRequest;
import com.mathbridge.payment.dto.MomoCreatePaymentResponse;
import com.mathbridge.payment.utils.HmacSignatureUtil;
import com.mathbridge.repository.HoaDonRepository;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service xử lý thanh toán MoMo
 */
@Service
public class PaymentMomo {

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Value("${momo.return-url}")
    private String returnUrl;

    @Autowired
    private LopHocRepository lopHocRepository;

    @Autowired
    private HocSinhRepository hocSinhRepository;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Tạo payment request và gọi MoMo API
     * 
     * @param req Request từ frontend (courseId, months)
     * @param studentId ID học sinh đang đăng nhập
     * @return Response từ MoMo (payUrl, resultCode, ...)
     */
    @Transactional
    public MomoCreatePaymentResponse createPayment(MomoCreatePaymentRequest req, String studentId) {
        // 1. Validate và lấy thông tin lớp học
        LopHoc lopHoc = lopHocRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + req.getCourseId()));

        // 2. Validate học sinh
        HocSinh hocSinh = hocSinhRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + studentId));

        // 3. Tính toán số tiền: mucGiaThang * months
        BigDecimal mucGiaThang = lopHoc.getMucGiaThang();
        if (mucGiaThang == null) {
            throw new RuntimeException("Lớp học chưa có mức giá/tháng");
        }
        long amount = mucGiaThang.multiply(BigDecimal.valueOf(req.getMonths())).longValue();

        // 4. Tạo ID_HoaDon ngắn (HD###) để phù hợp với DB length = 10
        String idHoaDon = generateHoaDonId();

        // 5. Tạo orderId cho MoMo (có thể dùng ID_HoaDon hoặc tạo riêng)
        // Dùng ID_HoaDon làm orderId để đảm bảo unique và ngắn gọn
        String orderId = idHoaDon;

        // 6. Tạo requestId (UUID)
        String requestId = UUID.randomUUID().toString();

        // 7. Tạo orderInfo
        String orderInfo = String.format("Thanh toan khoa hoc %s - %d thang", lopHoc.getTenLop(), req.getMonths());

        // 8. Tạo extraData (lưu courseId và months để dùng khi IPN callback)
        String extraData = String.format("courseId=%s&months=%d&studentId=%s", req.getCourseId(), req.getMonths(), studentId);

        // 9. Tạo raw signature string
        String rawSignature = String.format(
                "accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                accessKey,
                amount,
                extraData,
                ipnUrl,
                orderId,
                orderInfo,
                partnerCode,
                returnUrl,
                requestId,
                "captureWallet"
        );

        // 10. Ký signature
        String signature;
        try {
            signature = HmacSignatureUtil.sign(secretKey, rawSignature);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo signature: " + e.getMessage(), e);
        }

        // 11. Build payload cho MoMo
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", partnerCode);
        payload.put("partnerName", "MathBridge");
        payload.put("storeId", "MathBridgeStore");
        payload.put("requestId", requestId);
        payload.put("amount", amount);
        payload.put("orderId", orderId);
        payload.put("orderInfo", orderInfo);
        payload.put("ipnUrl", ipnUrl);
        payload.put("redirectUrl", returnUrl);
        payload.put("extraData", extraData);
        payload.put("requestType", "captureWallet");
        payload.put("signature", signature);

        // 12. Gọi MoMo API
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    httpEntity,
                    Map.class
            );

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new RuntimeException("MoMo API trả về lỗi: " + response.getStatusCode());
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> momoResponse = (Map<String, Object>) response.getBody();

            // 13. Parse response từ MoMo
            MomoCreatePaymentResponse paymentResponse = new MomoCreatePaymentResponse();
            paymentResponse.setResultCode((Integer) momoResponse.get("resultCode"));
            paymentResponse.setMessage((String) momoResponse.get("message"));
            paymentResponse.setPayUrl((String) momoResponse.get("payUrl"));
            paymentResponse.setOrderId(orderId);
            paymentResponse.setRequestId(requestId);
            paymentResponse.setAmount(amount);
            paymentResponse.setDeeplink((String) momoResponse.get("deeplink"));

            // 14. Lưu HoaDon với status PENDING
            HoaDon hoaDon = new HoaDon();
            hoaDon.setIdHoaDon(idHoaDon); // Dùng ID_HoaDon ngắn (HD###)
            // set khóa ngoại thô để mapping khớp với DB (ID_LH, ID_HS NOT NULL)
            hoaDon.setIdLh(lopHoc.getIdLh());
            hoaDon.setIdHs(hocSinh.getIdHs());
            hoaDon.setLopHoc(lopHoc);
            hoaDon.setHocSinh(hocSinh);
            hoaDon.setNgayDangKy(LocalDate.now());
            hoaDon.setSoThang(String.valueOf(req.getMonths()));
            hoaDon.setTongTien(BigDecimal.valueOf(amount));
            hoaDon.setTrangThai("PENDING");
            hoaDonRepository.save(hoaDon);

            return paymentResponse;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi MoMo API: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo ID_HoaDon unique: HD### (HD + 3 số) để phù hợp với DB length = 10
     * Format: HD001, HD002, ..., HD999
     * 
     * @return ID_HoaDon (5 ký tự: HD + 3 số)
     */
    private String generateHoaDonId() {
        // Lấy số lớn nhất hiện có và tăng lên 1
        int maxNo = hoaDonRepository.findMaxHdNumber();
        int nextNo = maxNo + 1;
        
        // Format: HD### (tối đa HD999, nếu vượt quá thì dùng timestamp ngắn)
        if (nextNo <= 999) {
            return String.format("HD%03d", nextNo);
        } else {
            // Fallback: dùng timestamp ngắn (8 số cuối) để đảm bảo <= 10 ký tự
            long timestamp = System.currentTimeMillis() % 100000000L; // 8 số cuối
            return String.format("HD%08d", timestamp);
        }
    }
}

