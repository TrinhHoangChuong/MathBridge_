package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.HocSinhBaiTapRequest;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse.StudentClass;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse.StudentDetail;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse.StudentSummary;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse.StudentSummaryStats;
import com.mathbridge.entity.*;
import com.mathbridge.repository.Admin.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
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

    public HocSinhBaiTapServiceImpl(
            HocSinhAdminRepository hocSinhAdminRepository,
            DangKyLHAdminRepository dangKyLHAdminRepository,
            LopHocAdminRepository lopHocAdminRepository,
            ChuongTrinhAdminRepository chuongTrinhAdminRepository,
            BuoiHocChiTietAdminRepository buoiHocChiTietAdminRepository,
            BaiTapAdminRepository baiTapAdminRepository,
            BaiNopAdminRepository baiNopAdminRepository,
            KetQuaHocTapAdminRepository ketQuaHocTapAdminRepository,
            DanhGiaBuoiHocAdminRepository danhGiaBuoiHocAdminRepository,
            DanhGiaLopHocAdminRepository danhGiaLopHocAdminRepository
    ) {
        this.hocSinhAdminRepository = hocSinhAdminRepository;
        this.dangKyLHAdminRepository = dangKyLHAdminRepository;
        this.lopHocAdminRepository = lopHocAdminRepository;
        this.chuongTrinhAdminRepository = chuongTrinhAdminRepository;
        this.buoiHocChiTietAdminRepository = buoiHocChiTietAdminRepository;
        this.baiTapAdminRepository = baiTapAdminRepository;
        this.baiNopAdminRepository = baiNopAdminRepository;
        this.ketQuaHocTapAdminRepository = ketQuaHocTapAdminRepository;
        this.danhGiaBuoiHocAdminRepository = danhGiaBuoiHocAdminRepository;
        this.danhGiaLopHocAdminRepository = danhGiaLopHocAdminRepository;
    }

    // =========================================================
    // 1. LIST + FILTER HỌC SINH
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HocSinhBaiTapResponse searchStudents(HocSinhBaiTapRequest request) {
        List<HocSinh> allStudents = hocSinhAdminRepository.findAll();

        // Build map: HS -> số lớp đang học (từ DangKyLH)
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

    /**
     * @return null nếu không lọc theo CT / lớp; hoặc Set ID_HS hợp lệ
     */
    private Set<String> filterStudentIdsByProgramAndClass(String programId, String classId) {
        boolean hasProgram = StringUtils.hasText(programId);
        boolean hasClass = StringUtils.hasText(classId);

        if (!hasProgram && !hasClass) {
            return null; // không giới hạn
        }

        // Lấy danh sách lớp cần quan tâm
        Set<String> classIds = new HashSet<>();
        if (hasClass) {
            classIds.add(classId);
        }

        if (hasProgram) {
            // Lọc các lớp thuộc chương trình này
            List<LopHoc> classesByProgram = lopHocAdminRepository.findByIdCt(programId);
            classesByProgram.stream()
                    .map(LopHoc::getIdLh)
                    .forEach(classIds::add);
        }

        if (classIds.isEmpty()) {
            return Collections.emptySet();
        }

        List<DangKyLH> regs = dangKyLHAdminRepository.findByLopHoc_IdLhIn(classIds);
        return regs.stream()
                .map(reg -> reg.getHocSinh().getIdHs())
                .collect(Collectors.toSet());
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
        if (s == null) return null;
        return s.trim().toLowerCase();
    }

    // =========================================================
    // 2. CHI TIẾT 1 HỌC SINH
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HocSinhBaiTapResponse getStudentDetail(String studentId) {
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

        // Lấy CT cho các lớp để hiển thị tên chương trình
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
                            // CHỖ NÀY: soBuoi trong DTO là String, convert từ kiểu số sang String
                            .soBuoi(lop.getSoBuoi() != null ? lop.getSoBuoi().toString() : null)
                            .mucGiaThang(lop.getMucGiaThang())
                            .build();
                })
                .collect(Collectors.toList());

        // Build summary stats: số lớp, số bài tập, số bài nộp, điểm TB, xếp loại
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
    }

    private StudentSummaryStats buildStudentSummaryStats(String studentId, List<String> classIds) {
        int soLop = classIds.size();
        int tongSoBaiTap = 0;
        int soBaiDaNop = 0;
        int soBaiChuaNop = 0;
        BigDecimal diemTb = null;
        String xepLoai = null;

        // ----- KẾT QUẢ HỌC TẬP -----
        Optional<KetQuaHocTap> optKq = ketQuaHocTapAdminRepository.findFirstByIdHs(studentId);
        if (optKq.isPresent()) {
            KetQuaHocTap kq = optKq.get();
            diemTb = kq.getDiemSo();
            xepLoai = kq.getXepLoai();
        }

        // ----- BÀI TẬP + BÀI NỘP -----
        if (!classIds.isEmpty()) {
            // Buổi học của các lớp
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
                // Chỉ tính các bài thuộc assignmentIds
                List<BaiNop> submissionsInTheseClasses = submissions.stream()
                        .filter(bn -> assignmentIds.contains(bn.getIdBt()))
                        .collect(Collectors.toList());
                soBaiDaNop = submissionsInTheseClasses.size();
                soBaiChuaNop = Math.max(0, tongSoBaiTap - soBaiDaNop);

                // Nếu chưa có điểm TB từ KetQuaHocTap thì tính TB từ DiemSo của BaiNop
                if (diemTb == null) {
                    List<BigDecimal> diemList = submissionsInTheseClasses.stream()
                            .map(BaiNop::getDiemSo)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                    if (!diemList.isEmpty()) {
                        BigDecimal sum = diemList.stream()
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        diemTb = sum.divide(BigDecimal.valueOf(diemList.size()), BigDecimal.ROUND_HALF_UP);
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
    public HocSinhBaiTapResponse createStudent(HocSinhBaiTapRequest request) {
        HocSinh hs = new HocSinh();

        // ID_HS có thể do hệ thống tự sinh (sequence / prefix),
        // ở đây tạm dùng giá trị được gửi từ FE nếu có.
        if (StringUtils.hasText(request.getIdHs())) {
            hs.setIdHs(request.getIdHs());
        }

        hs.setIdTk(request.getIdTk()); // NOT NULL theo schema
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
    }

    @Override
    public HocSinhBaiTapResponse updateStudent(String studentId, HocSinhBaiTapRequest request) {
        HocSinh hs = hocSinhAdminRepository.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy học sinh với ID: " + studentId));

        if (StringUtils.hasText(request.getHo())) {
            hs.setHo(request.getHo());
        }
        hs.setTenDem(request.getTenDem());
        if (StringUtils.hasText(request.getTen())) {
            hs.setTen(request.getTen());
        }
        if (StringUtils.hasText(request.getEmail())) {
            hs.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getSdt())) {
            hs.setSdt(request.getSdt());
        }
        if (request.getGioiTinh() != null) {
            hs.setGioiTinh(request.getGioiTinh());
        }
        if (StringUtils.hasText(request.getDiaChi())) {
            hs.setDiaChi(request.getDiaChi());
        }
        if (request.getNgaySinh() != null) {
            hs.setNgaySinh(request.getNgaySinh());
        }
        if (request.getTrangThaiHoatDong() != null) {
            hs.setTrangThaiHoatDong(request.getTrangThaiHoatDong());
        }

        hs.setThoiGianCapNhat(LocalDateTime.now());
        hocSinhAdminRepository.save(hs);

        return getStudentDetail(studentId);
    }

    // =========================================================
    // 4. THÊM / XOÁ HỌC SINH KHỎI LỚP (DangKyLH)
    // =========================================================

    @Override
    public HocSinhBaiTapResponse addStudentToClass(String studentId, HocSinhBaiTapRequest request) {
        String classId = request.getClassIdToAdd();
        if (!StringUtils.hasText(classId)) {
            throw new IllegalArgumentException("classIdToAdd không được null");
        }

        // load entity
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
    }

    @Override
    public void removeStudentFromClass(String studentId, String classId) {
        List<DangKyLH> regs = dangKyLHAdminRepository
                .findByHocSinh_IdHsAndLopHoc_IdLh(studentId, classId);

        dangKyLHAdminRepository.deleteAll(regs);
    }

    // =========================================================
    // 5. HELPER CHUNG: LẤY DANH SÁCH LỚP
    // =========================================================

    private Set<String> resolveClassIds(String programId, String classId) {
        boolean hasProgram = StringUtils.hasText(programId);
        boolean hasClass = StringUtils.hasText(classId);

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
        if (!hasProgram && !hasClass) {
            // nếu không filter gì, lấy tất cả lớp
            lopHocAdminRepository.findAll()
                    .forEach(l -> classIds.add(l.getIdLh()));
        }
        return classIds;
    }

    // =========================================================
    // 6. TAB BÀI TẬP
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HocSinhBaiTapResponse searchAssignments(HocSinhBaiTapRequest request) {

        Set<String> classIds = resolveClassIds(request.getProgramId(), request.getClassId());
        if (classIds.isEmpty()) {
            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .assignments(Collections.emptyList())
                    .message("Không tìm thấy lớp phù hợp")
                    .build();
        }

        // Buổi học của các lớp
        List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLhIn(classIds);
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

        // Lấy danh sách bài tập thuộc các buổi học đó
        List<BaiTap> allAssignments = baiTapAdminRepository.findByIdBhIn(sessionIds);

        // Optional: lọc theo fromDate/toDate dựa trên NgayBatDau/NgayKetThuc
        LocalDate from = request.getFromDate();
        LocalDate to = request.getToDate();

        List<BaiTap> filteredAssignments = allAssignments.stream()
                .filter(bt -> {
                    if (from == null && to == null) return true;
                    LocalDate start = bt.getNgayBatDau() != null
                            ? bt.getNgayBatDau().toLocalDate()
                            : null;
                    LocalDate end = bt.getNgayKetThuc() != null
                            ? bt.getNgayKetThuc().toLocalDate()
                            : null;

                    // chỉ cần giao nhau với khoảng [from, to]
                    if (from != null && end != null && end.isBefore(from)) return false;
                    if (to != null && start != null && start.isAfter(to)) return false;
                    return true;
                })
                .collect(Collectors.toList());

        // Chuẩn bị map: LopHoc, ChuongTrinh, số HS trong lớp, BaiNop theo ID_BT
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

        // Số HS mỗi lớp từ DangKyLH
        List<DangKyLH> regs = dangKyLHAdminRepository.findByLopHoc_IdLhIn(allClassIds);
        Map<String, Long> studentCountByClassId = regs.stream()
                .collect(Collectors.groupingBy(reg -> reg.getLopHoc().getIdLh(), Collectors.counting()));

        // Submissions cho các bài tập
        List<String> assignmentIds = filteredAssignments.stream()
                .map(BaiTap::getIdBt)
                .collect(Collectors.toList());

        Map<String, List<BaiNop>> submissionsByAssignment;
        if (assignmentIds.isEmpty()) {
            submissionsByAssignment = Collections.emptyMap();
        } else {
            List<BaiNop> allSubs = baiNopAdminRepository.findByIdBtIn(assignmentIds);
            submissionsByAssignment = allSubs.stream()
                    .collect(Collectors.groupingBy(BaiNop::getIdBt));
        }

// tạo 1 biến final để dùng trong lambda
        final Map<String, List<BaiNop>> submissionsMap = submissionsByAssignment;

// Build DTO
        List<HocSinhBaiTapResponse.AssignmentSummary> dtoList = filteredAssignments.stream()
                .map(bt -> {
                    BuoiHocChiTiet session = sessionMap.get(bt.getIdBh());
                    String idLh = (session != null ? session.getIdLh() : null);
                    LopHoc lop = idLh != null ? lopHocMap.get(idLh) : null;
                    ChuongTrinh ct = (lop != null && lop.getIdCt() != null)
                            ? ctMap.get(lop.getIdCt())
                            : null;

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
                            avgScore = sum.divide(BigDecimal.valueOf(scores.size()), BigDecimal.ROUND_HALF_UP);
                        }
                    }

                    return HocSinhBaiTapResponse.AssignmentSummary.builder()
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
    }

    // =========================================================
    // 7. TAB BÀI NỘP & CHẤM ĐIỂM
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HocSinhBaiTapResponse searchSubmissions(HocSinhBaiTapRequest request) {

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
            List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLhIn(classIds);
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

        List<BaiNop> baiNops = baiNopAdminRepository.findByIdBtIn(assignmentIds);

        if (baiNops.isEmpty()) {
            return HocSinhBaiTapResponse.builder()
                    .success(true)
                    .submissions(Collections.emptyList())
                    .message("Chưa có bài nộp")
                    .build();
        }

        // Lấy thông tin học sinh cho các bài nộp
        Set<String> studentIds = baiNops.stream()
                .map(BaiNop::getIdHs)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, HocSinh> studentMap = hocSinhAdminRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(HocSinh::getIdHs, h -> h));

        List<HocSinhBaiTapResponse.SubmissionSummary> dtoList = baiNops.stream()
                .map(bn -> {
                    HocSinh hs = studentMap.get(bn.getIdHs());
                    BaiTap bt = assignmentMap.get(bn.getIdBt());
                    String fullName = hs != null
                            ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                            : null;
                    return HocSinhBaiTapResponse.SubmissionSummary.builder()
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
    }

    // =========================================================
    // 8. TAB ĐÁNH GIÁ & KẾT QUẢ
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HocSinhBaiTapResponse getClassEvaluationAndResult(HocSinhBaiTapRequest request) {
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

        // Buổi học của lớp
        List<BuoiHocChiTiet> sessions = buoiHocChiTietAdminRepository.findByIdLhIn(Collections.singleton(classId));
        Map<String, BuoiHocChiTiet> sessionMap = sessions.stream()
                .collect(Collectors.toMap(BuoiHocChiTiet::getIdBh, s -> s));

        List<String> sessionIds = new ArrayList<>(sessionMap.keySet());

        // --------- Đánh giá buổi học ----------
        List<HocSinhBaiTapResponse.LessonEvaluation> lessonDtos = Collections.emptyList();
        if (!sessionIds.isEmpty()) {
            List<DanhGiaBuoiHoc> dgBuoiList = danhGiaBuoiHocAdminRepository.findByIdBhIn(sessionIds);
            lessonDtos = dgBuoiList.stream()
                    .map(dg -> {
                        BuoiHocChiTiet bh = sessionMap.get(dg.getIdBh());
                        HocSinh hs = studentMap.get(dg.getIdHs());
                        String fullName = hs != null
                                ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                                : null;
                        return HocSinhBaiTapResponse.LessonEvaluation.builder()
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
        List<HocSinhBaiTapResponse.ClassEvaluation> classEvalDtos = dgLopList.stream()
                .map(dg -> {
                    HocSinh hs = studentMap.get(dg.getIdHs());
                    String fullName = hs != null
                            ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                            : null;
                    return HocSinhBaiTapResponse.ClassEvaluation.builder()
                            .idDglh(dg.getIdDglh())
                            .idLh(dg.getIdLh())
                            .idHs(dg.getIdHs())
                            .tenHs(fullName)
                            .diemDanhGia(dg.getDiemDanhGia())
                            .nhanXet(dg.getNhanXet())
                            .thoiDiemDanhGia(dg.getThoiDiemDanhGia())
                            .build();
                })
                .collect(Collectors.toList());

        // --------- Kết quả & xếp loại ----------
        List<HocSinhBaiTapResponse.ClassResult> resultDtos = Collections.emptyList();
        if (!studentIds.isEmpty()) {
            List<KetQuaHocTap> results = ketQuaHocTapAdminRepository.findByIdHsIn(studentIds);
            resultDtos = results.stream()
                    .map(kq -> {
                        HocSinh hs = studentMap.get(kq.getIdHs());
                        String fullName = hs != null
                                ? buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen())
                                : null;
                        return HocSinhBaiTapResponse.ClassResult.builder()
                                .idHs(kq.getIdHs())
                                .tenHs(fullName)
                                .diemKetQua(kq.getDiemSo())
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
    }
}
