package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.PhanCongRequest;
import com.mathbridge.dto.PortalAdmin.Response.PhanCongResponse;
import com.mathbridge.entity.CoVan_HocSinh;
import com.mathbridge.entity.CoVanHocSinhId;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.Admin.CoVanHocSinhAdminRepository;
import com.mathbridge.repository.Admin.HocSinhAdminRepository;
import com.mathbridge.repository.Admin.NhanVienAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PhanCongServiceImpl implements PhanCongService {

    private final NhanVienAdminRepository nhanVienAdminRepository;
    private final HocSinhAdminRepository hocSinhAdminRepository;
    private final CoVanHocSinhAdminRepository coVanHocSinhAdminRepository;

    // ====================== UTIL: PAGING ======================

    private int normalizePage(Integer page) {
        return page == null || page < 0 ? 0 : page;
    }

    private int normalizeSize(Integer size) {
        return size == null || size <= 0 ? 50 : size;
    }

    private <T> PhanCongResponse.PagedResult<T> toPagedResult(
            List<T> all,
            Integer page,
            Integer size
    ) {
        int p = normalizePage(page);
        int s = normalizeSize(size);
        int from = p * s;
        int to = Math.min(from + s, all.size());

        List<T> content = from >= all.size() ? List.of() : all.subList(from, to);
        int totalPages = (int) Math.ceil(all.size() / (double) s);

        return PhanCongResponse.PagedResult.<T>builder()
                .content(content)
                .totalElements(all.size())
                .totalPages(totalPages)
                .page(p)
                .size(s)
                .build();
    }

    // ====================== 1. SEARCH ADVISORS ======================

    @Override
    @Transactional(readOnly = true)
    public PhanCongResponse.PagedResult<PhanCongResponse.AdvisorSummary> searchAdvisors(
            PhanCongRequest.AdvisorSearchRequest request
    ) {
        String keyword = normalizeKeyword(request.getSearchKeyword());
        String chucVuFilter = normalizeKeyword(request.getChucVu());
        String ttFilter = normalizeKeyword(request.getTrangThaiHoatDong());

        List<NhanVien> all = nhanVienAdminRepository.findAll();

        List<PhanCongResponse.AdvisorSummary> mapped = all.stream()
                .filter(nv -> filterTrangThaiNhanVien(nv, ttFilter))
                .filter(nv -> filterChucVuNhanVien(nv, chucVuFilter))
                .filter(nv -> filterKeywordNhanVien(nv, keyword))
                .sorted(Comparator
                        .comparing(NhanVien::getChucVu, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(NhanVien::getHo, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(NhanVien::getTen, Comparator.nullsLast(String::compareToIgnoreCase))
                )
                .map(this::toAdvisorSummary)
                .collect(Collectors.toList());

        return toPagedResult(mapped, request.getPage(), request.getSize());
    }

    private String normalizeKeyword(String s) {
        return (s == null) ? null : s.trim().toLowerCase(Locale.ROOT);
    }

    private boolean filterTrangThaiNhanVien(NhanVien nv, String ttFilter) {
        if (!StringUtils.hasText(ttFilter)) return true;

        Boolean active = nv.getTrangThaiHoatDong(); // map cột TrangThaiHoatDong (bit)

        if ("active".equals(ttFilter)) {
            return Boolean.TRUE.equals(active);
        } else if ("inactive".equals(ttFilter)) {
            return Boolean.FALSE.equals(active);
        }
        return true;
    }

    private boolean filterChucVuNhanVien(NhanVien nv, String chucVuFilter) {
        if (!StringUtils.hasText(chucVuFilter)) return true;
        String chucVu = nv.getChucVu();
        return chucVu != null && chucVu.toLowerCase(Locale.ROOT).equals(chucVuFilter);
    }

    private boolean filterKeywordNhanVien(NhanVien nv, String keyword) {
        if (!StringUtils.hasText(keyword)) return true;

        String full = (nv.getHo() + " " +
                (nv.getTenDem() == null ? "" : nv.getTenDem()) + " " +
                nv.getTen()).toLowerCase(Locale.ROOT);
        String email = nv.getEmail() != null ? nv.getEmail().toLowerCase(Locale.ROOT) : "";
        String sdt = nv.getSdt() != null ? nv.getSdt().toLowerCase(Locale.ROOT) : "";

        return full.contains(keyword) || email.contains(keyword) || sdt.contains(keyword);
    }

    private PhanCongResponse.AdvisorSummary toAdvisorSummary(NhanVien nv) {
        return PhanCongResponse.AdvisorSummary.builder()
                .idNv(nv.getIdNv())
                .ho(nv.getHo())
                .tenDem(nv.getTenDem())
                .ten(nv.getTen())
                .email(nv.getEmail())
                .sdt(nv.getSdt())
                .chuyenMon(nv.getChuyenMon())
                .kinhNghiem(nv.getKinhNghiem())
                .chucVu(nv.getChucVu())
                .idCs(nv.getIdCs())
                .trangThaiHoatDong(nv.getTrangThaiHoatDong())
                .build();
    }

    // ====================== 2. SEARCH STUDENTS ======================

    @Override
    @Transactional(readOnly = true)
    public PhanCongResponse.PagedResult<PhanCongResponse.StudentSummary> searchStudentsForAdvisor(
            String idNv,
            PhanCongRequest.StudentSearchRequest request
    ) {
        String keyword = normalizeKeyword(request.getSearchKeyword());
        String ttFilter = normalizeKeyword(request.getTrangThaiHoatDong());
        boolean onlyWithoutAdvisor = Boolean.TRUE.equals(request.getOnlyWithoutAdvisor());

        List<HocSinh> allStudents = hocSinhAdminRepository.findAll();

        Set<String> studentIdsWithActiveAdvisor = Set.of();
        if (onlyWithoutAdvisor) {
            List<CoVan_HocSinh> allAssignments = coVanHocSinhAdminRepository.findAll();
            studentIdsWithActiveAdvisor = allAssignments.stream()
                    .filter(this::isAssignmentActive)   // dùng logic active theo thời gian
                    .map(cv -> cv.getId().getIdHs())
                    .collect(Collectors.toSet());
        }


        Set<String> finalStudentIdsWithActiveAdvisor = studentIdsWithActiveAdvisor;

        List<PhanCongResponse.StudentSummary> mapped = allStudents.stream()
                .filter(hs -> filterTrangThaiHocSinh(hs, ttFilter))
                .filter(hs -> filterKeywordHocSinh(hs, keyword))
                .filter(hs -> !onlyWithoutAdvisor || !finalStudentIdsWithActiveAdvisor.contains(hs.getIdHs()))
                .sorted(Comparator
                        .comparing(HocSinh::getHo, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(HocSinh::getTen, Comparator.nullsLast(String::compareToIgnoreCase))
                )
                .map(this::toStudentSummary)
                .collect(Collectors.toList());

        return toPagedResult(mapped, request.getPage(), request.getSize());
    }

    private boolean filterTrangThaiHocSinh(HocSinh hs, String ttFilter) {
        if (!StringUtils.hasText(ttFilter)) return true;
        Boolean active = hs.getTrangThaiHoatDong(); // map cột TrangThaiHoatDong

        if ("active".equals(ttFilter)) {
            return Boolean.TRUE.equals(active);
        } else if ("inactive".equals(ttFilter)) {
            return Boolean.FALSE.equals(active);
        }
        return true;
    }

    private boolean filterKeywordHocSinh(HocSinh hs, String keyword) {
        if (!StringUtils.hasText(keyword)) return true;

        String full = (hs.getHo() + " " +
                (hs.getTenDem() == null ? "" : hs.getTenDem()) + " " +
                hs.getTen()).toLowerCase(Locale.ROOT);
        String email = hs.getEmail() != null ? hs.getEmail().toLowerCase(Locale.ROOT) : "";
        String sdt = hs.getSdt() != null ? hs.getSdt().toLowerCase(Locale.ROOT) : "";

        return full.contains(keyword) || email.contains(keyword) || sdt.contains(keyword);
    }

    private PhanCongResponse.StudentSummary toStudentSummary(HocSinh hs) {
        return PhanCongResponse.StudentSummary.builder()
                .idHs(hs.getIdHs())
                .ho(hs.getHo())
                .tenDem(hs.getTenDem())
                .ten(hs.getTen())
                .email(hs.getEmail())
                .sdt(hs.getSdt())
                .gioiTinh(hs.getGioiTinh())
                .ngaySinh(hs.getNgaySinh())
                .diaChi(hs.getDiaChi())
                .trangThaiHoatDong(hs.getTrangThaiHoatDong())
                .build();
    }

    // ====================== 3. SEARCH ASSIGNMENTS ======================

    @Override
    @Transactional(readOnly = true)
    public PhanCongResponse.PagedResult<PhanCongResponse.AssignmentSummary> searchAssignmentsForAdvisor(
            String idNv,
            PhanCongRequest.AssignmentSearchRequest request
    ) {
        String statusFilter = normalizeKeyword(request.getStatus());

        List<CoVan_HocSinh> allForAdvisor = coVanHocSinhAdminRepository.findAll()
                .stream()
                .filter(cv -> cv.getId().getIdNv().equals(idNv))
                .collect(Collectors.toList());

        List<PhanCongResponse.AssignmentSummary> mapped = allForAdvisor.stream()
                .filter(cv -> filterAssignmentStatus(cv, statusFilter))
                .sorted(Comparator
                        .comparing((CoVan_HocSinh cv) -> cv.getId().getNgayBatDau())
                        .reversed())
                .map(this::toAssignmentSummary)
                .collect(Collectors.toList());

        return toPagedResult(mapped, request.getPage(), request.getSize());
    }

    private boolean filterAssignmentStatus(CoVan_HocSinh cv, String statusFilter) {
        if (!StringUtils.hasText(statusFilter)) return true;

        boolean active = isAssignmentActive(cv);
        LocalDateTime end = cv.getNgayKetThuc();

        if ("active".equals(statusFilter)) {
            // “Đang hiệu lực”
            return active;
        } else if ("ended".equals(statusFilter)) {
            // “Đã kết thúc”: đã có NgayKetThuc và NgayKetThuc < now
            return end != null && !active;
        }
        return true; // các giá trị khác => không lọc
    }

    private PhanCongResponse.AssignmentSummary toAssignmentSummary(CoVan_HocSinh cv) {
        HocSinh hs = cv.getHocSinh(); // @ManyToOne HocSinh
        PhanCongResponse.StudentSummary hsSummary = null;
        if (hs != null) {
            hsSummary = toStudentSummary(hs);
        }

        return PhanCongResponse.AssignmentSummary.builder()
                .idNv(cv.getId().getIdNv())
                .idHs(cv.getId().getIdHs())
                .ngayBatDau(cv.getId().getNgayBatDau())
                .ngayKetThuc(cv.getNgayKetThuc())
                .trangThai(cv.getTrangThai())
                .ghiChu(cv.getGhiChu())
                .hocSinh(hsSummary)
                .build();
    }

    // ====================== 4. CREATE ASSIGNMENT ======================

    @Override
    public void createAssignment(PhanCongRequest.CreateAssignmentRequest request) {
        if (request.getNgayBatDau() == null) {
            throw new IllegalArgumentException("NgayBatDau không được null");
        }

        String idNv = request.getIdNv();
        String idHs = request.getIdHs();

        NhanVien nv = nhanVienAdminRepository.findById(idNv)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên ID_NV=" + idNv));
        HocSinh hs = hocSinhAdminRepository.findById(idHs)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học sinh ID_HS=" + idHs));

        CoVanHocSinhId id = CoVanHocSinhId.builder()
                .idNv(idNv)
                .idHs(idHs)
                .ngayBatDau(request.getNgayBatDau())
                .build();

        boolean exists = coVanHocSinhAdminRepository.existsById(id);
        if (exists) {
            throw new IllegalArgumentException("Phân công đã tồn tại với NgayBatDau này.");
        }

        CoVan_HocSinh cv = CoVan_HocSinh.builder()
                .id(id)
                .nhanVien(nv)
                .hocSinh(hs)
                .ngayKetThuc(request.getNgayKetThuc())
                .trangThai(request.getTrangThai())
                .ghiChu(request.getGhiChu())
                .build();

        coVanHocSinhAdminRepository.save(cv);
    }

    // ====================== 5. UPDATE ASSIGNMENT ======================

    @Override
    public void updateAssignment(PhanCongRequest.UpdateAssignmentRequest request) {
        PhanCongRequest.UpdateAssignmentRequest.OriginalKey key = request.getOriginalKey();
        PhanCongRequest.UpdateAssignmentRequest.UpdateData update = request.getUpdate();
        if (key == null || update == null) {
            throw new IllegalArgumentException("Thiếu originalKey hoặc update");
        }

        CoVanHocSinhId originalId = CoVanHocSinhId.builder()
                .idNv(key.getIdNv())
                .idHs(key.getIdHs())
                .ngayBatDau(key.getNgayBatDau())
                .build();

        CoVan_HocSinh existing = coVanHocSinhAdminRepository.findById(originalId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phân công để cập nhật."));

        LocalDateTime newNgayBatDau = update.getNgayBatDau() != null
                ? update.getNgayBatDau()
                : existing.getId().getNgayBatDau();

        // Nếu NgayBatDau đổi => xóa bản ghi cũ & tạo mới với PK mới
        if (!newNgayBatDau.equals(existing.getId().getNgayBatDau())) {
            coVanHocSinhAdminRepository.delete(existing);

            CoVanHocSinhId newId = CoVanHocSinhId.builder()
                    .idNv(existing.getId().getIdNv())
                    .idHs(existing.getId().getIdHs())
                    .ngayBatDau(newNgayBatDau)
                    .build();

            CoVan_HocSinh newEntity = CoVan_HocSinh.builder()
                    .id(newId)
                    .nhanVien(existing.getNhanVien())
                    .hocSinh(existing.getHocSinh())
                    .ngayKetThuc(update.getNgayKetThuc() != null
                            ? update.getNgayKetThuc()
                            : existing.getNgayKetThuc())
                    .trangThai(update.getTrangThai() != null
                            ? update.getTrangThai()
                            : existing.getTrangThai())
                    .ghiChu(update.getGhiChu() != null
                            ? update.getGhiChu()
                            : existing.getGhiChu())
                    .build();

            coVanHocSinhAdminRepository.save(newEntity);
        } else {
            // không đổi PK, chỉ update field còn lại
            if (update.getNgayKetThuc() != null) {
                existing.setNgayKetThuc(update.getNgayKetThuc());
            }
            if (update.getTrangThai() != null) {
                existing.setTrangThai(update.getTrangThai());
            }
            if (update.getGhiChu() != null) {
                existing.setGhiChu(update.getGhiChu());
            }
            coVanHocSinhAdminRepository.save(existing);
        }
    }

    // ====================== 6. END ASSIGNMENT ======================

    @Override
    public void endAssignment(PhanCongRequest.EndAssignmentRequest request) {
        CoVanHocSinhId id = CoVanHocSinhId.builder()
                .idNv(request.getIdNv())
                .idHs(request.getIdHs())
                .ngayBatDau(request.getNgayBatDau())
                .build();

        CoVan_HocSinh existing = coVanHocSinhAdminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phân công để kết thúc."));

        if (request.getNgayKetThuc() != null) {
            existing.setNgayKetThuc(request.getNgayKetThuc());
        } else if (existing.getNgayKetThuc() == null) {
            existing.setNgayKetThuc(LocalDateTime.now());
        }

        if (request.getTrangThai() != null) {
            existing.setTrangThai(request.getTrangThai());
        }

        coVanHocSinhAdminRepository.save(existing);
    }

    // Thêm 1 helper dùng chung
    private boolean isAssignmentActive(CoVan_HocSinh cv) {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime start = cv.getId().getNgayBatDau();
        LocalDateTime end   = cv.getNgayKetThuc(); // cột NgayKetThuc trong CoVan_HocSinh

        boolean started   = (start == null) || !start.isAfter(now);   // start <= now
        boolean notEnded  = (end == null)   || !end.isBefore(now);    // end >= now hoặc chưa set

        return started && notEnded;
    }



}
