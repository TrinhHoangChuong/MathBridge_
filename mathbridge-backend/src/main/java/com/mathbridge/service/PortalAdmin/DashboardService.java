package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Response.DashboardResponse;
import com.mathbridge.dto.PortalAdmin.Response.DashboardResponse.ClassPerProgramDto;
import com.mathbridge.dto.PortalAdmin.Response.DashboardResponse.ContractPerTeacherDto;
import com.mathbridge.dto.PortalAdmin.Response.DashboardResponse.InvoiceUnpaidSoonDto;
import com.mathbridge.dto.PortalAdmin.Response.DashboardResponse.RecruitmentSummaryDto;
import com.mathbridge.dto.PortalAdmin.Response.DashboardResponse.TopClassByStudentDto;
import com.mathbridge.repository.*;
import com.mathbridge.repository.Admin.*;
import com.mathbridge.repository.Admin.BuoiHocChiTietAdminRepository;
import com.mathbridge.repository.Admin.HoaDonAdminRepository;
import com.mathbridge.repository.Admin.PhongAdmimRepository;
import com.mathbridge.repository.DangKyLHRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {

    private final HocSinhRepository hocSinhRepository;
    private final NhanVienRepository nhanVienRepository;
    private final LopHocRepository lopHocRepository;
    private final DangKyLHRepository dangKyLHRepository;
    private final BuoiHocChiTietAdminRepository buoiHocChiTietAdminRepository;
    private final PhongAdmimRepository phongAdmimRepository;
    private final HoaDonAdminRepository hoaDonAdminRepository;
    private final YeuCauHoTroAdminRepository yeuCauHoTroAdminRepository;
    private final HopDongAdminRepository hopDongAdminRepository;

    @PersistenceContext
    private EntityManager em;

    public DashboardService(HocSinhRepository hocSinhRepository,
                            NhanVienRepository nhanVienRepository,
                            LopHocRepository lopHocRepository,
                            DangKyLHRepository dangKyLHRepository,
                            BuoiHocChiTietAdminRepository buoiHocChiTietAdminRepository,
                            PhongAdmimRepository phongAdmimRepository,
                            HoaDonAdminRepository hoaDonAdminRepository,
                            YeuCauHoTroAdminRepository yeuCauHoTroAdminRepository,
                            HopDongAdminRepository hopDongAdminRepository) {
        this.hocSinhRepository = hocSinhRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.lopHocRepository = lopHocRepository;
        this.dangKyLHRepository = dangKyLHRepository;
        this.buoiHocChiTietAdminRepository = buoiHocChiTietAdminRepository;
        this.phongAdmimRepository = phongAdmimRepository;
        this.hoaDonAdminRepository = hoaDonAdminRepository;
        this.yeuCauHoTroAdminRepository = yeuCauHoTroAdminRepository;
        this.hopDongAdminRepository = hopDongAdminRepository;
    }

    public DashboardResponse getDashboardOverview() {
        DashboardResponse res = new DashboardResponse();

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        // ================== KPI 1-4 ==================

        // (1) Lớp đang mở: LopHoc.TrangThai = N'Đang mở'
        // SQL gốc: SELECT COUNT(*) FROM LopHoc WHERE TrangThai = N'Đang mở'
        Long lopDangMo = singleLong(
                "SELECT COUNT(*) FROM LopHoc WHERE TrangThai = N'Đang mở'"
        );
        res.setLopDangMo(nullSafe(lopDangMo));

        // (2) Học sinh active: HocSinh.TrangThaiHoatDong = 1
        long hocSinhActive = hocSinhRepository.countByTrangThaiHoatDong(true);
        res.setHocSinhActive(hocSinhActive);

        // (3) Nhân viên active: NhanVien.TrangThaiHoatDong = 1
        long nhanVienActive = nhanVienRepository.countByTrangThaiHoatDong(true);
        res.setNhanVienActive(nhanVienActive);

        // (4) Tổng doanh thu đã thu:
        // FROM HoaDon WHERE TrangThai = N'Da Thanh Toan'
        // SQL: SELECT COALESCE(SUM(TongTien),0) FROM HoaDon WHERE TrangThai = N'Da Thanh Toan'
        BigDecimal tongDoanhThuDaThu = singleBigDecimal(
                "SELECT COALESCE(SUM(TongTien),0) FROM HoaDon WHERE TrangThai = N'Da Thanh Toan'"
        );
        res.setTongDoanhThuDaThu(tongDoanhThuDaThu);

        // ================== KPI 5: HÓA ĐƠN THEO TRẠNG THÁI ==================
        // Da Thanh Toan
        Long hdPaid = singleLong(
                "SELECT COUNT(*) FROM HoaDon WHERE TrangThai = N'Da Thanh Toan'"
        );
        res.setHoaDonDaThanhToan(nullSafe(hdPaid));

        // Chua Thanh Toan
        Long hdUnpaid = singleLong(
                "SELECT COUNT(*) FROM HoaDon WHERE TrangThai = N'Chua Thanh Toan'"
        );
        res.setHoaDonChuaThanhToan(nullSafe(hdUnpaid));

        // ================== KPI 6: HÓA ĐƠN CHƯA THANH TOÁN SẮP ĐẾN HẠN ==================
        // FROM HoaDon:
        // WHERE TrangThai = 'Chua Thanh Toan'
        //   AND HanThanhToan BETWEEN today AND today + 7
        List<Object[]> unpaidSoonRows = em.createNativeQuery(
                        "SELECT ID_HoaDon, ID_HS, ID_LH, NgayDangKy, HanThanhToan, TongTien " +
                                "FROM HoaDon " +
                                "WHERE TrangThai = N'Chua Thanh Toan' " +
                                "  AND HanThanhToan IS NOT NULL " +
                                "  AND HanThanhToan BETWEEN :today AND :limitDate " +
                                "ORDER BY HanThanhToan ASC"
                )
                .setParameter("today", Date.valueOf(today))
                .setParameter("limitDate", Date.valueOf(today.plusDays(7)))
                .getResultList();

        List<InvoiceUnpaidSoonDto> unpaidSoonList = new ArrayList<>();
        for (Object[] r : unpaidSoonRows) {
            InvoiceUnpaidSoonDto dto = new InvoiceUnpaidSoonDto();
            dto.setIdHoaDon((String) r[0]);
            dto.setIdHocSinh((String) r[1]);
            dto.setIdLopHoc((String) r[2]);
            dto.setNgayDangKy(toLocalDate(r[3]));
            dto.setHanThanhToan(toLocalDate(r[4]));
            dto.setSoTien(toBigDecimal(r[5]));
            unpaidSoonList.add(dto);
        }
        res.setHoaDonChuaThanhToanSapDenHan(unpaidSoonList);

        // ================== KPI 7: DOANH THU THEO PHƯƠNG THỨC (LichSuThanhToan) ==================
        // SQL:
        // SELECT ID_PT, COALESCE(SUM(TongTien),0)
        // FROM LichSuThanhToan
        // GROUP BY ID_PT
        Map<String, BigDecimal> revenueByPT = new HashMap<>();
        List<Object[]> ptRows = em.createNativeQuery(
                "SELECT ID_PT, COALESCE(SUM(TongTien),0) " +
                        "FROM LichSuThanhToan " +
                        "GROUP BY ID_PT"
        ).getResultList();
        for (Object[] r : ptRows) {
            String idPt = (String) r[0];
            BigDecimal amount = toBigDecimal(r[1]);
            revenueByPT.put(idPt, amount);
        }
        res.setDoanhThuPT001(revenueByPT.getOrDefault("PT001", BigDecimal.ZERO));
        res.setDoanhThuPT002(revenueByPT.getOrDefault("PT002", BigDecimal.ZERO));
        res.setDoanhThuPT003(revenueByPT.getOrDefault("PT003", BigDecimal.ZERO));
        res.setDoanhThuPT004(revenueByPT.getOrDefault("PT004", BigDecimal.ZERO));
        res.setDoanhThuPT005(revenueByPT.getOrDefault("PT005", BigDecimal.ZERO));

        // ================== KPI 8: TOP LỚP THEO SĨ SỐ ==================
        // FROM DangKyLH + LopHoc
        // SELECT TOP 5 d.ID_LH, l.TenLop, COUNT(DISTINCT d.ID_HS) AS SoHS
        // GROUP BY d.ID_LH, l.TenLop
        // ORDER BY SoHS DESC
        List<Object[]> topClassRows = em.createNativeQuery(
                "SELECT TOP 5 d.ID_LH, l.TenLop, COUNT(DISTINCT d.ID_HS) AS SoHS " +
                        "FROM DangKyLH d " +
                        "JOIN LopHoc l ON l.ID_LH = d.ID_LH " +
                        "GROUP BY d.ID_LH, l.TenLop " +
                        "ORDER BY SoHS DESC"
        ).getResultList();

        List<TopClassByStudentDto> topLop = new ArrayList<>();
        for (Object[] r : topClassRows) {
            TopClassByStudentDto dto = new TopClassByStudentDto();
            dto.setIdLopHoc((String) r[0]);
            dto.setTenLop((String) r[1]);
            dto.setSoHocSinh(nullSafe((Number) r[2]));
            topLop.add(dto);
        }
        res.setTopLopTheoSiSo(topLop);

        // ================== KPI 9: LỚP THEO CHƯƠNG TRÌNH ==================
        // FROM ChuongTrinh + LopHoc
        // SELECT c.ID_CT, c.TenCT, COUNT(l.ID_LH) AS SoLop
        // FROM ChuongTrinh c
        // LEFT JOIN LopHoc l ON l.ID_CT = c.ID_CT
        // GROUP BY c.ID_CT, c.TenCT
        List<Object[]> classPerProgramRows = em.createNativeQuery(
                "SELECT c.ID_CT, c.TenCT, COUNT(l.ID_LH) AS SoLop " +
                        "FROM ChuongTrinh c " +
                        "LEFT JOIN LopHoc l ON l.ID_CT = c.ID_CT " +
                        "GROUP BY c.ID_CT, c.TenCT " +
                        "ORDER BY c.ID_CT"
        ).getResultList();

        List<ClassPerProgramDto> classPerPrograms = new ArrayList<>();
        for (Object[] r : classPerProgramRows) {
            ClassPerProgramDto dto = new ClassPerProgramDto();
            dto.setIdChuongTrinh((String) r[0]);
            dto.setTenChuongTrinh((String) r[1]);
            dto.setSoLop(nullSafe((Number) r[2]));
            classPerPrograms.add(dto);
        }
        res.setLopTheoChuongTrinh(classPerPrograms);

        // ================== KPI 10: TUYỂN DỤNG & ỨNG VIÊN ==================
        // FROM TinTuyenDung + Association_25 (ID_TD, ID_UV)
        // SELECT t.ID_TD, t.TieuDe, t.TrangThai, COUNT(a.ID_UV) AS SoUV
        // FROM TinTuyenDung t
        // LEFT JOIN Association_25 a ON a.ID_TD = t.ID_TD
        // GROUP BY t.ID_TD, t.TieuDe, t.TrangThai
        List<Object[]> recruitmentRows = em.createNativeQuery(
                "SELECT t.ID_TD, t.TieuDe, t.TrangThai, COUNT(a.ID_UV) AS SoUV " +
                        "FROM TinTuyenDung t " +
                        "LEFT JOIN Association_25 a ON a.ID_TD = t.ID_TD " +
                        "GROUP BY t.ID_TD, t.TieuDe, t.TrangThai " +
                        "ORDER BY t.ID_TD"
        ).getResultList();

        List<RecruitmentSummaryDto> recruitmentSummaries = new ArrayList<>();
        for (Object[] r : recruitmentRows) {
            RecruitmentSummaryDto dto = new RecruitmentSummaryDto();
            dto.setIdTin((String) r[0]);
            dto.setTieuDe((String) r[1]);
            dto.setTrangThai((String) r[2]);
            dto.setSoUngVien(nullSafe((Number) r[3]));
            recruitmentSummaries.add(dto);
        }
        res.setTuyenDung(recruitmentSummaries);

        // ================== KPI 11: YÊU CẦU HỖ TRỢ ==================
        // - supportOpen      = ThoiDiemDong IS NULL
        // - supportClosed    = ThoiDiemDong IS NOT NULL
        // - supportProcessing: nếu sau này có enum/trạng thái riêng thì map thêm
        long openSupport = yeuCauHoTroAdminRepository.countByThoiDiemDongIsNull();
        long closedSupport = yeuCauHoTroAdminRepository.countByThoiDiemDongIsNotNull();

        res.setSupportOpen(openSupport);
        res.setSupportClosed(closedSupport);
        res.setSupportProcessing(0L); // chưa có rule rõ trong CSDL, để 0 (sau này map thêm nếu có cột/enum)

        // ================== KPI 12: HỢP ĐỒNG THEO TRẠNG THÁI ==================
        // FROM HopDong.TrangThai
        // 'Hieu luc' / 'Het han' đã được seed trong script
        long contractActive = hopDongAdminRepository.countByTrangThai("Hieu luc");
        long contractExpired = hopDongAdminRepository.countByTrangThai("Het han");

        res.setContractActive(contractActive);
        res.setContractExpired(contractExpired);

        // ================== KPI 13: HỢP ĐỒNG / NHÂN VIÊN ==================
        // SELECT ID_NV, COUNT(*) AS SoHD FROM HopDong GROUP BY ID_NV
        List<Object[]> contractPerNvRows = em.createNativeQuery(
                "SELECT ID_NV, COUNT(*) AS SoHD " +
                        "FROM HopDong " +
                        "GROUP BY ID_NV " +
                        "ORDER BY ID_NV"
        ).getResultList();

        List<ContractPerTeacherDto> contractPerTeachers = new ArrayList<>();
        for (Object[] r : contractPerNvRows) {
            ContractPerTeacherDto dto = new ContractPerTeacherDto();
            dto.setIdNhanVien((String) r[0]);
            dto.setSoHopDong(nullSafe((Number) r[1]));
            contractPerTeachers.add(dto);
        }
        res.setHopDongTheoNhanVien(contractPerTeachers);

        return res;
    }

    // ================== HELPER ==================

    private Long singleLong(String sql) {
        Object r = em.createNativeQuery(sql).getSingleResult();
        return (r == null) ? 0L : ((Number) r).longValue();
    }

    private BigDecimal singleBigDecimal(String sql) {
        Object r = em.createNativeQuery(sql).getSingleResult();
        return toBigDecimal(r);
    }

    private long nullSafe(Number n) {
        return (n == null) ? 0L : n.longValue();
    }

    private long nullSafe(Long n) {
        return (n == null) ? 0L : n;
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal) return (BigDecimal) o;
        if (o instanceof Number) return BigDecimal.valueOf(((Number) o).doubleValue());
        return new BigDecimal(o.toString());
    }

    private LocalDate toLocalDate(Object o) {
        if (o == null) return null;
        if (o instanceof java.sql.Date) return ((java.sql.Date) o).toLocalDate();
        if (o instanceof java.sql.Timestamp) return ((java.sql.Timestamp) o).toLocalDateTime().toLocalDate();
        if (o instanceof LocalDate) return (LocalDate) o;
        return LocalDate.parse(o.toString());
    }
}