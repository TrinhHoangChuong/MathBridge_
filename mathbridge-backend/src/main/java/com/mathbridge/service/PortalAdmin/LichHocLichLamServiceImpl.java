package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.ClassScheduleAutoGenerateRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.ClassScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.StudentScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.TeacherScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Response.LichHocLichLamResponse.*;
import com.mathbridge.entity.*;
import com.mathbridge.repository.Admin.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LichHocLichLamServiceImpl implements LichHocLichLamService {

    private final LopHocAdminRepository lopHocAdminRepository;
    private final BuoiHocChiTietAdminRepository buoiHocChiTietAdminRepository;
    private final CoSoAdminRepository coSoAdminRepository;
    private final PhongAdminRepository phongAdminRepository;
    private final NhanVienAdminRepository nhanVienAdminRepository;
    private final HocSinhAdminRepository hocSinhAdminRepository;
    private final DangKyLHAdminRepository dangKyLHAdminRepository;
    private final ChuongTrinhAdminRepository chuongTrinhAdminRepository;

    // =========================================================
    // CLASS OPTIONS & DETAIL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ClassOptionResponse> getClassOptions() {
        List<LopHoc> lopList = lopHocAdminRepository.findAll();

        List<ClassOptionResponse> result = new ArrayList<>();

        for (LopHoc lop : lopList) {
            NhanVien gv = lop.getNhanVien();             // ManyToOne trong LopHoc
            ChuongTrinh ct = lop.getChuongTrinh();       // ManyToOne trong LopHoc

            result.add(ClassOptionResponse.builder()
                    .idLh(lop.getIdLh())
                    .tenLop(lop.getTenLop())
                    .loaiNgay(lop.getLoaiNgay())
                    .soBuoi(lop.getSoBuoi())
                    .ngayBatDau(toLocalDate(lop.getNgayBatDau()))
                    .hinhThucHoc(lop.getHinhThucHoc())
                    .idNv(gv != null ? gv.getIdNv() : null)
                    .tenGiangVien(gv != null ? buildFullName(gv.getHo(), gv.getTenDem(), gv.getTen()) : null)
                    .idCt(ct != null ? ct.getIdCt() : null)
                    .tenChuongTrinh(ct != null ? ct.getTenCt() : null)
                    .build());
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ClassDetailResponse getClassDetail(String idLh) {
        LopHoc lop = lopHocAdminRepository.findById(idLh)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp với ID_LH = " + idLh));

        NhanVien gv = lop.getNhanVien();
        ChuongTrinh ct = lop.getChuongTrinh();

        return ClassDetailResponse.builder()
                .idLh(lop.getIdLh())
                .tenLop(lop.getTenLop())
                .loaiNgay(lop.getLoaiNgay())
                .soBuoi(lop.getSoBuoi())
                .ngayBatDau(toLocalDate(lop.getNgayBatDau()))
                .hinhThucHoc(lop.getHinhThucHoc())
                .idNv(gv != null ? gv.getIdNv() : null)
                .tenGiangVien(gv != null ? buildFullName(gv.getHo(), gv.getTenDem(), gv.getTen()) : null)
                .idCt(ct != null ? ct.getIdCt() : null)
                .tenChuongTrinh(ct != null ? ct.getTenCt() : null)
                .build();
    }

    // =========================================================
    // CLASS SCHEDULE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ClassScheduleItemResponse> searchClassSchedule(ClassScheduleSearchRequest request) {
        if (request.getIdLh() == null || request.getIdLh().isBlank()) {
            return Collections.emptyList();
        }

        List<BuoiHocChiTiet> sessions;

        LocalDate from = request.getFromDate();
        LocalDate to = request.getToDate();
        if (from != null && to != null) {
            LocalDateTime fromDt = from.atStartOfDay();
            LocalDateTime toDt = to.atTime(LocalTime.MAX);
            // yêu cầu trong BuoiHocChiTietAdminRepository:
            // List<BuoiHocChiTiet> findByIdLhAndNgayHocBetween(String idLh, LocalDateTime from, LocalDateTime to);
            sessions = buoiHocChiTietAdminRepository
                    .findByIdLhAndNgayHocBetween(request.getIdLh(), fromDt, toDt);
        } else {
            // yêu cầu: List<BuoiHocChiTiet> findByIdLh(String idLh);
            sessions = buoiHocChiTietAdminRepository.findByIdLh(request.getIdLh());
        }

        List<ClassScheduleItemResponse> result = new ArrayList<>();

        for (BuoiHocChiTiet b : sessions) {
            Phong p = b.getPhong();           // ManyToOne trong BuoiHocChiTiet
            CoSo cs = (p != null) ? p.getCoSo() : null;

            result.add(ClassScheduleItemResponse.builder()
                    .idBh(b.getIdBh())
                    .idLh(b.getIdLh())
                    .thuTuBuoiHoc(b.getThuTuBuoiHoc())
                    .ngayHoc(toLocalDate(b.getNgayHoc()))
                    .gioBatDau(b.getGioBatDau())
                    .gioKetThuc(b.getGioKetThuc())
                    .tenCaHoc(b.getTenCaHoc())
                    .idPhong(b.getIdPhong())
                    .tenPhong(p != null ? p.getTenPhong() : null)
                    .tang(p != null ? p.getTang() : null)
                    .idCs(cs != null ? cs.getIdCs() : null)
                    .tenCoSo(cs != null ? cs.getTenCoSo() : null)
                    .noiDung(b.getNoiDung())
                    .ghiChu(b.getGhiChu())
                    .build());
        }

        result.sort(Comparator
                .comparing(ClassScheduleItemResponse::getNgayHoc, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(ClassScheduleItemResponse::getGioBatDau, Comparator.nullsLast(Comparator.naturalOrder())));

        return result;
    }

    @Override
    public AutoGenerateResultResponse autoGenerateSchedule(ClassScheduleAutoGenerateRequest request) {
        if (request.getIdLh() == null || request.getIdLh().isBlank()) {
            throw new IllegalArgumentException("Thiếu ID_LH khi tạo lịch.");
        }
        if (request.getSoBuoi() == null || request.getSoBuoi() <= 0) {
            throw new IllegalArgumentException("Số buổi phải > 0.");
        }
        if (request.getNgayBatDau() == null) {
            throw new IllegalArgumentException("Thiếu NgayBatDau.");
        }
        if (request.getLoaiNgay() == null || request.getLoaiNgay().isBlank()) {
            throw new IllegalArgumentException("Thiếu LoaiNgay.");
        }
        if (request.getGioBatDau() == null || request.getGioKetThuc() == null) {
            throw new IllegalArgumentException("Thiếu giờ bắt đầu / kết thúc.");
        }
        if (request.getIdPhong() == null || request.getIdPhong().isBlank()) {
            throw new IllegalArgumentException("Thiếu ID_Phong.");
        }

        LopHoc lopHoc = lopHocAdminRepository.findById(request.getIdLh())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp với ID_LH = " + request.getIdLh()));

        // giáo viên phụ trách lớp này
        NhanVien teacher = lopHoc.getNhanVien();
        String teacherId = (teacher != null) ? teacher.getIdNv() : null;

        // Parse pattern LoaiNgay -> set DayOfWeek
        Set<DayOfWeek> daysOfWeek = parseLoaiNgayToDays(request.getLoaiNgay());
        if (daysOfWeek.isEmpty()) {
            throw new IllegalArgumentException("LoaiNgay không hợp lệ: " + request.getLoaiNgay());
        }

        // Sinh danh sách ngày học
        List<LocalDate> dates = generateDates(
                request.getNgayBatDau(),
                request.getSoBuoi(),
                daysOfWeek
        );

        LocalTime startTime = parseTime(request.getGioBatDau());
        LocalTime endTime = parseTime(request.getGioKetThuc());
        String idPhong = request.getIdPhong();

        int created = 0;
        int skipped = 0;
        List<ConflictInfo> conflicts = new ArrayList<>();

        // Các buổi đã tồn tại của lớp để tránh trùng thứ tự.
        List<BuoiHocChiTiet> existingBuoi = buoiHocChiTietAdminRepository.findByIdLh(lopHoc.getIdLh());
        Map<String, BuoiHocChiTiet> existingByThuTu = existingBuoi.stream()
                .filter(b -> b.getThuTuBuoiHoc() != null)
                .collect(Collectors.toMap(BuoiHocChiTiet::getThuTuBuoiHoc, b -> b, (a, b) -> a));

        for (int i = 0; i < dates.size(); i++) {
            LocalDate date = dates.get(i);
            LocalDateTime ngayHocDateTime = date.atStartOfDay();
            LocalDateTime gioBd = LocalDateTime.of(date, startTime);
            LocalDateTime gioKt = LocalDateTime.of(date, endTime);

            String thuTu = String.valueOf(i + 1);

            // Đã có buổi cùng thứ tự -> bỏ qua
            if (existingByThuTu.containsKey(thuTu)) {
                skipped++;
                continue;
            }

            // Check conflict phòng (cùng phòng, cùng ngày, trùng giờ)
            // yêu cầu repo: List<BuoiHocChiTiet> findByIdPhongAndNgayHoc(String idPhong, LocalDateTime ngayHoc);
            List<BuoiHocChiTiet> sameRoomSessions =
                    buoiHocChiTietAdminRepository.findByIdPhongAndNgayHoc(idPhong, ngayHocDateTime);

            if (hasTimeConflict(sameRoomSessions, gioBd, gioKt)) {
                conflicts.add(ConflictInfo.builder()
                        .type("ROOM")
                        .message("Trùng lịch phòng " + idPhong + " ngày " + date)
                        .idLh(lopHoc.getIdLh())
                        .idPhong(idPhong)
                        .gioBatDau(gioBd)
                        .gioKetThuc(gioKt)
                        .build());
                skipped++;
                continue;
            }

            // Check conflict giáo viên (nếu có teacherId)
            if (teacherId != null && !teacherId.isBlank()) {
                // yêu cầu repo: List<LopHoc> findByIdNv(String idNv); HOẶC findByNhanVien_IdNv(String idNv);
                List<LopHoc> classesOfTeacher = lopHocAdminRepository.findByIdNv(teacherId);
                List<String> idLhsTeacher = classesOfTeacher.stream()
                        .map(LopHoc::getIdLh)
                        .collect(Collectors.toList());

                if (!idLhsTeacher.isEmpty()) {
                    LocalDateTime from = date.atStartOfDay();
                    LocalDateTime to = date.atTime(LocalTime.MAX);
                    // yêu cầu repo: List<BuoiHocChiTiet> findByIdLhInAndNgayHocBetween(Collection<String> ids, LocalDateTime from, LocalDateTime to);
                    List<BuoiHocChiTiet> teacherSessions =
                            buoiHocChiTietAdminRepository.findByIdLhInAndNgayHocBetween(idLhsTeacher, from, to);

                    if (hasTimeConflict(teacherSessions, gioBd, gioKt)) {
                        conflicts.add(ConflictInfo.builder()
                                .type("TEACHER")
                                .message("Giáo viên " + teacherId + " đã có lịch dạy trong khung giờ này")
                                .idLh(lopHoc.getIdLh())
                                .idNv(teacherId)
                                .gioBatDau(gioBd)
                                .gioKetThuc(gioKt)
                                .build());
                        skipped++;
                        continue;
                    }
                }
            }

            // Tạo buổi học mới
            BuoiHocChiTiet entity = new BuoiHocChiTiet();
            entity.setIdBh(generateBuoiHocId());
            entity.setIdLh(lopHoc.getIdLh());
            entity.setIdPhong(idPhong);
            entity.setTenCaHoc(request.getTenCaHoc());
            entity.setThuTuBuoiHoc(thuTu);
            entity.setNgayHoc(ngayHocDateTime);
            entity.setGioBatDau(gioBd);
            entity.setGioKetThuc(gioKt);
            // NoiDung, GhiChu để null hoặc admin tự chỉnh

            buoiHocChiTietAdminRepository.save(entity);
            created++;
        }

        return AutoGenerateResultResponse.builder()
                .createdCount(created)
                .skippedCount(skipped)
                .conflicts(conflicts)
                .build();
    }

    // =========================================================
    // CAMPUS & ROOM
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<CampusOptionResponse> getCampuses() {
        return coSoAdminRepository.findAll().stream()
                .map(cs -> CampusOptionResponse.builder()
                        .idCs(cs.getIdCs())
                        .tenCoSo(cs.getTenCoSo())
                        .diaChi(cs.getDiaChi2())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomOptionResponse> getRoomsByCampus(String idCs) {
        // yêu cầu repo: List<Phong> findByIdCs(String idCs);
        List<Phong> rooms = phongAdminRepository.findByIdCs(idCs);

        return rooms.stream()
                .map(p -> RoomOptionResponse.builder()
                        .idPhong(p.getIdPhong())
                        .tenPhong(p.getTenPhong())
                        .tang(p.getTang())
                        .loaiPhong(p.getLoaiPhong())
                        .build())
                .collect(Collectors.toList());
    }

    // =========================================================
    // TEACHER VIEW
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<TeacherOptionResponse> getTeacherOptions() {
        return nhanVienAdminRepository.findAll().stream()
                .map(nv -> TeacherOptionResponse.builder()
                        .idNv(nv.getIdNv())
                        .hoTen(buildFullName(nv.getHo(), nv.getTenDem(), nv.getTen()))
                        .email(nv.getEmail())
                        .idCs(nv.getIdCs())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherScheduleItemResponse> searchTeacherSchedule(TeacherScheduleSearchRequest request) {
        if (request.getIdNv() == null || request.getIdNv().isBlank()) {
            return Collections.emptyList();
        }

        // yêu cầu repo: List<LopHoc> findByIdNv(String idNv);
        List<LopHoc> classes = lopHocAdminRepository.findByIdNv(request.getIdNv());
        if (classes.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> idLhs = classes.stream()
                .map(LopHoc::getIdLh)
                .collect(Collectors.toList());

        LocalDate from = request.getFromDate();
        LocalDate to = request.getToDate();

        List<BuoiHocChiTiet> sessions;
        if (from != null && to != null) {
            LocalDateTime fromDt = from.atStartOfDay();
            LocalDateTime toDt = to.atTime(LocalTime.MAX);
            sessions = buoiHocChiTietAdminRepository.findByIdLhInAndNgayHocBetween(idLhs, fromDt, toDt);
        } else {
            sessions = buoiHocChiTietAdminRepository.findByIdLhIn(idLhs);
        }

        Map<String, LopHoc> lopById = classes.stream()
                .collect(Collectors.toMap(LopHoc::getIdLh, l -> l, (a, b) -> a));

        List<TeacherScheduleItemResponse> result = new ArrayList<>();
        for (BuoiHocChiTiet b : sessions) {
            LopHoc lh = lopById.get(b.getIdLh());
            ChuongTrinh ct = (lh != null) ? lh.getChuongTrinh() : null;
            Phong p = b.getPhong();
            CoSo cs = (p != null) ? p.getCoSo() : null;

            result.add(TeacherScheduleItemResponse.builder()
                    .idBh(b.getIdBh())
                    .idLh(b.getIdLh())
                    .ngayHoc(toLocalDate(b.getNgayHoc()))
                    .gioBatDau(b.getGioBatDau())
                    .gioKetThuc(b.getGioKetThuc())
                    .tenLop(lh != null ? lh.getTenLop() : null)
                    .idCt(lh != null ? lh.getIdCt() : null)
                    .tenChuongTrinh(ct != null ? ct.getTenCt() : null)
                    .idPhong(b.getIdPhong())
                    .tenPhong(p != null ? p.getTenPhong() : null)
                    .idCs(cs != null ? cs.getIdCs() : null)
                    .tenCoSo(cs != null ? cs.getTenCoSo() : null)
                    .build());
        }

        result.sort(Comparator
                .comparing(TeacherScheduleItemResponse::getNgayHoc, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(TeacherScheduleItemResponse::getGioBatDau, Comparator.nullsLast(Comparator.naturalOrder())));

        return result;
    }

    // =========================================================
    // STUDENT VIEW
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<StudentOptionResponse> getStudentOptions() {
        return hocSinhAdminRepository.findAll().stream()
                .map(hs -> StudentOptionResponse.builder()
                        .idHs(hs.getIdHs())
                        .hoTen(buildFullName(hs.getHo(), hs.getTenDem(), hs.getTen()))
                        .email(hs.getEmail())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentScheduleItemResponse> searchStudentSchedule(StudentScheduleSearchRequest request) {
        if (request.getIdHs() == null || request.getIdHs().isBlank()) {
            return Collections.emptyList();
        }

        // ==== CHỖ NÀY CHỈNH CHO KHỚP ENTITY DangKyLH ====
        // DangKyLH dùng @EmbeddedId + ManyToOne tới HocSinh, LopHoc
        // ==> repo cần method: List<DangKyLH> findByHocSinh_IdHs(String idHs);
        List<DangKyLH> enrollments = dangKyLHAdminRepository.findByHocSinh_IdHs(request.getIdHs());
        if (enrollments.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy danh sách lớp mà HS này đăng ký từ quan hệ lopHoc
        List<LopHoc> enrolledClasses = enrollments.stream()
                .map(DangKyLH::getLopHoc)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        if (enrolledClasses.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> idLhs = enrolledClasses.stream()
                .map(LopHoc::getIdLh)
                .collect(Collectors.toList());

        LocalDate from = request.getFromDate();
        LocalDate to = request.getToDate();

        List<BuoiHocChiTiet> sessions;
        if (from != null && to != null) {
            LocalDateTime fromDt = from.atStartOfDay();
            LocalDateTime toDt = to.atTime(LocalTime.MAX);
            sessions = buoiHocChiTietAdminRepository.findByIdLhInAndNgayHocBetween(idLhs, fromDt, toDt);
        } else {
            sessions = buoiHocChiTietAdminRepository.findByIdLhIn(idLhs);
        }

        Map<String, LopHoc> lopById = enrolledClasses.stream()
                .collect(Collectors.toMap(LopHoc::getIdLh, l -> l, (a, b) -> a));

        List<StudentScheduleItemResponse> result = new ArrayList<>();
        for (BuoiHocChiTiet b : sessions) {
            LopHoc lh = lopById.get(b.getIdLh());
            ChuongTrinh ct = (lh != null) ? lh.getChuongTrinh() : null;
            Phong p = b.getPhong();
            CoSo cs = (p != null) ? p.getCoSo() : null;

            result.add(StudentScheduleItemResponse.builder()
                    .idBh(b.getIdBh())
                    .idLh(b.getIdLh())
                    .ngayHoc(toLocalDate(b.getNgayHoc()))
                    .gioBatDau(b.getGioBatDau())
                    .gioKetThuc(b.getGioKetThuc())
                    .tenLop(lh != null ? lh.getTenLop() : null)
                    .idCt(lh != null ? lh.getIdCt() : null)
                    .tenChuongTrinh(ct != null ? ct.getTenCt() : null)
                    .idPhong(b.getIdPhong())
                    .tenPhong(p != null ? p.getTenPhong() : null)
                    .idCs(cs != null ? cs.getIdCs() : null)
                    .tenCoSo(cs != null ? cs.getTenCoSo() : null)
                    .build());
        }

        result.sort(Comparator
                .comparing(StudentScheduleItemResponse::getNgayHoc, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(StudentScheduleItemResponse::getGioBatDau, Comparator.nullsLast(Comparator.naturalOrder())));

        return result;
    }

    // =========================================================
    // HELPER
    // =========================================================

    private String buildFullName(String ho, String tenDem, String ten) {
        StringBuilder sb = new StringBuilder();
        if (ho != null && !ho.isBlank()) sb.append(ho.trim()).append(" ");
        if (tenDem != null && !tenDem.isBlank()) sb.append(tenDem.trim()).append(" ");
        if (ten != null && !ten.isBlank()) sb.append(ten.trim());
        return sb.toString().trim();
    }

    private LocalDate toLocalDate(LocalDateTime dateTime) {
        return (dateTime != null) ? dateTime.toLocalDate() : null;
    }

    private Set<DayOfWeek> parseLoaiNgayToDays(String loaiNgay) {
        Set<DayOfWeek> result = new LinkedHashSet<>();
        if (loaiNgay == null) return result;

        // chấp nhận format kiểu "2-4-6", "3,5,7", "Th2-Th4-Th6"
        String normalized = loaiNgay.replace("Th", "").replace(" ", "");
        String[] parts = normalized.split("[-,/]+");
        for (String p : parts) {
            if (p.isBlank()) continue;
            try {
                int val = Integer.parseInt(p);
                // 2..8 -> Thứ 2 .. CN (8 coi như CN)
                if (val >= 2 && val <= 8) {
                    DayOfWeek dow = (val == 8) ? DayOfWeek.SUNDAY : DayOfWeek.of(val - 1);
                    result.add(dow);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return result;
    }

    private List<LocalDate> generateDates(LocalDate start, int soBuoi, Set<DayOfWeek> days) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = start;
        while (dates.size() < soBuoi) {
            if (days.contains(current.getDayOfWeek())) {
                dates.add(current);
            }
            current = current.plusDays(1);
        }
        return dates;
    }

    private LocalTime parseTime(String time) {
        // FE gửi dạng "HH:mm"
        return LocalTime.parse(time);
    }

    private boolean hasTimeConflict(List<BuoiHocChiTiet> list,
                                    LocalDateTime newStart,
                                    LocalDateTime newEnd) {
        for (BuoiHocChiTiet existing : list) {
            LocalDateTime s = existing.getGioBatDau();
            LocalDateTime e = existing.getGioKetThuc();
            if (s == null || e == null) continue;

            // overlap nếu (s < newEnd) && (e > newStart)
            if (s.isBefore(newEnd) && e.isAfter(newStart)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Sinh ID_BH mới (nvarchar(10)).
     * Bạn có thể thay bằng generator chung của project nếu có.
     */
    private String generateBuoiHocId() {
        String uuid = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        // "BH" + 8 ký tự
        return "BH" + uuid.substring(0, 8);
    }


    @Override
    public AutoGenerateResultResponse updateSession(LichHocLichLamRequest.UpdateSessionRequest request) {
        if (request.getIdBh() == null || request.getIdBh().isBlank()) {
            throw new IllegalArgumentException("Thiếu ID_BH khi cập nhật buổi học.");
        }

        BuoiHocChiTiet session = buoiHocChiTietAdminRepository.findById(request.getIdBh())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy buổi học với ID_BH = " + request.getIdBh()));

        // Lấy lớp & giáo viên từ buổi học
        LopHoc lopHoc = lopHocAdminRepository.findById(session.getIdLh())
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy lớp cho buổi học này"));
        NhanVien teacher = lopHoc.getNhanVien();
        String teacherId = (teacher != null) ? teacher.getIdNv() : null;

        // Parse dữ liệu mới
        String idPhongMoi = (request.getIdPhong() != null && !request.getIdPhong().isBlank())
                ? request.getIdPhong()
                : session.getIdPhong(); // nếu FE không gửi thì giữ nguyên

        LocalDate ngayHocMoi = (request.getNgayHoc() != null)
                ? request.getNgayHoc()
                : toLocalDate(session.getNgayHoc());

        if (ngayHocMoi == null) {
            throw new IllegalArgumentException("Ngày học không hợp lệ.");
        }

        LocalTime gioBdMoi = (request.getGioBatDau() != null && !request.getGioBatDau().isBlank())
                ? parseTime(request.getGioBatDau())
                : session.getGioBatDau().toLocalTime();

        LocalTime gioKtMoi = (request.getGioKetThuc() != null && !request.getGioKetThuc().isBlank())
                ? parseTime(request.getGioKetThuc())
                : session.getGioKetThuc().toLocalTime();

        LocalDateTime gioBdNew = LocalDateTime.of(ngayHocMoi, gioBdMoi);
        LocalDateTime gioKtNew = LocalDateTime.of(ngayHocMoi, gioKtMoi);
        LocalDateTime ngayHocNewDateTime = ngayHocMoi.atStartOfDay();

        List<ConflictInfo> conflicts = new ArrayList<>();
        int skipped = 0;
        int updated = 0;

        // ==== Check conflict phòng (trừ chính buổi này ra) ====
        List<BuoiHocChiTiet> sameRoomSessions =
                buoiHocChiTietAdminRepository.findByIdPhongAndNgayHoc(idPhongMoi, ngayHocNewDateTime);

        List<BuoiHocChiTiet> othersInRoom = sameRoomSessions.stream()
                .filter(b -> !b.getIdBh().equals(session.getIdBh()))
                .collect(Collectors.toList());

        if (hasTimeConflict(othersInRoom, gioBdNew, gioKtNew)) {
            conflicts.add(ConflictInfo.builder()
                    .type("ROOM")
                    .message("Trùng lịch phòng " + idPhongMoi + " ngày " + ngayHocMoi)
                    .idLh(lopHoc.getIdLh())
                    .idPhong(idPhongMoi)
                    .gioBatDau(gioBdNew)
                    .gioKetThuc(gioKtNew)
                    .build());
            skipped++;
        } else {
            // ==== Check conflict giáo viên (trừ chính buổi này) ====
            if (teacherId != null && !teacherId.isBlank()) {
                List<LopHoc> classesOfTeacher = lopHocAdminRepository.findByIdNv(teacherId);
                List<String> idLhsTeacher = classesOfTeacher.stream()
                        .map(LopHoc::getIdLh)
                        .collect(Collectors.toList());

                if (!idLhsTeacher.isEmpty()) {
                    LocalDateTime from = ngayHocMoi.atStartOfDay();
                    LocalDateTime to = ngayHocMoi.atTime(LocalTime.MAX);
                    List<BuoiHocChiTiet> teacherSessions =
                            buoiHocChiTietAdminRepository.findByIdLhInAndNgayHocBetween(idLhsTeacher, from, to);

                    List<BuoiHocChiTiet> otherTeacherSessions = teacherSessions.stream()
                            .filter(b -> !b.getIdBh().equals(session.getIdBh()))
                            .collect(Collectors.toList());

                    if (hasTimeConflict(otherTeacherSessions, gioBdNew, gioKtNew)) {
                        conflicts.add(ConflictInfo.builder()
                                .type("TEACHER")
                                .message("Giáo viên " + teacherId + " đã có lịch dạy trong khung giờ này")
                                .idLh(lopHoc.getIdLh())
                                .idNv(teacherId)
                                .gioBatDau(gioBdNew)
                                .gioKetThuc(gioKtNew)
                                .build());
                        skipped++;
                    }
                }
            }
        }

        // Nếu không conflict -> update
        if (conflicts.isEmpty()) {
            session.setIdPhong(idPhongMoi);
            session.setNgayHoc(ngayHocNewDateTime);
            session.setGioBatDau(gioBdNew);
            session.setGioKetThuc(gioKtNew);

            if (request.getTenCaHoc() != null) {
                session.setTenCaHoc(request.getTenCaHoc());
            }
            if (request.getNoiDung() != null) {
                session.setNoiDung(request.getNoiDung());
            }
            if (request.getGhiChu() != null) {
                session.setGhiChu(request.getGhiChu());
            }

            buoiHocChiTietAdminRepository.save(session);
            updated = 1;
        }

        return AutoGenerateResultResponse.builder()
                .createdCount(updated)     // 1 nếu update thành công, 0 nếu bị conflict
                .skippedCount(skipped)
                .conflicts(conflicts)
                .build();
    }

}
