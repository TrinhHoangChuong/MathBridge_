package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.HoaDonSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.HoaDonUpsertRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.LichSuSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.LichSuUpsertRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.PhuongThucUpsertRequest;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.DropdownHocSinhDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.DropdownLopHocDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.HoaDonDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.LichSuThanhToanDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.PhuongThucThanhToanDto;
import com.mathbridge.repository.Admin.LichSuThanhToanAdminRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaiChinhServiceImpl implements TaiChinhService {

    @PersistenceContext
    private final EntityManager entityManager;

    private final LichSuThanhToanAdminRepository lichSuThanhToanAdminRepository;

    // ========================================================================
    // Helpers
    // ========================================================================

    private LocalDate parseLocalDate(String dateStr) {
        if (!StringUtils.hasText(dateStr)) {
            return null;
        }
        return LocalDate.parse(dateStr);
    }

    private Date toSqlDate(LocalDate localDate) {
        return localDate != null ? Date.valueOf(localDate) : null;
    }

    // ========================================================================
    // HÓA ĐƠN
    // ========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<HoaDonDto> searchHoaDon(HoaDonSearchRequest request) {
        String sql =
                "SELECT hd.ID_HoaDon, hd.ID_HS, hs.Ho, hs.TenDem, hs.Ten, " +
                        "       hd.ID_LH, lh.TenLop, " +
                        "       hd.SoThang, hd.TongTien, " +
                        "       hd.NgayDangKy, hd.HanThanhToan, hd.NgayThanhToan, " +
                        "       hd.TrangThai " +
                        "FROM HoaDon hd " +
                        "JOIN HocSinh hs ON hs.ID_HS = hd.ID_HS " +
                        "JOIN LopHoc lh ON lh.ID_LH = hd.ID_LH " +
                        "WHERE (:studentId IS NULL OR hd.ID_HS = :studentId) " +
                        "  AND (:classId   IS NULL OR hd.ID_LH = :classId) " +
                        "  AND (:status    IS NULL OR hd.TrangThai = :status) " +
                        "  AND (:fromDate  IS NULL OR hd.NgayDangKy >= :fromDate) " +
                        "  AND (:toDate    IS NULL OR hd.NgayDangKy <= :toDate) " +
                        "ORDER BY hd.NgayDangKy DESC, hd.ID_HoaDon DESC";

        LocalDate from = parseLocalDate(request.getFromDate());
        LocalDate to = parseLocalDate(request.getToDate());

        String studentId = StringUtils.hasText(request.getStudentId()) ? request.getStudentId() : null;
        String classId = StringUtils.hasText(request.getClassId()) ? request.getClassId() : null;
        String status = StringUtils.hasText(request.getStatus()) ? request.getStatus() : null;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("studentId", studentId);
        query.setParameter("classId", classId);
        query.setParameter("status", status);
        query.setParameter("fromDate", from != null ? toSqlDate(from) : null);
        query.setParameter("toDate", to != null ? toSqlDate(to) : null);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<HoaDonDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            String idHoaDon = (String) row[0];
            String idHs = (String) row[1];
            String ho = (String) row[2];
            String tenDem = (String) row[3];
            String ten = (String) row[4];
            String idLh = (String) row[5];
            String tenLop = (String) row[6];
            String soThang = row[7] != null ? row[7].toString() : null;
            BigDecimal tongTien = row[8] != null ? (BigDecimal) row[8] : null;
            LocalDate ngayDangKy = row[9] != null ? ((Date) row[9]).toLocalDate() : null;
            LocalDate hanThanhToan = row[10] != null ? ((Date) row[10]).toLocalDate() : null;
            LocalDate ngayThanhToan = row[11] != null ? ((Date) row[11]).toLocalDate() : null;
            String trangThai = (String) row[12];

            StringBuilder fullName = new StringBuilder();
            if (ho != null) fullName.append(ho).append(" ");
            if (tenDem != null) fullName.append(tenDem).append(" ");
            if (ten != null) fullName.append(ten);
            String tenHocSinh = fullName.toString().trim();

            result.add(HoaDonDto.builder()
                    .idHoaDon(idHoaDon)
                    .idHs(idHs)
                    .tenHocSinh(tenHocSinh)
                    .idLh(idLh)
                    .tenLop(tenLop)
                    .soThang(soThang)
                    .tongTien(tongTien)
                    .ngayDangKy(ngayDangKy)
                    .hanThanhToan(hanThanhToan)
                    .ngayThanhToan(ngayThanhToan)
                    .trangThai(trangThai)
                    .build());
        }

        return result;
    }

    @Override
    public HoaDonDto createHoaDon(HoaDonUpsertRequest request) {
        if (!StringUtils.hasText(request.getIdHoaDon())) {
            throw new IllegalArgumentException("ID_HoaDon (idHoaDon) là bắt buộc khi tạo hóa đơn.");
        }
        if (!StringUtils.hasText(request.getIdHs()) || !StringUtils.hasText(request.getIdLh())) {
            throw new IllegalArgumentException("ID_HS và ID_LH là bắt buộc.");
        }

        LocalDate ngayDangKy = parseLocalDate(request.getNgayDangKy());
        LocalDate hanThanhToan = parseLocalDate(request.getHanThanhToan());
        LocalDate ngayThanhToan = parseLocalDate(request.getNgayThanhToan());

        String sql =
                "INSERT INTO HoaDon " +
                        "(ID_HoaDon, ID_LH, ID_LS, ID_HS, NgayDangKy, NgayThanhToan, HanThanhToan, SoThang, TongTien, TrangThai) " +
                        "VALUES (:idHoaDon, :idLh, NULL, :idHs, :ngayDangKy, :ngayThanhToan, :hanThanhToan, :soThang, :tongTien, :trangThai)";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idHoaDon", request.getIdHoaDon());
        query.setParameter("idLh", request.getIdLh());
        query.setParameter("idHs", request.getIdHs());
        query.setParameter("ngayDangKy", toSqlDate(ngayDangKy));
        query.setParameter("ngayThanhToan", toSqlDate(ngayThanhToan));
        query.setParameter("hanThanhToan", toSqlDate(hanThanhToan));
        query.setParameter("soThang", request.getSoThang());
        query.setParameter("tongTien", request.getTongTien());
        query.setParameter("trangThai", request.getTrangThai());

        query.executeUpdate();

        return getHoaDonById(request.getIdHoaDon());
    }

    @Override
    public HoaDonDto updateHoaDon(String idHoaDon, HoaDonUpsertRequest request) {
        LocalDate ngayDangKy = parseLocalDate(request.getNgayDangKy());
        LocalDate hanThanhToan = parseLocalDate(request.getHanThanhToan());
        LocalDate ngayThanhToan = parseLocalDate(request.getNgayThanhToan());

        String sql =
                "UPDATE HoaDon " +
                        "SET ID_HS = :idHs, " +
                        "    ID_LH = :idLh, " +
                        "    NgayDangKy = :ngayDangKy, " +
                        "    HanThanhToan = :hanThanhToan, " +
                        "    NgayThanhToan = :ngayThanhToan, " +
                        "    SoThang = :soThang, " +
                        "    TongTien = :tongTien, " +
                        "    TrangThai = :trangThai " +
                        "WHERE ID_HoaDon = :idHoaDon";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idHs", request.getIdHs());
        query.setParameter("idLh", request.getIdLh());
        query.setParameter("ngayDangKy", toSqlDate(ngayDangKy));
        query.setParameter("hanThanhToan", toSqlDate(hanThanhToan));
        query.setParameter("ngayThanhToan", toSqlDate(ngayThanhToan));
        query.setParameter("soThang", request.getSoThang());
        query.setParameter("tongTien", request.getTongTien());
        query.setParameter("trangThai", request.getTrangThai());
        query.setParameter("idHoaDon", idHoaDon);

        int updated = query.executeUpdate();
        if (updated == 0) {
            throw new IllegalArgumentException("Không tìm thấy hóa đơn với ID_HoaDon = " + idHoaDon);
        }

        return getHoaDonById(idHoaDon);
    }

    @Override
    public void deleteHoaDon(String idHoaDon) {
        String sql = "DELETE FROM HoaDon WHERE ID_HoaDon = :idHoaDon";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idHoaDon", idHoaDon);
        int deleted = query.executeUpdate();
        if (deleted == 0) {
            throw new IllegalArgumentException("Không tìm thấy hóa đơn để xóa với ID_HoaDon = " + idHoaDon);
        }
    }

    private HoaDonDto getHoaDonById(String idHoaDon) {
        String sql =
                "SELECT hd.ID_HoaDon, hd.ID_HS, hs.Ho, hs.TenDem, hs.Ten, " +
                        "       hd.ID_LH, lh.TenLop, " +
                        "       hd.SoThang, hd.TongTien, " +
                        "       hd.NgayDangKy, hd.HanThanhToan, hd.NgayThanhToan, " +
                        "       hd.TrangThai " +
                        "FROM HoaDon hd " +
                        "JOIN HocSinh hs ON hs.ID_HS = hd.ID_HS " +
                        "JOIN LopHoc lh ON lh.ID_LH = hd.ID_LH " +
                        "WHERE hd.ID_HoaDon = :idHoaDon";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idHoaDon", idHoaDon);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        if (rows.isEmpty()) {
            return null;
        }
        Object[] row = rows.get(0);

        String idHs = (String) row[1];
        String ho = (String) row[2];
        String tenDem = (String) row[3];
        String ten = (String) row[4];
        String idLh = (String) row[5];
        String tenLop = (String) row[6];
        String soThang = row[7] != null ? row[7].toString() : null;
        BigDecimal tongTien = row[8] != null ? (BigDecimal) row[8] : null;
        LocalDate ngayDangKy = row[9] != null ? ((Date) row[9]).toLocalDate() : null;
        LocalDate hanThanhToan = row[10] != null ? ((Date) row[10]).toLocalDate() : null;
        LocalDate ngayThanhToan = row[11] != null ? ((Date) row[11]).toLocalDate() : null;
        String trangThai = (String) row[12];

        StringBuilder fullName = new StringBuilder();
        if (ho != null) fullName.append(ho).append(" ");
        if (tenDem != null) fullName.append(tenDem).append(" ");
        if (ten != null) fullName.append(ten);
        String tenHocSinh = fullName.toString().trim();

        return HoaDonDto.builder()
                .idHoaDon(idHoaDon)
                .idHs(idHs)
                .tenHocSinh(tenHocSinh)
                .idLh(idLh)
                .tenLop(tenLop)
                .soThang(soThang)
                .tongTien(tongTien)
                .ngayDangKy(ngayDangKy)
                .hanThanhToan(hanThanhToan)
                .ngayThanhToan(ngayThanhToan)
                .trangThai(trangThai)
                .build();
    }

    // ========================================================================
    // LỊCH SỬ THANH TOÁN
    // ========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<LichSuThanhToanDto> searchLichSu(LichSuSearchRequest request) {
        String status = StringUtils.hasText(request.getStatus()) ? request.getStatus() : null;
        String methodId = StringUtils.hasText(request.getMethodId()) ? request.getMethodId() : null;
        String month = StringUtils.hasText(request.getMonth()) ? request.getMonth() : null;

        List<Object[]> rows = lichSuThanhToanAdminRepository.search(status, methodId, month);
        List<LichSuThanhToanDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            String idLs = (String) row[0];
            String idPt = (String) row[1];
            BigDecimal tongTien = row[2] != null ? (BigDecimal) row[2] : null;
            String trangThaiThanhToan = (String) row[3];
            String hinhThuc = (String) row[4];
            String thang = (String) row[5];
            String ghiChu = (String) row[6];
            String tenPt = (String) row[7];

            result.add(LichSuThanhToanDto.builder()
                    .idLs(idLs)
                    .idPt(idPt)
                    .tenPt(tenPt)
                    .tongTien(tongTien)
                    .trangThaiThanhToan(trangThaiThanhToan)
                    .hinhThuc(hinhThuc)
                    .thang(thang)
                    .ghiChu(ghiChu)
                    .build());
        }

        return result;
    }

    @Override
    public LichSuThanhToanDto createLichSu(LichSuUpsertRequest request) {
        if (!StringUtils.hasText(request.getIdLs())) {
            throw new IllegalArgumentException("ID_LS (idLs) là bắt buộc khi tạo lịch sử thanh toán.");
        }
        if (!StringUtils.hasText(request.getIdPt())) {
            throw new IllegalArgumentException("ID_PT (idPt) là bắt buộc.");
        }

        lichSuThanhToanAdminRepository.insert(
                request.getIdLs(),
                request.getIdPt(),
                request.getTongTien(),
                request.getTrangThaiThanhToan(),
                request.getHinhThuc(),
                request.getThang(),
                request.getGhiChu()
        );

        Object[] row = lichSuThanhToanAdminRepository.findOneWithTenPt(request.getIdLs());
        if (row == null) {
            return null;
        }

        return mapLichSuRowToDto(row);
    }

    @Override
    public LichSuThanhToanDto updateLichSu(String idLs, LichSuUpsertRequest request) {
        int updated = lichSuThanhToanAdminRepository.update(
                idLs,
                request.getIdPt(),
                request.getTongTien(),
                request.getTrangThaiThanhToan(),
                request.getHinhThuc(),
                request.getThang(),
                request.getGhiChu()
        );
        if (updated == 0) {
            throw new IllegalArgumentException("Không tìm thấy lịch sử thanh toán với ID_LS = " + idLs);
        }

        Object[] row = lichSuThanhToanAdminRepository.findOneWithTenPt(idLs);
        if (row == null) {
            return null;
        }

        return mapLichSuRowToDto(row);
    }

    @Override
    public void deleteLichSu(String idLs) {
        int deleted = lichSuThanhToanAdminRepository.delete(idLs);
        if (deleted == 0) {
            throw new IllegalArgumentException("Không tìm thấy lịch sử thanh toán để xóa với ID_LS = " + idLs);
        }
    }

    private LichSuThanhToanDto mapLichSuRowToDto(Object[] row) {
        String idLs = (String) row[0];
        String idPt = (String) row[1];
        BigDecimal tongTien = row[2] != null ? (BigDecimal) row[2] : null;
        String trangThaiThanhToan = (String) row[3];
        String hinhThuc = (String) row[4];
        String thang = (String) row[5];
        String ghiChu = (String) row[6];
        String tenPt = (String) row[7];

        return LichSuThanhToanDto.builder()
                .idLs(idLs)
                .idPt(idPt)
                .tenPt(tenPt)
                .tongTien(tongTien)
                .trangThaiThanhToan(trangThaiThanhToan)
                .hinhThuc(hinhThuc)
                .thang(thang)
                .ghiChu(ghiChu)
                .build();
    }

    // ========================================================================
    // PHƯƠNG THỨC THANH TOÁN
    // ========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<PhuongThucThanhToanDto> getAllPhuongThuc() {
        String sql =
                "SELECT ID_PT, TenPT, HinhThucTT, GhiChu " +
                        "FROM PhuongThucThanhToan " +
                        "ORDER BY ID_PT ASC";

        Query query = entityManager.createNativeQuery(sql);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<PhuongThucThanhToanDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            String idPt = (String) row[0];
            String tenPt = (String) row[1];
            String hinhThucTt = (String) row[2];
            String ghiChu = (String) row[3];

            result.add(PhuongThucThanhToanDto.builder()
                    .idPt(idPt)
                    .tenPt(tenPt)
                    .hinhThucTt(hinhThucTt)
                    .ghiChu(ghiChu)
                    .build());
        }

        return result;
    }

    @Override
    public PhuongThucThanhToanDto createPhuongThuc(PhuongThucUpsertRequest request) {
        if (!StringUtils.hasText(request.getIdPt())) {
            throw new IllegalArgumentException("ID_PT (idPt) là bắt buộc khi tạo phương thức thanh toán.");
        }

        String sql =
                "INSERT INTO PhuongThucThanhToan (ID_PT, TenPT, HinhThucTT, GhiChu) " +
                        "VALUES (:idPt, :tenPt, :hinhThucTt, :ghiChu)";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idPt", request.getIdPt());
        query.setParameter("tenPt", request.getTenPt());
        query.setParameter("hinhThucTt", request.getHinhThucTt());
        query.setParameter("ghiChu", request.getGhiChu());

        query.executeUpdate();

        return getPhuongThucById(request.getIdPt());
    }

    @Override
    public PhuongThucThanhToanDto updatePhuongThuc(String idPt, PhuongThucUpsertRequest request) {
        String sql =
                "UPDATE PhuongThucThanhToan " +
                        "SET TenPT = :tenPt, HinhThucTT = :hinhThucTt, GhiChu = :ghiChu " +
                        "WHERE ID_PT = :idPt";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("tenPt", request.getTenPt());
        query.setParameter("hinhThucTt", request.getHinhThucTt());
        query.setParameter("ghiChu", request.getGhiChu());
        query.setParameter("idPt", idPt);

        int updated = query.executeUpdate();
        if (updated == 0) {
            throw new IllegalArgumentException("Không tìm thấy phương thức thanh toán với ID_PT = " + idPt);
        }

        return getPhuongThucById(idPt);
    }

    @Override
    public void deletePhuongThuc(String idPt) {
        String sql = "DELETE FROM PhuongThucThanhToan WHERE ID_PT = :idPt";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idPt", idPt);
        int deleted = query.executeUpdate();
        if (deleted == 0) {
            throw new IllegalArgumentException("Không tìm thấy phương thức thanh toán để xóa với ID_PT = " + idPt);
        }
    }

    private PhuongThucThanhToanDto getPhuongThucById(String idPt) {
        String sql =
                "SELECT ID_PT, TenPT, HinhThucTT, GhiChu " +
                        "FROM PhuongThucThanhToan " +
                        "WHERE ID_PT = :idPt";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idPt", idPt);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        if (rows.isEmpty()) {
            return null;
        }
        Object[] row = rows.get(0);
        String tenPt = (String) row[1];
        String hinhThucTt = (String) row[2];
        String ghiChu = (String) row[3];

        return PhuongThucThanhToanDto.builder()
                .idPt(idPt)
                .tenPt(tenPt)
                .hinhThucTt(hinhThucTt)
                .ghiChu(ghiChu)
                .build();
    }

    // ========================================================================
    // DROPDOWN LỚP HỌC & HỌC SINH
    // ========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<DropdownLopHocDto> getDropdownLopHoc() {
        String sql =
                "SELECT ID_LH, TenLop " +
                        "FROM LopHoc " +
                        "ORDER BY TenLop ASC";

        Query query = entityManager.createNativeQuery(sql);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<DropdownLopHocDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            String idLh = (String) row[0];
            String tenLop = (String) row[1];

            result.add(DropdownLopHocDto.builder()
                    .idLh(idLh)
                    .tenLop(tenLop)
                    .build());
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DropdownHocSinhDto> getDropdownHocSinh() {
        String sql =
                "SELECT ID_HS, Ho, TenDem, Ten " +
                        "FROM HocSinh " +
                        "ORDER BY Ho, TenDem, Ten";

        Query query = entityManager.createNativeQuery(sql);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<DropdownHocSinhDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            String idHs = (String) row[0];
            String ho = (String) row[1];
            String tenDem = (String) row[2];
            String ten = (String) row[3];

            StringBuilder fullName = new StringBuilder();
            if (ho != null) fullName.append(ho).append(" ");
            if (tenDem != null) fullName.append(tenDem).append(" ");
            if (ten != null) fullName.append(ten);

            result.add(DropdownHocSinhDto.builder()
                    .idHs(idHs)
                    .hoTen(fullName.toString().trim())
                    .build());
        }

        return result;
    }
}
