package com.mathbridge.payment.service;

import com.mathbridge.entity.HoaDon;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.payment.dto.CashPaymentRequest;
import com.mathbridge.payment.dto.CashPaymentResponse;
import com.mathbridge.repository.HoaDonRepository;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class PaymentCashService {

    private final LopHocRepository lopHocRepository;
    private final HocSinhRepository hocSinhRepository;
    private final HoaDonRepository hoaDonRepository;

    public PaymentCashService(LopHocRepository lopHocRepository,
                              HocSinhRepository hocSinhRepository,
                              HoaDonRepository hoaDonRepository) {
        this.lopHocRepository = lopHocRepository;
        this.hocSinhRepository = hocSinhRepository;
        this.hoaDonRepository = hoaDonRepository;
    }

    @Transactional
    public CashPaymentResponse createCashInvoice(CashPaymentRequest request, String studentId) {
        LopHoc lopHoc = lopHocRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + request.getCourseId()));

        HocSinh hocSinh = hocSinhRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + studentId));

        BigDecimal mucGiaThang = lopHoc.getMucGiaThang();
        if (mucGiaThang == null) {
            throw new RuntimeException("Lớp học chưa có mức giá/tháng");
        }

        BigDecimal totalAmount = mucGiaThang.multiply(BigDecimal.valueOf(request.getMonths()));
        String idHoaDon = generateHoaDonId();
        LocalDate ngayDangKy = LocalDate.now();
        LocalDate hanThanhToan = ngayDangKy.plusDays(7);

        HoaDon hoaDon = new HoaDon();
        hoaDon.setIdHoaDon(idHoaDon);
        hoaDon.setIdLh(lopHoc.getIdLh());
        hoaDon.setIdHs(hocSinh.getIdHs());
        hoaDon.setLopHoc(lopHoc);
        hoaDon.setHocSinh(hocSinh);
        hoaDon.setNgayDangKy(ngayDangKy);
        hoaDon.setHanThanhToan(hanThanhToan);
        hoaDon.setSoThang(String.valueOf(request.getMonths()));
        hoaDon.setTongTien(totalAmount);
        hoaDon.setTrangThai("Chua Thanh Toan");
        hoaDonRepository.save(hoaDon);

        CashPaymentResponse response = new CashPaymentResponse();
        response.setIdHoaDon(idHoaDon);
        response.setAmount(totalAmount);
        response.setStatus(hoaDon.getTrangThai());
        response.setMonths(request.getMonths());
        response.setCourseName(lopHoc.getTenLop());
        response.setDueDate(hanThanhToan);
        return response;
    }

    private String generateHoaDonId() {
        int maxNo = hoaDonRepository.findMaxHdNumber();
        int nextNo = maxNo + 1;
        if (nextNo <= 999) {
            return String.format("HD%03d", nextNo);
        } else {
            long timestamp = System.currentTimeMillis() % 100000000L;
            return String.format("HD%08d", timestamp);
        }
    }
}

