package com.mathbridge.service.PortalStudent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mathbridge.dto.AssignmentQuestionDTO;
import com.mathbridge.dto.PortalStudentDTO.*;
import com.mathbridge.dto.PortalStudentDTO.UpdateStudentProfileDTO;
import com.mathbridge.dto.PortalStudentDTO.RateSessionDTO;
import com.mathbridge.dto.PortalStudentDTO.RateClassDTO;
import com.mathbridge.entity.*;
import com.mathbridge.repository.*;
import com.mathbridge.repository.StudentRepo.*;
import com.mathbridge.repository.StudentRepo.DanhGiaLopHocStudentRepository;
import com.mathbridge.repository.StudentRepo.DanhGiaBuoiHocStudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private HocSinhRepository hocSinhRepository;
    
    @Autowired
    private DangKyLHStudentRepository dangKyLHStudentRepository;
    
    @Autowired
    private BaiTapStudentRepository baiTapStudentRepository;
    
    @Autowired
    private BaiNopStudentRepository baiNopStudentRepository;
    
    @Autowired
    private KetQuaHocTapStudentRepository ketQuaHocTapStudentRepository;
    
    @Autowired
    private BuoiHocChiTietStudentRepository buoiHocChiTietStudentRepository;
    
    @Autowired
    private YeuCauHoTroStudentRepository yeuCauHoTroStudentRepository;
    
    @Autowired
    private LopHocRepository lopHocRepository;
    
    @Autowired
    private DanhGiaLopHocStudentRepository danhGiaLopHocStudentRepository;
    
    @Autowired
    private DanhGiaBuoiHocStudentRepository danhGiaBuoiHocStudentRepository;
    
    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final String DEFAULT_ASSIGNMENT_WARNING = String.join("\n",
            "⚠️ Lưu ý:",
            "Thời gian sẽ bắt đầu tính ngay khi bạn vào bài.",
            "Hết giờ hệ thống tự động nộp bài.",
            "Thoát trang hoặc tắt máy → đồng hồ vẫn chạy.",
            "Vui lòng kiểm tra kết nối Internet.");
    private static final int DEFAULT_DURATION_HOMEWORK = 60;
    private static final int DEFAULT_DURATION_QUIZ_15 = 15;
    private static final int DEFAULT_DURATION_QUIZ_45 = 45;
    private static final int DEFAULT_DURATION_FINAL = 90;

    @Transactional(readOnly = true)
    public StudentDashboardDTO getStudentDashboard(String userId) {
        // Find student by account ID
        Optional<HocSinh> studentOpt = hocSinhRepository.findFirstByTaiKhoan_IdTk(userId);

        if (!studentOpt.isPresent()) {
            throw new RuntimeException("Student not found");
        }

        HocSinh student = studentOpt.get();
        String studentId = student.getIdHs();

        // Build full name
        String fullName = student.getHo() + " " + (student.getTenDem() != null ? student.getTenDem() + " " : "") + student.getTen();

        // Create dashboard DTO
        StudentDashboardDTO dashboard = new StudentDashboardDTO();
        dashboard.setStudentId(studentId);
        dashboard.setFullName(fullName.trim());
        dashboard.setEmail(student.getEmail());
        dashboard.setPhone(student.getSdt());
        dashboard.setAddress(student.getDiaChi());
        dashboard.setGender(student.getGioiTinh());

        // Get real data from database
        dashboard.setClasses(getStudentClasses(studentId));
        dashboard.setAssignments(getStudentAssignments(studentId));
        dashboard.setGrades(getStudentGrades(studentId));
        dashboard.setMessages(getStudentMessages(studentId)); // Still mock for now, need TinNhan entity
        dashboard.setRegistrations(getStudentRegistrations(studentId));
        dashboard.setAttendedClasses(getStudentAttendedClasses(studentId));
        dashboard.setSupportRequests(getSupportRequests(studentId));
        
        // Calculate stats from real data
        dashboard.setStats(calculateStats(dashboard));

        return dashboard;
    }

    @Transactional(readOnly = true)
    public StudentAssignmentDetailDTO getAssignmentDetail(String userId, String assignmentId) {
        HocSinh student = getHocSinhByUserId(userId);
        BaiTap assignment = getAssignmentById(assignmentId);
        ensureStudentInAssignment(student, assignment);

        List<AssignmentQuestionDTO> questions = loadQuestions(assignment);
        int duration = resolveDurationMinutes(assignment);

        Optional<BaiNop> submissionOpt = baiNopStudentRepository
                .findTopByBaiTap_IdBtAndHocSinh_IdHsOrderByIdBnDesc(assignmentId, student.getIdHs());
        BaiNop submission = submissionOpt
                .map(bn -> autoFinalizeIfExpired(assignment, bn, duration))
                .orElse(null);

        return buildAssignmentDetail(assignment, submission, questions, duration);
    }

    @Transactional
    public StudentAssignmentDetailDTO startAssignment(String userId, String assignmentId) {
        HocSinh student = getHocSinhByUserId(userId);
        BaiTap assignment = getAssignmentById(assignmentId);
        ensureAssignmentWindowIsOpen(assignment);
        ensureStudentInAssignment(student, assignment);

        List<AssignmentQuestionDTO> questions = loadQuestions(assignment);
        if (questions.isEmpty()) {
            throw new RuntimeException("Bài tập chưa có nội dung câu hỏi. Vui lòng liên hệ giáo viên.");
        }

        int duration = resolveDurationMinutes(assignment);

        Optional<BaiNop> submissionOpt = baiNopStudentRepository
                .findTopByBaiTap_IdBtAndHocSinh_IdHsOrderByIdBnDesc(assignmentId, student.getIdHs());
        BaiNop submission = ensureSubmissionForStart(assignment, student, submissionOpt.orElse(null),
                questions, duration);

        return buildAssignmentDetail(assignment, submission, questions, duration);
    }

    @Transactional
    public StudentAssignmentDetailDTO submitAssignment(String userId,
                                                       String assignmentId,
                                                       StudentAssignmentSubmissionDTO submissionDTO) {
        if (submissionDTO == null || submissionDTO.getSubmissionId() == null) {
            throw new RuntimeException("Thiếu mã bài nộp để gửi kết quả.");
        }

        HocSinh student = getHocSinhByUserId(userId);
        BaiTap assignment = getAssignmentById(assignmentId);
        // Check if assignment window is still open before allowing submission
        ensureAssignmentWindowIsOpen(assignment);
        ensureStudentInAssignment(student, assignment);

        List<AssignmentQuestionDTO> questions = loadQuestions(assignment);
        if (questions.isEmpty()) {
            throw new RuntimeException("Bài tập chưa có nội dung để nộp.");
        }

        BaiNop submission = baiNopStudentRepository.findFirstByIdBnAndHocSinh_IdHs(
                submissionDTO.getSubmissionId(), student.getIdHs())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên làm bài hợp lệ."));

        int duration = resolveDurationMinutes(assignment);
        submission = finalizeSubmission(submission, submissionDTO, questions, duration,
                resolveAutoSubmit(assignment));

        return buildAssignmentDetail(assignment, submission, questions, duration);
    }

    private List<StudentClassDTO> getStudentClasses(String studentId) {
        List<DangKyLH> registrations = dangKyLHStudentRepository.findByHocSinhId(studentId);
        List<StudentClassDTO> classes = new ArrayList<>();
        
        for (DangKyLH dk : registrations) {
            LopHoc lopHoc = dk.getLopHoc();
            if (lopHoc == null) continue;
            
            StudentClassDTO classDTO = new StudentClassDTO();
            classDTO.setClassId(lopHoc.getIdLh());
            classDTO.setClassName(lopHoc.getTenLop());
            
            // Get teacher name from database
            if (lopHoc.getNhanVien() != null) {
                NhanVien nv = lopHoc.getNhanVien();
                String teacherName = nv.getHo() + " " + 
                    (nv.getTenDem() != null ? nv.getTenDem() + " " : "") + nv.getTen();
                classDTO.setTeacherName(teacherName.trim());
            } else {
                classDTO.setTeacherName("Chưa có giáo viên");
            }
            
            // Build schedule from actual BuoiHocChiTiet data
            List<BuoiHocChiTiet> sessions = buoiHocChiTietStudentRepository.findByLopHoc_IdLh(lopHoc.getIdLh());
            String schedule = buildScheduleFromSessions(sessions, lopHoc);
            classDTO.setSchedule(schedule);
            
            // Get room from BuoiHocChiTiet - prioritize upcoming sessions, then most recent
            String roomName = getRoomFromSessions(sessions);
            classDTO.setRoom(roomName);
            
            // Count students in class from database
            long studentCount = dangKyLHStudentRepository.countByLopHocId(lopHoc.getIdLh());
            classDTO.setStudentCount((int) studentCount);
            
            // Calculate average grade for this class from BaiNop (real data)
            double avgGrade = calculateAverageGradeForClass(studentId, lopHoc.getIdLh());
            classDTO.setAverageGrade(avgGrade);
            
            // Calculate attendance percentage from real data
            int attendancePercentage = calculateAttendancePercentage(studentId, lopHoc.getIdLh(), sessions);
            classDTO.setAttendancePercentage(attendancePercentage);
            
            // Set status from LopHoc (DangKyLH currently has no status column)
            classDTO.setStatus(lopHoc.getTrangThai() != null ? lopHoc.getTrangThai() : "active");
            
            classes.add(classDTO);
        }
        
        return classes;
    }
    
    private String buildScheduleFromSessions(List<BuoiHocChiTiet> sessions, LopHoc lopHoc) {
        if (sessions == null || sessions.isEmpty()) {
            // Fallback to LoaiNgay and SoBuoi if no sessions
            return lopHoc.getLoaiNgay() + " (" + lopHoc.getSoBuoi() + " buổi)";
        }
        
        // Build schedule from actual session times
        
        // Group sessions by day of week and time
        Map<String, List<String>> scheduleMap = new HashMap<>();
        
        for (BuoiHocChiTiet session : sessions) {
            if (session.getNgayHoc() != null && session.getGioBatDau() != null && session.getGioKetThuc() != null) {
                String dayOfWeek = getDayOfWeekVietnamese(session.getNgayHoc().getDayOfWeek());
                String timeRange = formatTimeRange(session.getGioBatDau().toLocalTime(), 
                                                  session.getGioKetThuc().toLocalTime());
                
                if (!scheduleMap.containsKey(dayOfWeek)) {
                    scheduleMap.put(dayOfWeek, new ArrayList<>());
                }
                if (!scheduleMap.get(dayOfWeek).contains(timeRange)) {
                    scheduleMap.get(dayOfWeek).add(timeRange);
                }
            }
        }
        
        if (scheduleMap.isEmpty()) {
            // Fallback
            return lopHoc.getLoaiNgay() + " (" + lopHoc.getSoBuoi() + " buổi)";
        }
        
        // Build schedule string
        List<String> scheduleParts = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : scheduleMap.entrySet()) {
            String day = entry.getKey();
            String times = String.join(", ", entry.getValue());
            scheduleParts.add(day + " (" + times + ")");
        }
        
        return String.join(" • ", scheduleParts);
    }
    
    private String getDayOfWeekVietnamese(java.time.DayOfWeek dayOfWeek) {
        Map<java.time.DayOfWeek, String> dayMap = new HashMap<>();
        dayMap.put(java.time.DayOfWeek.MONDAY, "Thứ 2");
        dayMap.put(java.time.DayOfWeek.TUESDAY, "Thứ 3");
        dayMap.put(java.time.DayOfWeek.WEDNESDAY, "Thứ 4");
        dayMap.put(java.time.DayOfWeek.THURSDAY, "Thứ 5");
        dayMap.put(java.time.DayOfWeek.FRIDAY, "Thứ 6");
        dayMap.put(java.time.DayOfWeek.SATURDAY, "Thứ 7");
        dayMap.put(java.time.DayOfWeek.SUNDAY, "Chủ nhật");
        return dayMap.getOrDefault(dayOfWeek, dayOfWeek.toString());
    }
    
    private String formatTimeRange(java.time.LocalTime start, java.time.LocalTime end) {
        return String.format("%02d:%02d-%02d:%02d", start.getHour(), start.getMinute(), 
                            end.getHour(), end.getMinute());
    }
    
    /**
     * Get room name from BuoiHocChiTiet sessions for a class
     * Priority: 1) Upcoming sessions, 2) Most recent past session, 3) First session
     */
    private String getRoomFromSessions(List<BuoiHocChiTiet> sessions) {
        if (sessions == null || sessions.isEmpty()) {
            return "N/A";
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // First, try to find an upcoming session (future session)
        for (BuoiHocChiTiet session : sessions) {
            if (session.getNgayHoc() != null && session.getNgayHoc().isAfter(now)) {
                if (session.getPhong() != null && session.getPhong().getTenPhong() != null) {
                    return session.getPhong().getTenPhong();
                }
            }
        }
        
        // If no upcoming session, get the most recent past session
        BuoiHocChiTiet mostRecent = null;
        for (BuoiHocChiTiet session : sessions) {
            if (session.getNgayHoc() != null && session.getNgayHoc().isBefore(now)) {
                if (mostRecent == null || session.getNgayHoc().isAfter(mostRecent.getNgayHoc())) {
                    mostRecent = session;
                }
            }
        }
        
        if (mostRecent != null && mostRecent.getPhong() != null && 
            mostRecent.getPhong().getTenPhong() != null) {
            return mostRecent.getPhong().getTenPhong();
        }
        
        // Fallback: get from first session with room
        for (BuoiHocChiTiet session : sessions) {
            if (session.getPhong() != null && session.getPhong().getTenPhong() != null) {
                return session.getPhong().getTenPhong();
            }
        }
        
        return "N/A";
    }

    private List<StudentAssignmentDTO> getStudentAssignments(String studentId) {
        List<BaiTap> baiTaps = baiTapStudentRepository.findByHocSinhId(studentId);
        List<StudentAssignmentDTO> assignments = new ArrayList<>();
        
        for (BaiTap baiTap : baiTaps) {
            StudentAssignmentDTO assignmentDTO = new StudentAssignmentDTO();
            assignmentDTO.setAssignmentId(baiTap.getIdBt());
            assignmentDTO.setTitle(baiTap.getTieuDe());
            assignmentDTO.setDescription(baiTap.getMoTa());
            
            if (baiTap.getBuoiHocChiTiet() != null && 
                baiTap.getBuoiHocChiTiet().getLopHoc() != null) {
                assignmentDTO.setClassName(baiTap.getBuoiHocChiTiet().getLopHoc().getTenLop());
            }
            
            if (baiTap.getNgayKetThuc() != null) {
                assignmentDTO.setDueDate(baiTap.getNgayKetThuc().format(DATE_TIME_FORMATTER));
            }

            int durationMinutes = resolveDurationMinutes(baiTap);
            assignmentDTO.setDurationMinutes(durationMinutes);
            assignmentDTO.setAutoSubmit(resolveAutoSubmit(baiTap));
            assignmentDTO.setWarningMessage(resolveWarningMessage(baiTap));
            assignmentDTO.setRequiresManualReview(hasEssayQuestion(baiTap));
            boolean allowRetry = Boolean.TRUE.equals(baiTap.getChoPhepLamBai());
            assignmentDTO.setAllowRetry(allowRetry);
            long attemptCount = baiNopStudentRepository.countByBaiTap_IdBtAndHocSinh_IdHs(
                baiTap.getIdBt(), studentId);
            assignmentDTO.setAttemptCount((int) attemptCount);
            
        Optional<BaiNop> baiNopOpt = baiNopStudentRepository
                .findTopByBaiTap_IdBtAndHocSinh_IdHsOrderByIdBnDesc(baiTap.getIdBt(), studentId);

            BaiNop submission = baiNopOpt
                    .map(bn -> autoFinalizeIfExpired(baiTap, bn, durationMinutes))
                    .orElse(null);

            applySubmissionToAssignmentDTO(assignmentDTO, submission, baiTap, durationMinutes);
            assignmentDTO.setCanRetry(canRetryAssignment(allowRetry, submission, baiTap));
            assignments.add(assignmentDTO);
        }
        
        return assignments;
    }

    private List<StudentGradeDTO> getStudentGrades(String studentId) {
        // Get grades from BaiNop (assignment grades)
        List<BaiNop> baiNops = baiNopStudentRepository.findAllByHocSinhId(studentId);
        List<StudentGradeDTO> grades = new ArrayList<>();
        
        for (BaiNop baiNop : baiNops) {
            if (baiNop.getDiemSo() == null) continue; // Skip if not graded
            
            StudentGradeDTO gradeDTO = new StudentGradeDTO();
            gradeDTO.setGradeId(baiNop.getIdBn());
            gradeDTO.setScore(baiNop.getDiemSo().doubleValue());
            gradeDTO.setFeedback(baiNop.getNhanXet());
            
            if (baiNop.getBaiTap() != null) {
                gradeDTO.setGradeType("Bài tập");
                gradeDTO.setSubject("Toán học"); // Default, can be enhanced
                
                if (baiNop.getBaiTap().getBuoiHocChiTiet() != null &&
                    baiNop.getBaiTap().getBuoiHocChiTiet().getLopHoc() != null) {
                    gradeDTO.setClassName(baiNop.getBaiTap().getBuoiHocChiTiet().getLopHoc().getTenLop());
                }
            }
            
            grades.add(gradeDTO);
        }
        
        // Also get grades from KetQuaHocTap
        List<KetQuaHocTap> ketQuaHocTaps = ketQuaHocTapStudentRepository.findByHocSinh_IdHs(studentId);
        for (KetQuaHocTap kq : ketQuaHocTaps) {
            StudentGradeDTO gradeDTO = new StudentGradeDTO();
            gradeDTO.setGradeId(kq.getIdKq());
            gradeDTO.setScore(calculateKetQuaScore(String.valueOf(kq.getDiemTongKet())));
            gradeDTO.setGradeType("Kết quả học tập");
            gradeDTO.setSubject("Toán học");
            gradeDTO.setFeedback(kq.getXepLoai());
            grades.add(gradeDTO);
        }
        
        return grades;
    }

    private void applySubmissionToAssignmentDTO(StudentAssignmentDTO dto, BaiNop submission,
                                               BaiTap assignment, int durationMinutes) {
        if (submission == null) {
            if (assignment.getNgayKetThuc() != null &&
                assignment.getNgayKetThuc().isBefore(LocalDateTime.now())) {
                dto.setStatus("overdue");
            } else {
                dto.setStatus("pending");
            }
            return;
        }

        dto.setSubmissionId(submission.getIdBn());
        dto.setStartedAt(formatDateTime(submission.getThoiGianBatDau()));
        dto.setSubmittedAt(formatDateTime(submission.getThoiGianNop()));
        dto.setGradedAt(formatDateTime(submission.getThoiGianNop()));
        dto.setGrade(submission.getDiemSo() != null ? submission.getDiemSo().doubleValue() : null);
        dto.setFeedback(submission.getNhanXet());
        dto.setExpiresAt(formatDateTime(calculateExpiresAt(submission, durationMinutes, assignment)));
        dto.setStatus(mapSubmissionStatus(submission));
    }

    private String mapSubmissionStatus(BaiNop submission) {
        String status = submission.getTrangThai() != null ? submission.getTrangThai().toUpperCase() : "";
        switch (status) {
            case "IN_PROGRESS":
                return "in_progress";
            case "GRADED_AUTO":
            case "DA_CHAM":
                return "graded";
            case "WAITING_REVIEW":
            case "SUBMITTED":
            case "AUTO_SUBMITTED":
                return "submitted";
            default:
                return status.isEmpty() ? "submitted" : status.toLowerCase();
        }
    }

    private LocalDateTime calculateExpiresAt(BaiNop submission, int durationMinutes, BaiTap assignment) {
        if (submission != null && submission.getThoiGianBatDau() != null) {
            return submission.getThoiGianBatDau().plusMinutes(durationMinutes);
        }
        return assignment.getNgayKetThuc();
    }

    private boolean canRetryAssignment(boolean allowRetry, BaiNop submission, BaiTap assignment) {
        if (!allowRetry) {
            return false;
        }
        boolean withinWindow = assignment.getNgayKetThuc() == null ||
                assignment.getNgayKetThuc().isAfter(LocalDateTime.now());
        if (!withinWindow) {
            return false;
        }
        if (submission == null) {
            return false;
        }
        return !"IN_PROGRESS".equalsIgnoreCase(submission.getTrangThai());
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? DATE_TIME_FORMATTER.format(dateTime) : null;
    }

    private BaiNop autoFinalizeIfExpired(BaiTap assignment, BaiNop submission, int durationMinutes) {
        if (submission == null || submission.getThoiGianBatDau() == null) {
            return submission;
        }
        if (!"IN_PROGRESS".equalsIgnoreCase(submission.getTrangThai())) {
            return submission;
        }

        LocalDateTime expireAt = submission.getThoiGianBatDau().plusMinutes(durationMinutes);
        if (LocalDateTime.now().isBefore(expireAt)) {
            return submission;
        }

        submission.setTrangThai("AUTO_SUBMITTED");
        submission.setThoiGianNop(expireAt);
        submission.setDiemSo(BigDecimal.ZERO);
        return baiNopStudentRepository.save(submission);
    }

    private boolean hasEssayQuestion(BaiTap assignment) {
        return loadQuestions(assignment).stream()
                .anyMatch(q -> "ESSAY".equalsIgnoreCase(q.getType()) || "WRITING".equalsIgnoreCase(q.getType()));
    }

    private int resolveDurationMinutes(BaiTap assignment) {
        // Read directly from BaiTap (moved from BaiTapNoiDung)
        if (assignment.getThoiLuongPhut() != null &&
            assignment.getThoiLuongPhut() > 0) {
            return assignment.getThoiLuongPhut();
        }

        String type = assignment.getLoaiBt() != null ? assignment.getLoaiBt().toUpperCase() : "";
        switch (type) {
            case "KIEM_TRA_15P":
                return DEFAULT_DURATION_QUIZ_15;
            case "KIEM_TRA_45P":
                return DEFAULT_DURATION_QUIZ_45;
            case "THI_HK":
                return DEFAULT_DURATION_FINAL;
            default:
                return DEFAULT_DURATION_HOMEWORK;
        }
    }

    private boolean resolveAutoSubmit(BaiTap assignment) {
        // TuDongNop is now in BaiNop table, not BaiTap
        // Default to true (auto-submit enabled)
        return true;
    }

    private String resolveWarningMessage(BaiTap assignment) {
        // Read directly from BaiTap (moved from BaiTapNoiDung)
        if (assignment.getCanhBao() != null && !assignment.getCanhBao().trim().isEmpty()) {
            return assignment.getCanhBao();
        }
        return DEFAULT_ASSIGNMENT_WARNING;
    }

    private List<AssignmentQuestionDTO> loadQuestions(BaiTap assignment) {
        // Read directly from BaiTap (moved from BaiTapNoiDung)
        if (assignment.getNoiDungJson() == null || assignment.getNoiDungJson().trim().isEmpty()) {
            return Collections.emptyList();
        }
        String raw = assignment.getNoiDungJson();
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<List<AssignmentQuestionDTO>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc nội dung bài tập: " + e.getMessage(), e);
        }
    }

    private StudentAssignmentDetailDTO buildAssignmentDetail(BaiTap assignment,
                                                             BaiNop submission,
                                                             List<AssignmentQuestionDTO> questions,
                                                             int durationMinutes) {
        StudentAssignmentDetailDTO dto = new StudentAssignmentDetailDTO();
        dto.setAssignmentId(assignment.getIdBt());
        dto.setTitle(assignment.getTieuDe());
        dto.setDescription(assignment.getMoTa());
        if (assignment.getBuoiHocChiTiet() != null &&
                assignment.getBuoiHocChiTiet().getLopHoc() != null) {
            dto.setClassName(assignment.getBuoiHocChiTiet().getLopHoc().getTenLop());
        }
        dto.setDueDate(assignment.getNgayKetThuc() != null
                ? assignment.getNgayKetThuc().format(DATE_TIME_FORMATTER) : null);
        dto.setDurationMinutes(durationMinutes);
        dto.setAutoSubmit(resolveAutoSubmit(assignment));
        dto.setWarningMessage(resolveWarningMessage(assignment));
        dto.setRequiresManualReview(hasEssayQuestion(assignment));
        dto.setQuestions(maskQuestionsForStudent(questions));

        if (submission != null) {
            dto.setSubmissionId(submission.getIdBn());
            dto.setStartedAt(formatDateTime(submission.getThoiGianBatDau()));
            dto.setSubmittedAt(formatDateTime(submission.getThoiGianNop()));
            dto.setGradedAt(formatDateTime(submission.getThoiGianNop()));
            dto.setExpiresAt(formatDateTime(calculateExpiresAt(submission, durationMinutes, assignment)));
            dto.setStatus(mapSubmissionStatus(submission));
            dto.setGrade(submission.getDiemSo() != null ? submission.getDiemSo().doubleValue() : null);
            dto.setCorrectAnswers(submission.getSoCauDung());
            dto.setTotalQuestions(submission.getTongSoCau());
            dto.setFeedback(submission.getNhanXet());
        } else if (assignment.getNgayKetThuc() != null &&
                assignment.getNgayKetThuc().isBefore(LocalDateTime.now())) {
            dto.setStatus("overdue");
        } else {
            dto.setStatus("pending");
        }

        return dto;
    }

    private List<AssignmentQuestionDTO> maskQuestionsForStudent(List<AssignmentQuestionDTO> questions) {
        if (questions == null) {
            return Collections.emptyList();
        }
        return questions.stream().map(q -> {
            AssignmentQuestionDTO masked = new AssignmentQuestionDTO();
            masked.setQuestionId(q.getQuestionId());
            masked.setOrderNo(q.getOrderNo());
            masked.setContent(q.getContent());
            masked.setType(q.getType());
            masked.setOptions(q.getOptions());
            masked.setPoints(q.getPoints());
            masked.setHint(q.getHint());
            masked.setCorrectAnswer(null);
            return masked;
        }).collect(Collectors.toList());
    }

    private HocSinh getHocSinhByUserId(String userId) {
        return hocSinhRepository.findFirstByTaiKhoan_IdTk(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin học sinh"));
    }

    private BaiTap getAssignmentById(String assignmentId) {
        return baiTapStudentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập với mã " + assignmentId));
    }

    private void ensureStudentInAssignment(HocSinh student, BaiTap assignment) {
        String classId = extractClassId(assignment);
        if (classId == null) {
            return;
        }
        boolean registered = dangKyLHStudentRepository.findByHocSinhId(student.getIdHs()).stream()
                .anyMatch(dk -> dk.getLopHoc() != null &&
                        classId.equals(dk.getLopHoc().getIdLh()));
        if (!registered) {
            throw new RuntimeException("Bạn không thuộc lớp học này.");
        }
    }

    private String extractClassId(BaiTap assignment) {
        if (assignment.getBuoiHocChiTiet() != null &&
            assignment.getBuoiHocChiTiet().getLopHoc() != null) {
            return assignment.getBuoiHocChiTiet().getLopHoc().getIdLh();
        }
        return null;
    }

    private void ensureAssignmentWindowIsOpen(BaiTap assignment) {
        LocalDateTime now = LocalDateTime.now();
        if (assignment.getNgayBatDau() != null && now.isBefore(assignment.getNgayBatDau())) {
            throw new RuntimeException("Bài tập chưa được mở.");
        }
        if (assignment.getNgayKetThuc() != null && now.isAfter(assignment.getNgayKetThuc())) {
            throw new RuntimeException("Bài tập đã hết hạn.");
        }
    }

    private BaiNop ensureSubmissionForStart(BaiTap assignment,
                                            HocSinh student,
                                            BaiNop submission,
                                            List<AssignmentQuestionDTO> questions,
                                            int durationMinutes) {
        // First check if assignment window is still open (must check before allowing retake)
        LocalDateTime now = LocalDateTime.now();
        if (assignment.getNgayKetThuc() != null && now.isAfter(assignment.getNgayKetThuc())) {
            throw new RuntimeException("Bài tập đã hết hạn. Không thể làm lại bài sau khi hết hạn.");
        }
        
        if (submission != null) {
            if ("IN_PROGRESS".equalsIgnoreCase(submission.getTrangThai())) {
                return submission;
            }
            // Check if assignment allows retake (choPhepLamBai) - only if still within deadline
            Boolean choPhepLamBai = assignment.getChoPhepLamBai();
            if (choPhepLamBai != null && choPhepLamBai) {
                // Allow retake - create a new submission (this preserves history as each submission is a new BaiNop)
                // The old submission remains in database as history
                // Note: Deadline check already done above, so we can safely allow retake
                System.out.println("Assignment allows retake. Creating new submission for student: " + student.getIdHs());
            } else {
                throw new RuntimeException("Bạn đã hoàn thành hoặc đã nộp bài tập này.");
            }
        }

        // Generate ID FIRST - before creating entity
        String submissionId = "BN" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        
        // Validate ID format - ensure it's exactly 10 characters
        if (submissionId == null || submissionId.trim().isEmpty() || submissionId.length() < 3) {
            submissionId = "BN" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        }
        submissionId = submissionId.trim();
        
        // Ensure ID is exactly 10 characters (BN + 8 chars = 10)
        if (submissionId.length() > 10) {
            submissionId = submissionId.substring(0, 10);
        } else if (submissionId.length() < 10) {
            // Pad if needed
            while (submissionId.length() < 10) {
                submissionId += "0";
            }
        }
        
        System.out.println("=== Creating BaiNop ===");
        System.out.println("Generated ID: '" + submissionId + "' (length: " + submissionId.length() + ")");
        
        // Create entity using constructor to avoid Lombok @Builder issues
        BaiNop newSubmission = new BaiNop();
        
        // Set ID IMMEDIATELY - BEFORE any other operations
        newSubmission.setIdBn(submissionId);
        
        // Verify ID is set correctly
        String verifyId = newSubmission.getIdBn();
        if (verifyId == null || verifyId.trim().isEmpty()) {
            throw new RuntimeException("ERROR: ID không được set sau khi gọi setIdBn()");
        }
        System.out.println("ID_BN after setIdBn(): '" + verifyId + "' (length: " + verifyId.length() + ")");
        
        // Set other required fields
        newSubmission.setIdBt(assignment.getIdBt());
        newSubmission.setBaiTap(assignment);
        newSubmission.setIdHs(student.getIdHs());
        newSubmission.setHocSinh(student);
        newSubmission.setTongSoCau(questions.size());
        newSubmission.setSoCauDung(0);
        newSubmission.setTrangThai("IN_PROGRESS");
        newSubmission.setThoiGianBatDau(LocalDateTime.now());
        
        // Final check before save - verify ID is still set
        String finalId = newSubmission.getIdBn();
        if (finalId == null || finalId.trim().isEmpty()) {
            throw new RuntimeException("ERROR: ID_BN bị mất trước khi save! Was: '" + verifyId + "'");
        }
        System.out.println("ID_BN before save(): '" + finalId + "' (length: " + finalId.length() + ")");
        System.out.println("Entity state before save - idBn: " + finalId + ", idBt: " + newSubmission.getIdBt() + ", idHs: " + newSubmission.getIdHs());
        
        // Save entity
        try {
            System.out.println("Calling repository.save()...");
            BaiNop saved = baiNopStudentRepository.save(newSubmission);
            System.out.println("Save() completed, returned entity: " + (saved != null ? "NOT NULL" : "NULL"));
            
            if (saved == null) {
                throw new RuntimeException("ERROR: save() trả về null!");
            }
            
            String savedId = saved.getIdBn();
            System.out.println("ID after save(): '" + (savedId != null ? savedId : "NULL") + "' (length: " + (savedId != null ? savedId.length() : 0) + ")");
            
            if (savedId == null || savedId.trim().isEmpty()) {
                throw new RuntimeException("ERROR: ID bị mất sau khi save()! Original was: '" + finalId + "'");
            }
            
            System.out.println("=== BaiNop created successfully with ID: " + savedId + " ===");
            return saved;
        } catch (Exception e) {
            System.err.println("==========================================");
            System.err.println("ERROR saving BaiNop:");
            System.err.println("Message: " + e.getMessage());
            System.err.println("ID at time of error: '" + newSubmission.getIdBn() + "'");
            System.err.println("ID length: " + (newSubmission.getIdBn() != null ? newSubmission.getIdBn().length() : 0));
            System.err.println("Entity toString: " + newSubmission.toString());
            System.err.println("==========================================");
            e.printStackTrace();
            throw new RuntimeException("Không thể lưu bài nộp: " + e.getMessage(), e);
        }
    }

    private BaiNop finalizeSubmission(BaiNop submission,
                                      StudentAssignmentSubmissionDTO submissionDTO,
                                      List<AssignmentQuestionDTO> questions,
                                      int durationMinutes,
                                      boolean autoSubmitEnabled) {
        if (!"IN_PROGRESS".equalsIgnoreCase(submission.getTrangThai())) {
            throw new RuntimeException("Bài làm đã được gửi trước đó.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireAt = submission.getThoiGianBatDau() != null
                ? submission.getThoiGianBatDau().plusMinutes(durationMinutes)
                : now;

        if (now.isAfter(expireAt) && !autoSubmitEnabled) {
            throw new RuntimeException("Bài làm đã quá hạn nộp.");
        }

        EvaluationResult result = evaluateAnswers(questions, submissionDTO.getAnswers());
        submission.setThoiGianNop(now.isAfter(expireAt) ? expireAt : now);
        submission.setNoiDungBaiLam(serializeAnswers(submissionDTO.getAnswers()));
        submission.setTongSoCau(questions.size());
        submission.setSoCauDung(result.correctCount);
        if (result.score != null) {
            submission.setDiemSo(BigDecimal.valueOf(result.score));
        }
        submission.setTrangThai(result.requiresManualReview ? "WAITING_REVIEW" : "GRADED_AUTO");
        return baiNopStudentRepository.save(submission);
    }

    private String serializeAnswers(List<StudentAssignmentSubmissionDTO.StudentAnswerDTO> answers) {
        if (answers == null || answers.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Không thể lưu bài làm: " + e.getOriginalMessage(), e);
        }
    }

    private EvaluationResult evaluateAnswers(List<AssignmentQuestionDTO> questions,
                                             List<StudentAssignmentSubmissionDTO.StudentAnswerDTO> answers) {
        EvaluationResult result = new EvaluationResult();
        if (questions == null || questions.isEmpty()) {
            result.requiresManualReview = true;
            return result;
        }

        Map<String, StudentAssignmentSubmissionDTO.StudentAnswerDTO> answerMap = new HashMap<>();
        if (answers != null) {
            for (StudentAssignmentSubmissionDTO.StudentAnswerDTO answer : answers) {
                if (answer.getQuestionId() != null) {
                    answerMap.put(answer.getQuestionId(), answer);
                }
            }
        }

        double totalPoints = questions.stream()
                .mapToDouble(q -> q.getPoints() != null ? q.getPoints() : 1d)
                .sum();
        double earned = 0;
        int correct = 0;
        boolean requiresManual = false;

        for (AssignmentQuestionDTO question : questions) {
            String type = question.getType() != null ? question.getType().toUpperCase() : "ESSAY";
            StudentAssignmentSubmissionDTO.StudentAnswerDTO answer = answerMap.get(question.getQuestionId());
            if ("MULTIPLE_CHOICE".equals(type)) {
                String submitted = extractAnswerValue(answer);
                if (submitted != null && question.getCorrectAnswer() != null &&
                    question.getCorrectAnswer().trim().equalsIgnoreCase(submitted.trim())) {
                    correct++;
                    earned += question.getPoints() != null ? question.getPoints() : 1d;
                }
            } else {
                requiresManual = true;
            }
        }

        result.correctCount = correct;
        result.requiresManualReview = requiresManual;
        result.score = totalPoints > 0 ? (earned / totalPoints) * 10d : null;
        return result;
    }

    private String extractAnswerValue(StudentAssignmentSubmissionDTO.StudentAnswerDTO answer) {
        if (answer == null) {
            return null;
        }
        if (answer.getAnswer() != null) {
            return answer.getAnswer();
        }
        if (answer.getAnswerText() != null) {
            return answer.getAnswerText();
        }
        if (answer.getAnswers() != null && !answer.getAnswers().isEmpty()) {
            return answer.getAnswers().get(0);
        }
        return null;
    }


    private static class EvaluationResult {
        private Double score;
        private int correctCount;
        private boolean requiresManualReview;
    }

    private List<StudentMessageDTO> getStudentMessages(String studentId) {
        // TODO: Implement when TinNhan entity is available
        // For now, return empty list
        return new ArrayList<>();
    }

    private List<StudentRegistrationDTO> getStudentRegistrations(String studentId) {
        // Bước 1: Tìm ID_HS và ID_LH từ DangKyLH
        List<DangKyLH> registrations = dangKyLHStudentRepository.findByHocSinhId(studentId);
        List<StudentRegistrationDTO> registrationDTOs = new ArrayList<>();
        
        for (DangKyLH dk : registrations) {
            // Lấy ID_HS và ID_LH từ DangKyLH
            String idLh = dk.getId().getIdLh();
            
            // Bước 2: Tìm LopHoc theo ID_LH và trích xuất thông tin từ entity LopHoc
            Optional<LopHoc> lopHocOpt = lopHocRepository.findById(idLh);
            if (!lopHocOpt.isPresent()) {
                continue;
            }
            
            LopHoc lopHoc = lopHocOpt.get();
            
            StudentRegistrationDTO regDTO = new StudentRegistrationDTO();
            regDTO.setId(dk.getId().getIdHs() + "_" + idLh);
            regDTO.setClassId(idLh);
            regDTO.setClassName(lopHoc.getTenLop());
            
            // Lấy thông tin giáo viên từ LopHoc
            if (lopHoc.getNhanVien() != null) {
                NhanVien nv = lopHoc.getNhanVien();
                String teacherName = nv.getHo() + " " + 
                    (nv.getTenDem() != null ? nv.getTenDem() + " " : "") + nv.getTen();
                regDTO.setTeacherName(teacherName.trim());
            } else {
                regDTO.setTeacherName("Chưa có giáo viên");
            }
            
            // Lấy ngày đăng ký từ DangKyLH (nếu có) hoặc ngày bắt đầu từ LopHoc
            if (lopHoc.getNgayBatDau() != null) {
                regDTO.setRegistrationDate(lopHoc.getNgayBatDau().format(DATE_TIME_FORMATTER));
            }
            
            regDTO.setStatus(lopHoc.getTrangThai() != null ? lopHoc.getTrangThai() : "pending");
            
            // Lấy mô tả từ LopHoc entity
            regDTO.setDescription(lopHoc.getMoTa() != null ? lopHoc.getMoTa() : "");
            
            // Lấy thông tin từ LopHoc entity
            regDTO.setLoaiNgay(lopHoc.getLoaiNgay());
            regDTO.setSoBuoi(lopHoc.getSoBuoi());
            regDTO.setHinhThucHoc(lopHoc.getHinhThucHoc());
            if (lopHoc.getMucGiaThang() != null) {
                regDTO.setMucGiaThang(lopHoc.getMucGiaThang().toString());
            }
            regDTO.setTrangThaiLop(lopHoc.getTrangThai());
            
            // Bước 3: Tìm hóa đơn từ HoaDon entity (tìm hóa đơn theo ID_HS và ID_LH)
            List<HoaDon> hoaDons = hoaDonRepository.findByHocSinhIdAndLopHocId(studentId, idLh);
            
            if (!hoaDons.isEmpty()) {
                // Lấy hóa đơn đầu tiên (hoặc có thể lấy hóa đơn mới nhất)
                HoaDon hoaDon = hoaDons.get(0);
                
                // Trích xuất thông tin từ HoaDon entity
                regDTO.setInvoiceId(hoaDon.getIdHoaDon());
                if (hoaDon.getNgayDangKy() != null) {
                    regDTO.setNgayDangKy(hoaDon.getNgayDangKy().toString());
                }
                if (hoaDon.getNgayThanhToan() != null) {
                    regDTO.setNgayThanhToan(hoaDon.getNgayThanhToan().toString());
                }
                if (hoaDon.getHanThanhToan() != null) {
                    regDTO.setHanThanhToan(hoaDon.getHanThanhToan().toString());
                }
                regDTO.setSoThang(hoaDon.getSoThang());
                if (hoaDon.getTongTien() != null) {
                    regDTO.setTongTien(hoaDon.getTongTien().toString());
                }
                regDTO.setTrangThaiHoaDon(hoaDon.getTrangThai());
            }
            
            // Lấy đánh giá lớp học từ DanhGiaLopHoc entity (nếu có)
            Optional<DanhGiaLopHoc> danhGiaOpt = danhGiaLopHocStudentRepository.findByHocSinhIdAndLopHocId(studentId, idLh);
            if (danhGiaOpt.isPresent()) {
                DanhGiaLopHoc danhGia = danhGiaOpt.get();
                regDTO.setRating(danhGia.getDiemDanhGia());
                regDTO.setRatingComment(danhGia.getNhanXet());
            }
            
            registrationDTOs.add(regDTO);
        }
        
        return registrationDTOs;
    }

    private List<StudentAttendedClassDTO> getStudentAttendedClasses(String studentId) {
        List<BuoiHocChiTiet> sessions = buoiHocChiTietStudentRepository.findByHocSinhId(studentId);
        
        // Use Map to store unique sessions by classId + sessionNumber
        // Key: classId + "_" + sessionNumber, Value: StudentAttendedClassDTO (keep the most recent one)
        Map<String, StudentAttendedClassDTO> uniqueSessionsMap = new HashMap<>();
        
        for (BuoiHocChiTiet session : sessions) {
            if (session.getLopHoc() == null) continue;
            
            LopHoc lopHoc = session.getLopHoc();
            String classId = lopHoc.getIdLh();
            
            // Safely parse session number
            int sessionNumber = 0;
            try {
                if (session.getThuTuBuoiHoc() != null && !session.getThuTuBuoiHoc().trim().isEmpty()) {
                    sessionNumber = Integer.parseInt(session.getThuTuBuoiHoc());
                }
            } catch (NumberFormatException e) {
                // Skip sessions with invalid session number
                continue;
            }
            
            // Skip if sessionNumber is 0 or invalid
            if (sessionNumber <= 0) continue;
            
            // Create unique key: classId + sessionNumber
            String uniqueKey = classId + "_" + sessionNumber;
            
            // Check if we already have this session
            StudentAttendedClassDTO existingDTO = uniqueSessionsMap.get(uniqueKey);
            
            // If we don't have this session yet, or if this session is more recent, add/update it
            boolean shouldAdd = false;
            if (existingDTO == null) {
                shouldAdd = true;
            } else if (session.getNgayHoc() != null && existingDTO.getSessionDate() != null) {
                // Compare dates - keep the most recent one
                try {
                    LocalDateTime newDate = session.getNgayHoc();
                    LocalDateTime existingDate = LocalDateTime.parse(existingDTO.getSessionDate(), DATE_TIME_FORMATTER);
                    if (newDate.isAfter(existingDate)) {
                        shouldAdd = true;
                    }
                } catch (Exception e) {
                    // If date parsing fails, keep existing
                }
            }
            
            if (shouldAdd) {
                StudentAttendedClassDTO attendedDTO = new StudentAttendedClassDTO();
                attendedDTO.setId(session.getIdBh());
                attendedDTO.setClassId(classId);
                attendedDTO.setClassName(lopHoc.getTenLop());
                
                // Get teacher name from LopHoc
                if (lopHoc.getNhanVien() != null) {
                    NhanVien nv = lopHoc.getNhanVien();
                    String teacherName = nv.getHo() + " " + 
                        (nv.getTenDem() != null ? nv.getTenDem() + " " : "") + nv.getTen();
                    attendedDTO.setTeacherName(teacherName.trim());
                } else {
                    attendedDTO.setTeacherName("Chưa có giáo viên");
                }
                
                attendedDTO.setSessionNumber(sessionNumber);
                
                if (session.getNgayHoc() != null) {
                    attendedDTO.setSessionDate(session.getNgayHoc().format(DATE_TIME_FORMATTER));
                }
                
                if (session.getGioBatDau() != null) {
                    attendedDTO.setStartTime(session.getGioBatDau().toLocalTime().toString());
                }
                
                if (session.getGioKetThuc() != null) {
                    attendedDTO.setEndTime(session.getGioKetThuc().toLocalTime().toString());
                }
                
                if (session.getPhong() != null) {
                    attendedDTO.setRoom(session.getPhong().getTenPhong());
                }
                
                attendedDTO.setContent(session.getNoiDung());
                
                uniqueSessionsMap.put(uniqueKey, attendedDTO);
            }
        }
        
        // Convert map values to list
        return new ArrayList<>(uniqueSessionsMap.values());
    }

    private List<StudentSupportRequestDTO> getSupportRequests(String studentId) {
        // Get support requests for classes that student is registered in
        List<DangKyLH> registrations = dangKyLHStudentRepository.findByHocSinhId(studentId);
        List<String> classIds = registrations.stream()
            .map(dk -> dk.getLopHoc().getIdLh())
            .collect(Collectors.toList());
        
        List<StudentSupportRequestDTO> supportRequests = new ArrayList<>();
        
        for (String classId : classIds) {
            // Get all support requests and filter by class
            List<YeuCauHoTro> allRequests = yeuCauHoTroStudentRepository.findAll();
            List<YeuCauHoTro> yeuCaus = allRequests.stream()
                .filter(yc -> yc.getLopHoc() != null && yc.getLopHoc().getIdLh().equals(classId))
                .collect(Collectors.toList());
            
            for (YeuCauHoTro yc : yeuCaus) {
                StudentSupportRequestDTO requestDTO = new StudentSupportRequestDTO();
                requestDTO.setId(yc.getIdYc());
                requestDTO.setType(yc.getLoaiYeuCau());
                requestDTO.setTitle(yc.getTieuDe());
                requestDTO.setDescription(yc.getNoiDung());
                requestDTO.setStatus(yc.getTrangThai());
                
                if (yc.getLopHoc() != null) {
                    requestDTO.setClassName(yc.getLopHoc().getTenLop());
                }
                
                if (yc.getThoiDiemTao() != null) {
                    requestDTO.setCreatedAt(yc.getThoiDiemTao().format(DATE_TIME_FORMATTER));
                }
                
                supportRequests.add(requestDTO);
            }
        }
        
        return supportRequests;
    }

    private StudentStatsDTO calculateStats(StudentDashboardDTO dashboard) {
        StudentStatsDTO stats = new StudentStatsDTO();

        if (dashboard.getClasses() != null) {
            stats.setTotalClasses(dashboard.getClasses().size());
        }

        if (dashboard.getAssignments() != null) {
            stats.setPendingAssignments((int) dashboard.getAssignments().stream()
                .filter(a -> "pending".equals(a.getStatus())).count());
            stats.setCompletedAssignments((int) dashboard.getAssignments().stream()
                .filter(a -> "submitted".equals(a.getStatus()) || "graded".equals(a.getStatus())).count());
            stats.setTotalAssignments(dashboard.getAssignments().size());
        }

        if (dashboard.getGrades() != null && !dashboard.getGrades().isEmpty()) {
            double avgGrade = dashboard.getGrades().stream()
                .mapToDouble(StudentGradeDTO::getScore)
                .average()
                .orElse(0.0);
            stats.setAverageGrade(avgGrade);
            stats.setTotalGrades(dashboard.getGrades().size());
        }

        // Calculate today's classes
        LocalDateTime now = LocalDateTime.now();
        long todayClasses = 0;
        if (dashboard.getAttendedClasses() != null) {
            todayClasses = dashboard.getAttendedClasses().stream()
                .filter(ac -> {
                    try {
                        if (ac.getSessionDate() == null || ac.getSessionDate().isEmpty()) {
                            return false;
                        }
                        LocalDateTime sessionDate = LocalDateTime.parse(ac.getSessionDate(), DATE_TIME_FORMATTER);
                        return sessionDate.toLocalDate().equals(now.toLocalDate());
                    } catch (Exception e) {
                        return false;
                    }
                })
                .count();
        }
        stats.setTodayClasses((int) todayClasses);

        // Calculate attendance rate (simplified)
        if (dashboard.getClasses() != null && !dashboard.getClasses().isEmpty()) {
            double avgAttendance = dashboard.getClasses().stream()
                .mapToInt(StudentClassDTO::getAttendancePercentage)
                .average()
                .orElse(0.0);
            stats.setAttendanceRate((int) avgAttendance);
        } else {
            stats.setAttendanceRate(0);
        }

        return stats;
    }

    private double calculateAverageGradeForClass(String studentId, String classId) {
        List<BaiNop> baiNops = baiNopStudentRepository.findAllByHocSinhId(studentId);
        
        return baiNops.stream()
            .filter(bn -> bn.getBaiTap() != null && 
                         bn.getBaiTap().getBuoiHocChiTiet() != null &&
                         bn.getBaiTap().getBuoiHocChiTiet().getLopHoc() != null &&
                         bn.getBaiTap().getBuoiHocChiTiet().getLopHoc().getIdLh().equals(classId) &&
                         bn.getDiemSo() != null)
            .mapToDouble(bn -> bn.getDiemSo().doubleValue())
            .average()
            .orElse(0.0);
    }

    private int calculateAttendancePercentage(String studentId, String classId, List<BuoiHocChiTiet> allSessions) {
        if (allSessions == null || allSessions.isEmpty()) {
            return 0;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Count total sessions that have already occurred (past sessions)
        long totalPastSessions = allSessions.stream()
            .filter(session -> session.getNgayHoc() != null && session.getNgayHoc().isBefore(now))
            .count();
        
        if (totalPastSessions == 0) {
            // No past sessions yet, return 100% or 0% based on registration status
            return 100; // Student is registered, considered as ready to attend
        }
        
        // Estimate attendance based on assignments submitted
        // If student has submitted assignments for this class, they likely attended
        List<BaiNop> baiNops = baiNopStudentRepository.findAllByHocSinhId(studentId);
        long assignmentsForClass = baiNops.stream()
            .filter(bn -> bn.getBaiTap() != null && 
                         bn.getBaiTap().getBuoiHocChiTiet() != null &&
                         bn.getBaiTap().getBuoiHocChiTiet().getLopHoc() != null &&
                         bn.getBaiTap().getBuoiHocChiTiet().getLopHoc().getIdLh().equals(classId))
            .count();
        
        // Calculate percentage: if student has assignments, estimate attendance
        // This is an approximation since we don't have DiemDanh table
        if (assignmentsForClass > 0) {
            // Estimate: if student has done assignments, they likely attended most sessions
            // Use a ratio based on assignments vs total sessions
            double estimatedAttendance = Math.min(95.0, 
                (assignmentsForClass * 100.0 / totalPastSessions) * 1.2); // 1.2 factor for estimation
            return (int) Math.round(estimatedAttendance);
        } else {
            // No assignments yet, but registered - assume they will attend
            // Return a conservative estimate
            return 80; // Default for registered students without assignments yet
        }
    }

    private double calculateKetQuaScore(String diemSoRaw) {
        if (diemSoRaw == null || diemSoRaw.trim().isEmpty()) {
            return 0d;
        }
        String[] parts = diemSoRaw.split(",");
        BigDecimal total = BigDecimal.ZERO;
        int count = 0;
        for (String part : parts) {
            if (part == null || part.trim().isEmpty()) {
                continue;
            }
            try {
                BigDecimal value = new BigDecimal(part.trim());
                total = total.add(value);
                count++;
            } catch (NumberFormatException ignored) {
            }
        }
        if (count == 0) {
            return 0d;
        }
        return total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP).doubleValue();
    }

    @Transactional
    public void updateStudentProfile(String userId, UpdateStudentProfileDTO profileDTO) {
        // Find student by account ID
        Optional<HocSinh> studentOpt = hocSinhRepository.findFirstByTaiKhoan_IdTk(userId);
        
        if (!studentOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy học sinh");
        }

        HocSinh student = studentOpt.get();

        // Update only phone and address (as requested)
        if (profileDTO.getPhone() != null && !profileDTO.getPhone().trim().isEmpty()) {
            student.setSdt(profileDTO.getPhone().trim());
        }

        if (profileDTO.getAddress() != null && !profileDTO.getAddress().trim().isEmpty()) {
            student.setDiaChi(profileDTO.getAddress().trim());
        }

        // Update gender if provided (0 = Nam/false, 1 = Nữ/true)
        if (profileDTO.getGender() != null) {
            student.setGioiTinh(profileDTO.getGender() == 1);
        }

        // Update name if provided
        if (profileDTO.getFirstName() != null && !profileDTO.getFirstName().trim().isEmpty()) {
            student.setHo(profileDTO.getFirstName().trim());
        }

        if (profileDTO.getMiddleName() != null) {
            student.setTenDem(profileDTO.getMiddleName().trim().isEmpty() ? null : profileDTO.getMiddleName().trim());
        }

        if (profileDTO.getLastName() != null && !profileDTO.getLastName().trim().isEmpty()) {
            student.setTen(profileDTO.getLastName().trim());
        }

        // Update timestamp
        student.setThoiGianCapNhat(LocalDateTime.now());

        // Save to database
        hocSinhRepository.save(student);
    }

    @Transactional
    public void rateSession(String userId, RateSessionDTO rateDTO) {
        // Find student by account ID
        Optional<HocSinh> studentOpt = hocSinhRepository.findFirstByTaiKhoan_IdTk(userId);
        if (!studentOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy học sinh");
        }

        HocSinh student = studentOpt.get();
        String studentId = student.getIdHs();

        // Find the session by ID
        Optional<BuoiHocChiTiet> sessionOpt = buoiHocChiTietStudentRepository.findById(rateDTO.getSessionId());
        if (!sessionOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy buổi học");
        }

        BuoiHocChiTiet session = sessionOpt.get();

        // Verify that this session belongs to a class the student is registered in
        if (session.getLopHoc() == null) {
            throw new RuntimeException("Buổi học không thuộc lớp học nào");
        }

        String classId = session.getLopHoc().getIdLh();
        boolean isRegistered = dangKyLHStudentRepository.findByHocSinhId(studentId).stream()
            .anyMatch(dk -> dk.getLopHoc() != null && dk.getLopHoc().getIdLh().equals(classId));

        if (!isRegistered) {
            throw new RuntimeException("Bạn chưa đăng ký lớp học này");
        }

        // Lưu đánh giá vào DanhGiaBuoiHoc entity thay vì BuoiHocChiTiet
        // Kiểm tra xem đã có đánh giá cho buổi học này chưa
        Optional<DanhGiaBuoiHoc> existingRatingOpt = danhGiaBuoiHocStudentRepository.findByHocSinhIdAndBuoiHocChiTietId(studentId, rateDTO.getSessionId());
        
        DanhGiaBuoiHoc danhGia;
        if (existingRatingOpt.isPresent()) {
            // Cập nhật đánh giá đã có
            danhGia = existingRatingOpt.get();
        } else {
            // Tạo đánh giá mới
            danhGia = new DanhGiaBuoiHoc();
            String newId = generateNextDanhGiaBuoiHocId();
            danhGia.setIdDgbh(newId);
            danhGia.setHocSinh(student);
            danhGia.setBuoiHocChiTiet(session);
        }
        
        // Update rating: 5 sao = 5 DiemDanhGia
        danhGia.setDiemDanhGia(rateDTO.getRating());
        
        // Update comment if provided
        if (rateDTO.getComment() != null && !rateDTO.getComment().trim().isEmpty()) {
            String comment = rateDTO.getComment().trim();
            // Truncate if too long
            if (comment.length() > 500) {
                comment = comment.substring(0, 500);
            }
            danhGia.setNhanXet(comment);
        }
        
        // Update time
        danhGia.setThoiDiemDanhGia(LocalDateTime.now());

        // Save to database
        danhGiaBuoiHocStudentRepository.save(danhGia);
    }

    @Transactional
    public void rateClass(String userId, RateClassDTO rateDTO) {
        // Find student by account ID
        Optional<HocSinh> studentOpt = hocSinhRepository.findFirstByTaiKhoan_IdTk(userId);
        if (!studentOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy học sinh");
        }

        HocSinh student = studentOpt.get();
        String studentId = student.getIdHs();

        // Parse registrationId to get ID_HS and ID_LH
        // Format: ID_HS_ID_LH or ID_HS + "_" + ID_LH
        String registrationId = rateDTO.getRegistrationId();
        if (registrationId == null || registrationId.trim().isEmpty()) {
            throw new RuntimeException("ID đăng ký không hợp lệ");
        }

        String[] parts = registrationId.split("_");
        if (parts.length < 2) {
            throw new RuntimeException("ID đăng ký không đúng định dạng");
        }

        String idLh = parts[parts.length - 1]; // Last part is ID_LH
        String idHsFromReg = parts[0]; // First part is ID_HS

        // Verify student ID matches
        if (!studentId.equals(idHsFromReg)) {
            throw new RuntimeException("ID học sinh không khớp");
        }

        // Find LopHoc by ID_LH
        Optional<LopHoc> lopHocOpt = lopHocRepository.findById(idLh);
        if (!lopHocOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy lớp học");
        }

        LopHoc lopHoc = lopHocOpt.get();

        // Verify student is registered in this class
        boolean isRegistered = dangKyLHStudentRepository.findByHocSinhId(studentId).stream()
            .anyMatch(dk -> dk.getLopHoc() != null && dk.getLopHoc().getIdLh().equals(idLh));

        if (!isRegistered) {
            throw new RuntimeException("Bạn chưa đăng ký lớp học này");
        }

        // Check if student already rated this class
        Optional<DanhGiaLopHoc> existingRatingOpt = danhGiaLopHocStudentRepository.findByHocSinhIdAndLopHocId(studentId, idLh);
        
        DanhGiaLopHoc danhGia;
        if (existingRatingOpt.isPresent()) {
            // Update existing rating
            danhGia = existingRatingOpt.get();
        } else {
            // Create new rating
            danhGia = new DanhGiaLopHoc();
            String newId = generateNextDanhGiaLopHocId();
            danhGia.setIdDglh(newId);
            danhGia.setHocSinh(student);
            danhGia.setLopHoc(lopHoc);
        }

        // Update rating: 5 sao = 5 DiemDanhGia
        danhGia.setDiemDanhGia(rateDTO.getRating());
        
        // Update comment if provided
        if (rateDTO.getComment() != null && !rateDTO.getComment().trim().isEmpty()) {
            String comment = rateDTO.getComment().trim();
            // Truncate if too long
            if (comment.length() > 500) {
                comment = comment.substring(0, 500);
            }
            danhGia.setNhanXet(comment);
        }

        // Update time
        danhGia.setThoiDiemDanhGia(LocalDateTime.now());

        // Save to database
        danhGiaLopHocStudentRepository.save(danhGia);
    }

    private String generateNextDanhGiaLopHocId() {
        try {
            int maxNumber = danhGiaLopHocStudentRepository.findMaxDglhNumber();
            int nextNumber = maxNumber + 1;
            // Format: DG + 8 digits (e.g., DG00000001)
            return String.format("DG%08d", nextNumber);
        } catch (Exception e) {
            // Fallback: use timestamp-based ID if query fails
            long timestamp = System.currentTimeMillis();
            String timestampStr = String.valueOf(timestamp);
            // Take last 8 digits and pad if needed
            if (timestampStr.length() > 8) {
                timestampStr = timestampStr.substring(timestampStr.length() - 8);
            }
            return "DG" + String.format("%08d", Integer.parseInt(timestampStr));
        }
    }

    private String generateNextDanhGiaBuoiHocId() {
        try {
            int maxNumber = danhGiaBuoiHocStudentRepository.findMaxDgbhNumber();
            int nextNumber = maxNumber + 1;
            // Format: DGBH + 6 digits (e.g., DGBH000001) - total 10 characters
            return String.format("DGBH%06d", nextNumber);
        } catch (Exception e) {
            // Fallback: use timestamp-based ID if query fails
            long timestamp = System.currentTimeMillis();
            String timestampStr = String.valueOf(timestamp);
            // Take last 6 digits and pad if needed
            if (timestampStr.length() > 6) {
                timestampStr = timestampStr.substring(timestampStr.length() - 6);
            }
            return "DGBH" + String.format("%06d", Integer.parseInt(timestampStr));
        }
    }
}
