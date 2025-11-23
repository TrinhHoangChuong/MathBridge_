package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.HocSinhBaiTapRequest;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse.*;
import com.mathbridge.entity.*;
import com.mathbridge.repository.Admin.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HocSinhBaiTapServiceImpl implements HocSinhBaiTapService {

    private final HocSinhAdminRepository hocSinhAdminRepository;
    private final DangKyLHAdminRepository dangKyLHAdminRepository;
    private final LopHocAdminRepository lopHocAdminRepository;
    private final ChuongTrinhAdminRepository chuongTrinhAdminRepository;
    private final BuoiHocChiTietAdminRepository buoiHocChiTietAdminRepository;
    private final BaiTapAdminRepository baiTapAdminRepository;
    private final BaiNopAdminRepository baiNopAdminRepository;
    private final KetQuaHocTapAdminRepository ketQuaHocTapAdminRepository;
    private final DanhGiaBuoiHocAdminRepository danhGiaBuoiHocAdminRepository;
    private final DanhGiaLopHocAdminRepository danhGiaLopHocAdminRepository;

    // =========================================================
    // 1. LIST + FILTER HỌC SINH
    // =========================================================

    @Override
    public HocSinhBaiTapResponse searchStudents(HocSinhBaiTapRequest request) {
        try {
            List<HocSinh> allStudents = hocSinhAdminRepository.findAll();

            // Build map: HS -> số lớp đang học
            List<String> allStudentIds = allStudents.stream()
                    .map(HocSinh::getIdHs)
                    .collect(Collectors.toList());
            Map<String, Long> classCountByStudentId = buildClassCountMap(allStudentIds);

            // Filter theo chương trình / lớp
            Set<String> allowedStudentIdsByClass = filterStudentIdsByProgramAndClass(
                    request.getProgramId(),
                    request.getClassId()
            );

            String keyword = normalize(request.getSearchKeyword());
            String statusFilter = request.getStatus();

            List<StudentSummary> summaries = allStudents.stream()
                    .filter(hs -> allowedStudentIdsByClass == null || allowedStudentIdsByClass.contains(hs.getIdHs()))
                    .filter(hs -> matchKeyword(hs, keyword))
                    .filter(hs -> matchStatus(hs, statusFilter))
                    .map(hs -> {
                        long soLop = classCountByStudentId.getOrDefault(hs.getIdHs(), 0L);
                        return StudentSummary.builder()
                                .idHs(hs.getIdHs())
                                .fullName(buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen()))
                                .email(hs.getEmail())
                                .sdt(hs.getSdt())
                                .trangThaiHoatDong(Boolean.TRUE.equals(hs.getTrangThaiHoatDong()))
                                .soLopDangHoc((int) soLop)
                                .build();
                    })
                    .collect(Collectors.toList());

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .students(summaries)
                    .totalStudents((long) summaries.size())
                    .message("Lấy danh sách học sinh thành công")
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi tìm kiếm học sinh: " + e.getMessage())
                    .build();
        }
    }

    private Map<String, Long> buildClassCountMap(List<String> studentIds) {
        if (studentIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<DangKyLH> regs = dangKyLHAdminRepository.findByHocSinh_IdHsIn(studentIds);
        return regs.stream()
                .collect(Collectors.groupingBy(
                        reg -> reg.getHocSinh().getIdHs(),
                        Collectors.counting()
                ));
    }

    private Set<String> filterStudentIdsByProgramAndClass(String programId, String classId) {
        boolean hasProgram = StringUtils.hasText(programId);
        boolean hasClass = StringUtils.hasText(classId);

        if (!hasProgram && !hasClass) {
            return null;
        }

        Set<String> classIds = new HashSet<>();
        if (hasClass) {
            classIds.add(classId);
        }
        if (hasProgram) {
            List<LopHoc> classesByProgram = lopHocAdminRepository.findByIdCt(programId);
            classesByProgram.stream()
                    .map(LopHoc::getIdLh)
                    .forEach(classIds::add);
        }
        if (classIds.isEmpty()) {
            return Collections.emptySet();
        }

        // Set -> List cho repo .In(...)
        List<DangKyLH> regs = dangKyLHAdminRepository.findByLopHoc_IdLhIn(new ArrayList<>(classIds));
        return regs.stream()
                .map(reg -> reg.getHocSinh().getIdHs())
                .collect(Collectors.toSet());
    }

    // =========================================================
    // 2. CHI TIẾT 1 HỌC SINH
    // =========================================================

    @Override
    public HocSinhBaiTapResponse getStudentDetail(String studentId) {
        try {
            HocSinh hs = hocSinhAdminRepository.findById(studentId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy học sinh với ID: " + studentId));

            // Đăng ký lớp
            List<DangKyLH> regs = dangKyLHAdminRepository.findByHocSinh_IdHs(studentId);
            List<String> classIds = regs.stream()
                    .map(reg -> reg.getLopHoc().getIdLh())
                    .distinct()
                    .collect(Collectors.toList());

            Map<String, LopHoc> lopHocMap = lopHocAdminRepository.findAllById(classIds)
                    .stream()
                    .collect(Collectors.toMap(LopHoc::getIdLh, l -> l));

            // Lấy CT cho các lớp
            Set<String> programIds = lopHocMap.values().stream()
                    .map(LopHoc::getIdCt)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, ChuongTrinh> ctMap = chuongTrinhAdminRepository.findAllById(programIds)
                    .stream()
                    .collect(Collectors.toMap(ChuongTrinh::getIdCt, c -> c));

            List<StudentClass> classDtos = regs.stream()
                    .map(DangKyLH::getLopHoc)
                    .filter(Objects::nonNull)
                    .map(lop -> {
                        ChuongTrinh ct = ctMap.get(lop.getIdCt());
                        return StudentClass.builder()
                                .idLh(lop.getIdLh())
                                .tenLop(lop.getTenLop())
                                .idCt(lop.getIdCt())
                                .tenCt(ct != null ? ct.getTenCt() : null)
                                .loaiNgay(lop.getLoaiNgay())
                                .hinhThucHoc(lop.getHinhThucHoc())
                                .trangThai(lop.getTrangThai())
                                .ngayBatDau(lop.getNgayBatDau())
                                .soBuoi(lop.getSoBuoi() != null ? lop.getSoBuoi().toString() : null)
                                .mucGiaThang(lop.getMucGiaThang())
                                .build();
                    })
                    .collect(Collectors.toList());

            // Build summary stats
            StudentSummaryStats stats = buildStudentSummaryStats(studentId, classIds);

            StudentDetail detail = StudentDetail.builder()
                    .idHs(hs.getIdHs())
                    .idTk(hs.getIdTk())
                    .ho(hs.getHo())
                    .tenDem(hs.getTenDem())
                    .ten(hs.getTen())
                    .email(hs.getEmail())
                    .sdt(hs.getSdt())
                    .gioiTinh(hs.getGioiTinh())
                    .diaChi(hs.getDiaChi())
                    .ngaySinh(hs.getNgaySinh())
                    .trangThaiHoatDong(hs.getTrangThaiHoatDong())
                    .thoiGianTao(hs.getThoiGianTao())
                    .thoiGianCapNhat(hs.getThoiGianCapNhat())
                    .build();

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .message("Lấy chi tiết học sinh thành công")
                    .studentDetail(detail)
                    .studentClasses(classDtos)
                    .studentStats(stats)
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi lấy chi tiết học sinh: " + e.getMessage())
                    .build();
        }
    }

    private StudentSummaryStats buildStudentSummaryStats(String studentId, List<String> classIds) {
        int soLop = classIds.size();
        int tongSoBaiTap = 0;
        int soBaiDaNop = 0;
        int soBaiChuaNop = 0;
        BigDecimal diemTb = null;
        String xepLoai = null;

        // Kết quả học tập
        Optional<KetQuaHocTap> optKq = ketQuaHocTapAdminRepository.findFirstByIdHs(studentId);
        if (optKq.isPresent()) {
            KetQuaHocTap kq = optKq.get();
            diemTb = kq.getDiemTongKet();
            xepLoai = kq.getXepLoai();
        }

        // Bài tập + Bài nộp
        if (!classIds.isEmpty()) {
            List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLhIn(classIds);
            List<String> sessionIds = sessions.stream()
                    .map(BuoiHocChiTiet::getIdBh)
                    .distinct()
                    .collect(Collectors.toList());

            if (!sessionIds.isEmpty()) {
                List<BaiTap> baiTaps = baiTapAdminRepository.findByIdBhIn(sessionIds);
                Set<String> assignmentIds = baiTaps.stream()
                        .map(BaiTap::getIdBt)
                        .collect(Collectors.toSet());
                tongSoBaiTap = assignmentIds.size();

                List<BaiNop> submissions = baiNopAdminRepository.findByIdHs(studentId);
                List<BaiNop> submissionsInTheseClasses = submissions.stream()
                        .filter(bn -> assignmentIds.contains(bn.getIdBt()))
                        .collect(Collectors.toList());
                soBaiDaNop = submissionsInTheseClasses.size();
                soBaiChuaNop = Math.max(0, tongSoBaiTap - soBaiDaNop);

                // Tính điểm TB từ bài nộp nếu chưa có
                if (diemTb == null) {
                    List<BigDecimal> diemList = submissionsInTheseClasses.stream()
                            .map(BaiNop::getDiemSo)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                    if (!diemList.isEmpty()) {
                        BigDecimal sum = diemList.stream()
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        diemTb = sum.divide(BigDecimal.valueOf(diemList.size()), 2, RoundingMode.HALF_UP);
                    }
                }
            }
        }

        return StudentSummaryStats.builder()
                .soLopDangHoc(soLop)
                .tongSoBaiTap(tongSoBaiTap)
                .soBaiDaNop(soBaiDaNop)
                .soBaiChuaNop(soBaiChuaNop)
                .diemTrungBinh(diemTb)
                .xepLoai(xepLoai)
                .build();
    }

    // =========================================================
    // 3. TẠO / CẬP NHẬT HỌC SINH
    // =========================================================

    @Override
    @Transactional
    public HocSinhBaiTapResponse createStudent(HocSinhBaiTapRequest request) {
        try {
            HocSinh hs = new HocSinh();

            if (StringUtils.hasText(request.getIdHs())) {
                hs.setIdHs(request.getIdHs());
            }

            hs.setIdTk(request.getIdTk());
            hs.setHo(request.getHo());
            hs.setTenDem(request.getTenDem());
            hs.setTen(request.getTen());
            hs.setEmail(request.getEmail());
            hs.setSdt(request.getSdt());
            hs.setGioiTinh(request.getGioiTinh());
            hs.setDiaChi(request.getDiaChi());
            hs.setNgaySinh(request.getNgaySinh());
            hs.setTrangThaiHoatDong(
                    request.getTrangThaiHoatDong() != null ? request.getTrangThaiHoatDong() : Boolean.TRUE
            );
            LocalDateTime now = LocalDateTime.now();
            hs.setThoiGianTao(now);
            hs.setThoiGianCapNhat(now);

            HocSinh saved = hocSinhAdminRepository.save(hs);
            return getStudentDetail(saved.getIdHs());
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi tạo học sinh: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public HocSinhBaiTapResponse updateStudent(String studentId, HocSinhBaiTapRequest request) {
        try {
            HocSinh hs = hocSinhAdminRepository.findById(studentId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy học sinh với ID: " + studentId));

            if (StringUtils.hasText(request.getHo())) hs.setHo(request.getHo());
            hs.setTenDem(request.getTenDem());
            if (StringUtils.hasText(request.getTen())) hs.setTen(request.getTen());
            if (StringUtils.hasText(request.getEmail())) hs.setEmail(request.getEmail());
            if (StringUtils.hasText(request.getSdt())) hs.setSdt(request.getSdt());
            if (request.getGioiTinh() != null) hs.setGioiTinh(request.getGioiTinh());
            if (StringUtils.hasText(request.getDiaChi())) hs.setDiaChi(request.getDiaChi());
            if (request.getNgaySinh() != null) hs.setNgaySinh(request.getNgaySinh());
            if (request.getTrangThaiHoatDong() != null) hs.setTrangThaiHoatDong(request.getTrangThaiHoatDong());

            hs.setThoiGianCapNhat(LocalDateTime.now());
            hocSinhAdminRepository.save(hs);

            return getStudentDetail(studentId);
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi cập nhật học sinh: " + e.getMessage())
                    .build();
        }
    }

    // =========================================================
    // 4. THÊM / XOÁ HỌC SINH KHỎI LỚP
    // =========================================================

    @Override
    @Transactional
    public HocSinhBaiTapResponse addStudentToClass(String studentId, HocSinhBaiTapRequest request) {
        try {
            String classId = request.getClassIdToAdd();
            if (!StringUtils.hasText(classId)) {
                throw new IllegalArgumentException("classIdToAdd không được null");
            }

            HocSinh hs = hocSinhAdminRepository.findById(studentId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy học sinh: " + studentId));

            LopHoc lop = lopHocAdminRepository.findById(classId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy lớp: " + classId));

            // Check trùng đăng ký
            boolean exists = dangKyLHAdminRepository
                    .findByHocSinh_IdHsAndLopHoc_IdLh(studentId, classId)
                    .stream()
                    .findAny()
                    .isPresent();

            if (!exists) {
                DangKyLhId id = DangKyLhId.builder()
                        .idHs(studentId)
                        .idLh(classId)
                        .build();

                DangKyLH reg = DangKyLH.builder()
                        .id(id)
                        .hocSinh(hs)
                        .lopHoc(lop)
                        .build();

                dangKyLHAdminRepository.save(reg);
            }

            return getStudentDetail(studentId);
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi thêm học sinh vào lớp: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public void removeStudentFromClass(String studentId, String classId) {
        try {
            List<DangKyLH> regs = dangKyLHAdminRepository
                    .findByHocSinh_IdHsAndLopHoc_IdLh(studentId, classId);
            dangKyLHAdminRepository.deleteAll(regs);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa học sinh khỏi lớp: " + e.getMessage(), e);
        }
    }

    // =========================================================
    // 5. TAB BÀI TẬP
    // =========================================================

    @Override
    public HocSinhBaiTapResponse searchAssignments(HocSinhBaiTapRequest request) {
        try {
            Set<String> classIds = resolveClassIds(request.getProgramId(), request.getClassId());
            if (classIds.isEmpty()) {
                return HocSinhBaiTapResponse.builder()
                        .success(true)
                        .assignments(Collections.emptyList())
                        .message("Không tìm thấy lớp phù hợp")
                        .build();
            }

            // Buổi học của các lớp
            List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLhIn(new ArrayList<>(classIds));
            if (sessions.isEmpty()) {
                return HocSinhBaiTapResponse.builder()
                        .success(true)
                        .assignments(Collections.emptyList())
                        .message("Chưa có buổi học / bài tập cho các lớp đã chọn")
                        .build();
            }

            Map<String, BuoiHocChiTiet> sessionMap = sessions.stream()
                    .collect(Collectors.toMap(BuoiHocChiTiet::getIdBh, s -> s));

            List<String> sessionIds = new ArrayList<>(sessionMap.keySet());

            // Lấy danh sách bài tập
            List<BaiTap> allAssignments = baiTapAdminRepository.findByIdBhIn(sessionIds);

            // Lọc theo fromDate/toDate
            LocalDate from = request.getFromDate();
            LocalDate to = request.getToDate();

            List<BaiTap> filteredAssignments = allAssignments.stream()
                    .filter(bt -> {
                        if (from == null && to == null) return true;
                        LocalDate start = bt.getNgayBatDau() != null ? bt.getNgayBatDau().toLocalDate() : null;
                        LocalDate end = bt.getNgayKetThuc() != null ? bt.getNgayKetThuc().toLocalDate() : null;

                        if (from != null && end != null && end.isBefore(from)) return false;
                        if (to != null && start != null && start.isAfter(to)) return false;
                        return true;
                    })
                    .collect(Collectors.toList());

            // Chuẩn bị dữ liệu
            Set<String> allClassIds = sessions.stream()
                    .map(BuoiHocChiTiet::getIdLh)
                    .collect(Collectors.toSet());

            Map<String, LopHoc> lopHocMap = lopHocAdminRepository.findAllById(allClassIds).stream()
                    .collect(Collectors.toMap(LopHoc::getIdLh, l -> l));

            Set<String> programIds = lopHocMap.values().stream()
                    .map(LopHoc::getIdCt)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, ChuongTrinh> ctMap = chuongTrinhAdminRepository.findAllById(programIds).stream()
                    .collect(Collectors.toMap(ChuongTrinh::getIdCt, c -> c));

            // Số HS mỗi lớp
            List<DangKyLH> regs = dangKyLHAdminRepository.findByLopHoc_IdLhIn(new ArrayList<>(allClassIds));
            Map<String, Long> studentCountByClassId = regs.stream()
                    .collect(Collectors.groupingBy(reg -> reg.getLopHoc().getIdLh(), Collectors.counting()));

            // Submissions cho các bài tập
            List<String> assignmentIds = filteredAssignments.stream()
                    .map(BaiTap::getIdBt)
                    .collect(Collectors.toList());

            Map<String, List<BaiNop>> submissionsByAssignment = assignmentIds.isEmpty()
                    ? Collections.emptyMap()
                    : baiNopAdminRepository.findByIdBtIn(assignmentIds).stream()
                    .collect(Collectors.groupingBy(BaiNop::getIdBt));

            final Map<String, List<BaiNop>> submissionsMap = submissionsByAssignment;

            // Build DTO
            List<AssignmentSummary> dtoList = filteredAssignments.stream()
                    .map(bt -> {
                        BuoiHocChiTiet session = sessionMap.get(bt.getIdBh());
                        String idLh = (session != null ? session.getIdLh() : null);
                        LopHoc lop = idLh != null ? lopHocMap.get(idLh) : null;
                        ChuongTrinh ct = (lop != null && lop.getIdCt() != null) ? ctMap.get(lop.getIdCt()) : null;

                        List<BaiNop> subs = submissionsMap.getOrDefault(bt.getIdBt(), Collections.emptyList());
                        BigDecimal avgScore = null;
                        if (!subs.isEmpty()) {
                            List<BigDecimal> scores = subs.stream()
                                    .map(BaiNop::getDiemSo)
                                    .filter(Objects::nonNull)
                                    .collect(Collectors.toList());
                            if (!scores.isEmpty()) {
                                BigDecimal sum = scores.stream()
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                avgScore = sum.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP);
                            }
                        }

                        return AssignmentSummary.builder()
                                .idBt(bt.getIdBt())
                                .tieuDe(bt.getTieuDe())
                                .moTa(bt.getMoTa())
                                .loaiBt(bt.getLoaiBt())
                                .idBh(bt.getIdBh())
                                .tenBuoiHoc(session != null ? session.getTenCaHoc() : null)
                                .ngayHoc(session != null ? session.getNgayHoc() : null)
                                .idLh(idLh)
                                .tenLop(lop != null ? lop.getTenLop() : null)
                                .idCt(lop != null ? lop.getIdCt() : null)
                                .tenCt(ct != null ? ct.getTenCt() : null)
                                .ngayBatDau(bt.getNgayBatDau())
                                .ngayKetThuc(bt.getNgayKetThuc())
                                .soHsTrongLop(studentCountByClassId.getOrDefault(idLh, 0L).intValue())
                                .soLuongNop(subs.size())
                                .diemTrungBinh(avgScore)
                                .build();
                    })
                    .collect(Collectors.toList());

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .assignments(dtoList)
                    .message("Lấy danh sách bài tập thành công")
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi tìm kiếm bài tập: " + e.getMessage())
                    .build();
        }
    }

    // =========================================================
    // 6. TAB BÀI NỘP & CHẤM ĐIỂM
    // =========================================================

    @Override
    public HocSinhBaiTapResponse searchSubmissions(HocSinhBaiTapRequest request) {
        try {
            Set<String> classIds = resolveClassIds(request.getProgramId(), request.getClassId());

            // Lấy assignment cần xem
            Set<String> assignmentIds = new HashSet<>();
            Map<String, BaiTap> assignmentMap = new HashMap<>();

            if (StringUtils.hasText(request.getAssignmentId())) {
                baiTapAdminRepository.findById(request.getAssignmentId())
                        .ifPresent(bt -> {
                            assignmentIds.add(bt.getIdBt());
                            assignmentMap.put(bt.getIdBt(), bt);
                        });
            } else if (!classIds.isEmpty()) {
                // tất cả bài tập của các lớp đã chọn
                List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLhIn(new ArrayList<>(classIds));
                List<String> sessionIds = sessions.stream()
                        .map(BuoiHocChiTiet::getIdBh)
                        .collect(Collectors.toList());
                if (!sessionIds.isEmpty()) {
                    List<BaiTap> assignments = baiTapAdminRepository.findByIdBhIn(sessionIds);
                    assignments.forEach(bt -> {
                        assignmentIds.add(bt.getIdBt());
                        assignmentMap.put(bt.getIdBt(), bt);
                    });
                }
            }

            if (assignmentIds.isEmpty()) {
                return HocSinhBaiTapResponse.builder()
                        .success(true)
                        .submissions(Collections.emptyList())
                        .message("Chưa có bài tập / bài nộp phù hợp")
                        .build();
            }

            List<BaiNop> baiNops = baiNopAdminRepository.findByIdBtIn(new ArrayList<>(assignmentIds));

            // Lọc theo học sinh nếu có
            if (StringUtils.hasText(request.getStudentId())) {
                baiNops = baiNops.stream()
                        .filter(bn -> request.getStudentId().equals(bn.getIdHs()))
                        .collect(Collectors.toList());
            }

            if (baiNops.isEmpty()) {
                return HocSinhBaiTapResponse.builder()
                        .success(true)
                        .submissions(Collections.emptyList())
                        .message("Chưa có bài nộp")
                        .build();
            }

            // Lấy thông tin học sinh
            Set<String> studentIds = baiNops.stream()
                    .map(BaiNop::getIdHs)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, HocSinh> studentMap = hocSinhAdminRepository.findAllById(studentIds).stream()
                    .collect(Collectors.toMap(HocSinh::getIdHs, h -> h));

            List<SubmissionSummary> dtoList = baiNops.stream()
                    .map(bn -> {
                        HocSinh hs = studentMap.get(bn.getIdHs());
                        BaiTap bt = assignmentMap.get(bn.getIdBt());
                        String fullName = hs != null
                                ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                                : null;
                        return SubmissionSummary.builder()
                                .idBn(bn.getIdBn())
                                .idBt(bn.getIdBt())
                                .tieuDeBt(bt != null ? bt.getTieuDe() : null)
                                .idHs(bn.getIdHs())
                                .tenHs(fullName)
                                .fileUrl(bn.getFileUrl())
                                .diemSo(bn.getDiemSo())
                                .nhanXet(bn.getNhanXet())
                                .trangThai(bn.getTrangThai())
                                .ghiChu(bn.getGhiChu())
                                .build();
                    })
                    .collect(Collectors.toList());

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .submissions(dtoList)
                    .message("Lấy danh sách bài nộp thành công")
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi tìm kiếm bài nộp: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public HocSinhBaiTapResponse gradeSubmission(String submissionId, HocSinhBaiTapRequest request) {
        try {
            BaiNop submission = baiNopAdminRepository.findById(submissionId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài nộp: " + submissionId));

            // Cập nhật điểm và nhận xét
            if (request.getDiemSo() != null) {
                submission.setDiemSo(request.getDiemSo());
            }
            if (StringUtils.hasText(request.getNhanXet())) {
                submission.setNhanXet(request.getNhanXet());
            }

            // Cập nhật trạng thái thành "Đã chấm"
            submission.setTrangThai("Đã chấm");

            baiNopAdminRepository.save(submission);

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .message("Chấm điểm bài nộp thành công")
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi chấm điểm bài nộp: " + e.getMessage())
                    .build();
        }
    }

    // =========================================================
    // 7. TAB ĐÁNH GIÁ & KẾT QUẢ
    // =========================================================

    @Override
    public HocSinhBaiTapResponse getClassEvaluationAndResult(HocSinhBaiTapRequest request) {
        try {
            String classId = request.getClassId();
            if (!StringUtils.hasText(classId)) {
                throw new IllegalArgumentException("classId không được null khi xem đánh giá & kết quả lớp");
            }

            // Tất cả HS thuộc lớp
            List<DangKyLH> regs = dangKyLHAdminRepository.findByLopHoc_IdLh(classId);
            Set<String> studentIds = regs.stream()
                    .map(reg -> reg.getHocSinh().getIdHs())
                    .collect(Collectors.toSet());

            Map<String, HocSinh> studentMap = studentIds.isEmpty()
                    ? Collections.emptyMap()
                    : hocSinhAdminRepository.findAllById(studentIds).stream()
                    .collect(Collectors.toMap(HocSinh::getIdHs, h -> h));

            // Lấy thông tin lớp
            LopHoc lopHoc = lopHocAdminRepository.findById(classId).orElse(null);
            String tenLop = lopHoc != null ? lopHoc.getTenLop() : null;

            // Buổi học của lớp
            List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLhIn(
                    Collections.singletonList(classId)
            );
            Map<String, BuoiHocChiTiet> sessionMap = sessions.stream()
                    .collect(Collectors.toMap(BuoiHocChiTiet::getIdBh, s -> s));

            List<String> sessionIds = new ArrayList<>(sessionMap.keySet());

            // --------- Đánh giá buổi học ----------
            List<LessonEvaluation> lessonDtos = Collections.emptyList();
            if (!sessionIds.isEmpty()) {
                List<DanhGiaBuoiHoc> dgBuoiList = danhGiaBuoiHocAdminRepository.findByIdBhIn(sessionIds);
                lessonDtos = dgBuoiList.stream()
                        .map(dg -> {
                            BuoiHocChiTiet bh = sessionMap.get(dg.getIdBh());
                            HocSinh hs = studentMap.get(dg.getIdHs());
                            String fullName = hs != null
                                    ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                                    : null;
                            return LessonEvaluation.builder()
                                    .idDgbh(dg.getIdDgbh())
                                    .idBh(dg.getIdBh())
                                    .tenBuoiHoc(bh != null ? bh.getTenCaHoc() : null)
                                    .ngayHoc(bh != null ? bh.getNgayHoc() : null)
                                    .idHs(dg.getIdHs())
                                    .tenHs(fullName)
                                    .diemDanhGia(dg.getDiemDanhGia())
                                    .nhanXet(dg.getNhanXet())
                                    .thoiDiemDanhGia(dg.getThoiDiemDanhGia())
                                    .build();
                        })
                        .collect(Collectors.toList());
            }

            // --------- Đánh giá lớp học ----------
            List<DanhGiaLopHoc> dgLopList = danhGiaLopHocAdminRepository.findByIdLh(classId);
            List<ClassEvaluation> classEvalDtos = dgLopList.stream()
                    .map(dg -> {
                        HocSinh hs = studentMap.get(dg.getIdHs());
                        String fullName = hs != null
                                ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                                : null;
                        return ClassEvaluation.builder()
                                .idDglh(dg.getIdDglh())
                                .idLh(dg.getIdLh())
                                .tenLop(tenLop)
                                .idHs(dg.getIdHs())
                                .tenHs(fullName)
                                .diemDanhGia(dg.getDiemDanhGia())
                                .nhanXet(dg.getNhanXet())
                                .thoiDiemDanhGia(dg.getThoiDiemDanhGia())
                                .build();
                    })
                    .collect(Collectors.toList());

            // --------- Kết quả & xếp loại ----------
            List<ClassResult> resultDtos = Collections.emptyList();
            if (!studentIds.isEmpty()) {
                List<KetQuaHocTap> results = ketQuaHocTapAdminRepository.findByIdHsIn(
                        new ArrayList<>(studentIds)
                );
                resultDtos = results.stream()
                        .map(kq -> {
                            HocSinh hs = studentMap.get(kq.getIdHs());
                            String fullName = hs != null
                                    ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                                    : null;
                            return ClassResult.builder()
                                    .idHs(kq.getIdHs())
                                    .tenHs(fullName)
                                    .idLh(classId)
                                    .tenLop(tenLop)
                                    .diemKetQua(kq.getDiemTongKet())
                                    .xepLoai(kq.getXepLoai())
                                    .build();
                        })
                        .collect(Collectors.toList());
            }

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .lessonEvaluations(lessonDtos)
                    .classEvaluations(classEvalDtos)
                    .classResults(resultDtos)
                    .message("Lấy đánh giá & kết quả lớp thành công")
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi lấy đánh giá & kết quả: " + e.getMessage())
                    .build();
        }
    }

    // =========================================================
    // 8. API CHO FILTER COMBOBOX
    // =========================================================

    @Override
    public HocSinhBaiTapResponse getSessionsByClass(String classId) {
        try {
            if (!StringUtils.hasText(classId)) {
                return HocSinhBaiTapResponse.builder()
                        .success(true)
                        .sessionOptions(Collections.emptyList())
                        .message("ClassId không được trống")
                        .build();
            }

            List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLh(classId);

            List<SessionOption> sessionOptions = sessions.stream()
                    .map(session -> SessionOption.builder()
                            .idBh(session.getIdBh())
                            .tenBuoiHoc(session.getTenCaHoc())
                            .ngayHoc(session.getNgayHoc())
                            .idLh(session.getIdLh())
                            .build())
                    .collect(Collectors.toList());

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .sessionOptions(sessionOptions)
                    .message("Lấy danh sách buổi học thành công")
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách buổi học: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public HocSinhBaiTapResponse getAssignmentsByClass(String classId) {
        try {
            if (!StringUtils.hasText(classId)) {
                return HocSinhBaiTapResponse.builder()
                        .success(true)
                        .assignmentOptions(Collections.emptyList())
                        .message("ClassId không được trống")
                        .build();
            }

            // Lấy buổi học của lớp
            List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLh(classId);
            List<String> sessionIds = sessions.stream()
                    .map(BuoiHocChiTiet::getIdBh)
                    .collect(Collectors.toList());

            if (sessionIds.isEmpty()) {
                return HocSinhBaiTapResponse.builder()
                        .success(true)
                        .assignmentOptions(Collections.emptyList())
                        .message("Lớp chưa có buổi học")
                        .build();
            }

            // Lấy bài tập của các buổi học
            List<BaiTap> assignments = baiTapAdminRepository.findByIdBhIn(sessionIds);

            List<AssignmentOption> assignmentOptions = assignments.stream()
                    .map(assignment -> AssignmentOption.builder()
                            .idBt(assignment.getIdBt())
                            .tieuDe(assignment.getTieuDe())
                            .idLh(classId)
                            .build())
                    .collect(Collectors.toList());

            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .assignmentOptions(assignmentOptions)
                    .message("Lấy danh sách bài tập thành công")
                    .build();
        } catch (Exception e) {
            return HocSinhBaiTapResponse.builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách bài tập: " + e.getMessage())
                    .build();
        }
    }

    // =========================================================
    // 9. HELPER METHODS
    // =========================================================

    private Set<String> resolveClassIds(String programId, String classId) {
        Set<String> classIds = new HashSet<>();

        if (StringUtils.hasText(classId)) {
            classIds.add(classId);
        }

        if (StringUtils.hasText(programId)) {
            List<LopHoc> classesByProgram = lopHocAdminRepository.findByIdCt(programId);
            classesByProgram.stream()
                    .map(LopHoc::getIdLh)
                    .forEach(classIds::add);
        }

        return classIds;
    }

    private boolean matchKeyword(HocSinh hs, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        String fullName = normalize(buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen()));
        String email = normalize(hs.getEmail());
        String sdt = normalize(hs.getSdt());
        String idHs = normalize(hs.getIdHs());

        return fullName.contains(keyword)
                || email.contains(keyword)
                || sdt.contains(keyword)
                || idHs.contains(keyword);
    }

    private boolean matchStatus(HocSinh hs, String statusFilter) {
        if (!StringUtils.hasText(statusFilter)) {
            return true;
        }
        boolean active = Boolean.TRUE.equals(hs.getTrangThaiHoatDong());
        if ("active".equalsIgnoreCase(statusFilter)) {
            return active;
        }
        if ("inactive".equalsIgnoreCase(statusFilter)) {
            return !active;
        }
        return true;
    }

    private String buildFullName(String ho, String tenDem, String ten) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(ho)) {
            sb.append(ho.trim());
        }
        if (StringUtils.hasText(tenDem)) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(tenDem.trim());
        }
        if (StringUtils.hasText(ten)) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(ten.trim());
        }
        return sb.toString();
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase();
    }
}
