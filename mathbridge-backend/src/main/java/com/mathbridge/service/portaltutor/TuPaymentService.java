package com.mathbridge.service.portaltutor;

import com.mathbridge.dto.portaltutor.*;
import com.mathbridge.entity.*;
import com.mathbridge.repository.HocSinhRepository;
import com.mathbridge.repository.portaltutor.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TuPaymentService {

    private final TuHoaDonRepository hoaDonRepository;
    private final TuLichSuThanhToanRepository lichSuThanhToanRepository;
    private final TuPhuongThucThanhToanRepository phuongThucThanhToanRepository;

    public TuPaymentService(
            TuHoaDonRepository hoaDonRepository,
            HocSinhRepository hocSinhRepository,
            TuLichSuThanhToanRepository lichSuThanhToanRepository,
            TuPhuongThucThanhToanRepository phuongThucThanhToanRepository) {
        this.hoaDonRepository = hoaDonRepository;
        this.lichSuThanhToanRepository = lichSuThanhToanRepository;
        this.phuongThucThanhToanRepository = phuongThucThanhToanRepository;
    }

    // Lấy danh sách học sinh chưa thanh toán
    public List<TuUnpaidInvoiceDTO> getUnpaidInvoices() {
        List<HoaDon> unpaidInvoices = hoaDonRepository.findUnpaidInvoices();
        return unpaidInvoices.stream().map(invoice -> {
            TuUnpaidInvoiceDTO dto = new TuUnpaidInvoiceDTO();
            dto.setIdHoaDon(invoice.getIdHoaDon());
            dto.setIdHs(invoice.getHocSinh().getIdHs());
            dto.setStudentName(invoice.getHocSinh().getHo() + " " + 
                              (invoice.getHocSinh().getTenDem() != null ? invoice.getHocSinh().getTenDem() + " " : "") + 
                              invoice.getHocSinh().getTen());
            if (invoice.getLopHoc() != null) {
                dto.setTenLop(invoice.getLopHoc().getTenLop());
            }
            dto.setTongTien(invoice.getTongTien());
            dto.setNgayDangKy(invoice.getNgayDangKy());
            dto.setHanThanhToan(invoice.getHanThanhToan());
            dto.setSoThang(invoice.getSoThang());
            dto.setTrangThai(invoice.getTrangThai());
            return dto;
        }).collect(Collectors.toList());
    }

    // Lấy thông tin chi tiết học sinh và hóa đơn
    public TuPaymentDTO getPaymentDetails(String idHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại"));
        
        HocSinh hocSinh = hoaDon.getHocSinh();
        LopHoc lopHoc = hoaDon.getLopHoc();
        
        TuPaymentDTO dto = new TuPaymentDTO();
        dto.setIdHoaDon(hoaDon.getIdHoaDon());
        dto.setIdHs(hocSinh.getIdHs());
        dto.setStudentName(hocSinh.getHo() + " " + 
                          (hocSinh.getTenDem() != null ? hocSinh.getTenDem() + " " : "") + 
                          hocSinh.getTen());
        dto.setStudentEmail(hocSinh.getEmail());
        dto.setStudentPhone(hocSinh.getSdt());
        dto.setStudentAddress(hocSinh.getDiaChi());
        
        if (lopHoc != null) {
            dto.setIdLh(lopHoc.getIdLh());
            dto.setTenLop(lopHoc.getTenLop());
            if (lopHoc.getChuongTrinh() != null) {
                dto.setChuongTrinh(lopHoc.getChuongTrinh().getTenCt() != null ? 
                    lopHoc.getChuongTrinh().getTenCt() : "");
            }
        }
        
        dto.setTongTien(hoaDon.getTongTien());
        dto.setHanThanhToan(hoaDon.getHanThanhToan());
        
        return dto;
    }

    // Lấy danh sách phương thức thanh toán
    public List<TuPaymentMethodDTO> getPaymentMethods() {
        List<PhuongThucThanhToan> methods = phuongThucThanhToanRepository.findAll();
        return methods.stream().map(method -> {
            TuPaymentMethodDTO dto = new TuPaymentMethodDTO();
            dto.setIdPt(method.getIdPt());
            dto.setTenPt(method.getTenPt());
            dto.setHinhThucTt(method.getHinhThucTt());
            dto.setGhiChu(method.getGhiChu());
            return dto;
        }).collect(Collectors.toList());
    }

    // Xử lý thanh toán
    @Transactional
    public TuPaymentDTO processPayment(TuProcessPaymentRequestDTO request) {
        // Lấy hóa đơn
        HoaDon hoaDon = hoaDonRepository.findById(request.getIdHoaDon())
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại"));
        
        // Kiểm tra xem hóa đơn đã được thanh toán chưa
        if (hoaDon.getNgayThanhToan() != null) {
            throw new RuntimeException("Hóa đơn này đã được thanh toán rồi. Ngày thanh toán: " + hoaDon.getNgayThanhToan());
        }
        
        // Lấy phương thức thanh toán
        PhuongThucThanhToan phuongThuc = phuongThucThanhToanRepository.findById(request.getIdPt())
                .orElseThrow(() -> new RuntimeException("Phương thức thanh toán không tồn tại"));
        
        // Tạo ID_LS mới với retry logic để tránh race condition
        String newIdLs = generateUniqueIdLs();
        
        // Tạo lịch sử thanh toán
        LichSuThanhToan lichSuThanhToan = new LichSuThanhToan();
        lichSuThanhToan.setIdLs(newIdLs);
        lichSuThanhToan.setIdPt(phuongThuc.getIdPt()); // QUAN TRỌNG: Phải set idPt trực tiếp vì @JoinColumn có insertable=false
        lichSuThanhToan.setPhuongThucThanhToan(phuongThuc);
        lichSuThanhToan.setTongTien(hoaDon.getTongTien());
        lichSuThanhToan.setTrangThaiThanhToan("Thanh Cong");
        lichSuThanhToan.setHinhThuc(phuongThuc.getHinhThucTt());
        
        // Lấy tháng hiện tại
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yyyy");
        lichSuThanhToan.setThang(now.format(formatter));
        
        lichSuThanhToan.setGhiChu(request.getGhiChu() != null ? 
            "Seed từ Hóa đơn " + hoaDon.getIdHoaDon() + ". " + request.getGhiChu() : 
            "Seed từ Hóa đơn " + hoaDon.getIdHoaDon());
        
        // Lưu lịch sử thanh toán với retry nếu bị duplicate key
        int maxRetries = 5;
        int retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                lichSuThanhToan = lichSuThanhToanRepository.save(lichSuThanhToan);
                break; // Success, exit loop
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                if (e.getMessage() != null && e.getMessage().contains("PRIMARY KEY") && retryCount < maxRetries - 1) {
                    // Duplicate key error, generate new ID and retry
                    retryCount++;
                    newIdLs = generateUniqueIdLs();
                    lichSuThanhToan.setIdLs(newIdLs);
                    System.out.println("Retry " + retryCount + ": Generated new ID_LS: " + newIdLs);
                } else {
                    // Max retries reached or different error, throw exception
                    throw new RuntimeException("Không thể tạo mã thanh toán. Vui lòng thử lại sau.", e);
                }
            }
        }
        
        // Cập nhật hóa đơn
        LocalDate ngayThanhToan = LocalDate.now();
        hoaDon.setNgayThanhToan(ngayThanhToan);
        hoaDon.setTrangThai("Da Thanh Toan");
        hoaDon.setIdLs(newIdLs); // QUAN TRỌNG: Phải set idLs trực tiếp vì @JoinColumn có insertable=false
        hoaDon.setLichSuThanhToan(lichSuThanhToan);
        hoaDonRepository.save(hoaDon);
        
        // Tạo response DTO
        HocSinh hocSinh = hoaDon.getHocSinh();
        LopHoc lopHoc = hoaDon.getLopHoc();
        
        TuPaymentDTO response = new TuPaymentDTO();
        response.setIdHoaDon(hoaDon.getIdHoaDon());
        response.setIdHs(hocSinh.getIdHs());
        response.setStudentName(hocSinh.getHo() + " " + 
                               (hocSinh.getTenDem() != null ? hocSinh.getTenDem() + " " : "") + 
                               hocSinh.getTen());
        response.setStudentEmail(hocSinh.getEmail());
        response.setStudentPhone(hocSinh.getSdt());
        response.setStudentAddress(hocSinh.getDiaChi());
        
        if (lopHoc != null) {
            response.setIdLh(lopHoc.getIdLh());
            response.setTenLop(lopHoc.getTenLop());
            if (lopHoc.getChuongTrinh() != null) {
                response.setChuongTrinh(lopHoc.getChuongTrinh().getTenCt() != null ? 
                    lopHoc.getChuongTrinh().getTenCt() : "");
            }
        }
        
        response.setTongTien(hoaDon.getTongTien());
        response.setIdPt(phuongThuc.getIdPt());
        response.setPaymentMethodName(phuongThuc.getTenPt());
        response.setPaymentMethodType(phuongThuc.getHinhThucTt());
        response.setGhiChu(lichSuThanhToan.getGhiChu());
        response.setNgayThanhToan(ngayThanhToan);
        response.setGioThanhToan(LocalDateTime.now());
        response.setIdLs(newIdLs); // Receipt number
        
        return response;
    }

    // Lấy thông tin hóa đơn sau khi thanh toán
    public TuPaymentDTO getInvoiceDetails(String idHoaDon) {
        HoaDon hoaDon = hoaDonRepository.findById(idHoaDon)
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại"));
        
        HocSinh hocSinh = hoaDon.getHocSinh();
        LopHoc lopHoc = hoaDon.getLopHoc();
        LichSuThanhToan lichSu = hoaDon.getLichSuThanhToan();
        
        TuPaymentDTO dto = new TuPaymentDTO();
        dto.setIdHoaDon(hoaDon.getIdHoaDon());
        dto.setIdHs(hocSinh.getIdHs());
        dto.setStudentName(hocSinh.getHo() + " " + 
                          (hocSinh.getTenDem() != null ? hocSinh.getTenDem() + " " : "") + 
                          hocSinh.getTen());
        dto.setStudentEmail(hocSinh.getEmail());
        dto.setStudentPhone(hocSinh.getSdt());
        dto.setStudentAddress(hocSinh.getDiaChi());
        
        if (lopHoc != null) {
            dto.setIdLh(lopHoc.getIdLh());
            dto.setTenLop(lopHoc.getTenLop());
            if (lopHoc.getChuongTrinh() != null) {
                dto.setChuongTrinh(lopHoc.getChuongTrinh().getTenCt() != null ? 
                    lopHoc.getChuongTrinh().getTenCt() : "");
            }
        }
        
        dto.setTongTien(hoaDon.getTongTien());
        
        if (lichSu != null) {
            dto.setIdPt(lichSu.getPhuongThucThanhToan().getIdPt());
            dto.setPaymentMethodName(lichSu.getPhuongThucThanhToan().getTenPt());
            dto.setPaymentMethodType(lichSu.getHinhThuc());
            dto.setGhiChu(lichSu.getGhiChu());
            dto.setNgayThanhToan(hoaDon.getNgayThanhToan());
            dto.setIdLs(lichSu.getIdLs());
        }
        
        return dto;
    }

    // Lấy danh sách tất cả hóa đơn
    public List<TuInvoiceDTO> getAllInvoices() {
        List<HoaDon> invoices = hoaDonRepository.findAll();
        return invoices.stream().map(invoice -> {
            TuInvoiceDTO dto = new TuInvoiceDTO();
            HocSinh hocSinh = invoice.getHocSinh();
            LopHoc lopHoc = invoice.getLopHoc();
            LichSuThanhToan lichSu = invoice.getLichSuThanhToan();
            
            dto.setIdHoaDon(invoice.getIdHoaDon());
            dto.setIdHs(hocSinh.getIdHs());
            dto.setStudentName(hocSinh.getHo() + " " + 
                              (hocSinh.getTenDem() != null ? hocSinh.getTenDem() + " " : "") + 
                              hocSinh.getTen());
            dto.setStudentEmail(hocSinh.getEmail());
            dto.setStudentPhone(hocSinh.getSdt());
            dto.setStudentAddress(hocSinh.getDiaChi());
            
            if (lopHoc != null) {
                dto.setIdLh(lopHoc.getIdLh());
                dto.setTenLop(lopHoc.getTenLop());
                if (lopHoc.getChuongTrinh() != null) {
                    dto.setChuongTrinh(lopHoc.getChuongTrinh().getTenCt() != null ? 
                        lopHoc.getChuongTrinh().getTenCt() : "");
                }
            }
            
            dto.setTongTien(invoice.getTongTien());
            dto.setNgayDangKy(invoice.getNgayDangKy());
            dto.setNgayThanhToan(invoice.getNgayThanhToan());
            dto.setHanThanhToan(invoice.getHanThanhToan());
            dto.setSoThang(invoice.getSoThang());
            dto.setTrangThai(invoice.getTrangThai());
            
            if (lichSu != null) {
                dto.setIdLs(lichSu.getIdLs());
                dto.setPaymentMethodName(lichSu.getPhuongThucThanhToan().getTenPt());
                dto.setPaymentMethodType(lichSu.getHinhThuc());
                dto.setGhiChu(lichSu.getGhiChu());
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Generate unique ID_LS with retry logic to handle race conditions
     */
    private String generateUniqueIdLs() {
        int maxLsNumber = lichSuThanhToanRepository.findMaxLsNumber();
        String newIdLs = String.format("LS%05d", maxLsNumber + 1);
        
        // Check if ID already exists (race condition protection)
        int maxRetries = 10;
        int retryCount = 0;
        while (retryCount < maxRetries && lichSuThanhToanRepository.existsById(newIdLs)) {
            retryCount++;
            maxLsNumber = lichSuThanhToanRepository.findMaxLsNumber();
            newIdLs = String.format("LS%05d", maxLsNumber + 1);
        }
        
        if (retryCount >= maxRetries) {
            // Fallback: use timestamp-based ID to ensure uniqueness
            long timestamp = System.currentTimeMillis();
            int random = (int) (timestamp % 100000);
            newIdLs = String.format("LS%05d", random);
        }
        
        return newIdLs;
    }
}

