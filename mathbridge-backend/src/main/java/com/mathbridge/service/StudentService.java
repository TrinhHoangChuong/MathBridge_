package com.mathbridge.service;

import com.mathbridge.dto.*;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.repository.HocSinhRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private HocSinhRepository hocSinhRepository;

    public StudentDashboardDTO getStudentDashboard(String userId) {
        // Find student by account ID
        Optional<HocSinh> studentOpt = hocSinhRepository.findByTaiKhoan_IdTk(userId);

        if (!studentOpt.isPresent()) {
            throw new RuntimeException("Student not found");
        }

        HocSinh student = studentOpt.get();

        // Build full name
        String fullName = student.getHo() + " " + (student.getTenDem() != null ? student.getTenDem() + " " : "") + student.getTen();

        // Create dashboard DTO
        StudentDashboardDTO dashboard = new StudentDashboardDTO();
        dashboard.setStudentId(student.getIdHs());
        dashboard.setFullName(fullName.trim());
        dashboard.setEmail(student.getEmail());
        dashboard.setPhone(student.getSdt());
        dashboard.setAddress(student.getDiaChi());
        dashboard.setGender(student.getGioiTinh());

        // For now, create mock data for other fields
        // In a real implementation, these would be fetched from respective repositories
        dashboard.setClasses(getMockClasses());
        dashboard.setAssignments(getMockAssignments());
        dashboard.setGrades(getMockGrades());
        dashboard.setMessages(getMockMessages());
        dashboard.setStats(calculateStats(dashboard));
        dashboard.setRegistrations(getMockRegistrations());
        dashboard.setAttendedClasses(getMockAttendedClasses());
        dashboard.setSupportRequests(getSupportRequests(student.getIdHs()));

        return dashboard;
    }

    private List<StudentClassDTO> getMockClasses() {
        List<StudentClassDTO> classes = new ArrayList<>();
        StudentClassDTO class1 = new StudentClassDTO();
        class1.setClassId("MATH101");
        class1.setClassName("Toán học nâng cao 10");
        class1.setTeacherName("Thầy Nguyễn Văn Minh");
        class1.setSchedule("Thứ 2, 4, 6 (08:00-10:00)");
        class1.setRoom("Phòng 101");
        class1.setStudentCount(25);
        class1.setAverageGrade(8.5);
        class1.setAttendancePercentage(92);
        class1.setStatus("active");
        classes.add(class1);

        StudentClassDTO class2 = new StudentClassDTO();
        class2.setClassId("MATH102");
        class2.setClassName("Giải tích 11");
        class2.setTeacherName("Cô Trần Thị Lan");
        class2.setSchedule("Thứ 3, 5 (10:30-12:30)");
        class2.setRoom("Phòng 203");
        class2.setStudentCount(22);
        class2.setAverageGrade(7.8);
        class2.setAttendancePercentage(88);
        class2.setStatus("active");
        classes.add(class2);

        return classes;
    }

    private List<StudentAssignmentDTO> getMockAssignments() {
        List<StudentAssignmentDTO> assignments = new ArrayList<>();
        StudentAssignmentDTO assignment1 = new StudentAssignmentDTO();
        assignment1.setAssignmentId("ASS001");
        assignment1.setTitle("Bài tập về phương trình bậc hai");
        assignment1.setDescription("Giải các phương trình bậc hai sau: x² - 5x + 6 = 0, 2x² + 3x - 2 = 0, x² - 4 = 0");
        assignment1.setClassName("Toán học nâng cao 10");
        assignment1.setDueDate("2024-12-01T23:59:59");
        assignment1.setStatus("pending");
        assignments.add(assignment1);

        StudentAssignmentDTO assignment2 = new StudentAssignmentDTO();
        assignment2.setAssignmentId("ASS002");
        assignment2.setTitle("Bài tập về giải tích - Đạo hàm");
        assignment2.setDescription("Tính đạo hàm của các hàm số sau: f(x) = x³ + 2x² - 3x + 1, g(x) = sin(x)cos(x), h(x) = e^x/x");
        assignment2.setClassName("Giải tích 11");
        assignment2.setDueDate("2024-12-05T23:59:59");
        assignment2.setStatus("submitted");
        assignment2.setGrade(8.5);
        assignment2.setSubmittedAt("2024-11-28T10:00:00");
        assignment2.setGradedAt("2024-11-29T14:00:00");
        assignment2.setFeedback("Bài làm tốt, cần cải thiện phần trình bày đồ thị");
        assignments.add(assignment2);

        return assignments;
    }

    private List<StudentGradeDTO> getMockGrades() {
        List<StudentGradeDTO> grades = new ArrayList<>();
        StudentGradeDTO grade1 = new StudentGradeDTO();
        grade1.setGradeId("G001");
        grade1.setSubject("Toán học");
        grade1.setClassName("Toán học nâng cao 10");
        grade1.setGradeType("Bài kiểm tra giữa kỳ");
        grade1.setScore(8.5);
        grade1.setGradedAt("2024-11-15T00:00:00");
        grade1.setTeacherName("Thầy Nguyễn Văn Minh");
        grade1.setFeedback("Bài làm tốt, cần chú ý cách trình bày");
        grades.add(grade1);

        StudentGradeDTO grade2 = new StudentGradeDTO();
        grade2.setGradeId("G002");
        grade2.setSubject("Giải tích");
        grade2.setClassName("Giải tích 11");
        grade2.setGradeType("Bài tập đạo hàm");
        grade2.setScore(9.0);
        grade2.setGradedAt("2024-11-10T00:00:00");
        grade2.setTeacherName("Cô Trần Thị Lan");
        grade2.setFeedback("Giải thích rõ ràng, áp dụng tốt các quy tắc đạo hàm");
        grades.add(grade2);

        return grades;
    }

    private List<StudentMessageDTO> getMockMessages() {
        List<StudentMessageDTO> messages = new ArrayList<>();
        StudentMessageDTO message1 = new StudentMessageDTO();
        message1.setId("MSG001");
        message1.setSender("Thầy Nguyễn Văn Minh");
        message1.setSubject("Bài tập phương trình bậc hai");
        message1.setPreview("Các em đã nộp bài tập chưa? Hạn nộp là ngày mai. Hãy kiểm tra lại đáp án...");
        message1.setSentAt("2024-11-30T08:00:00");
        message1.setUnread(true);
        message1.setType("teacher");
        messages.add(message1);

        return messages;
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

        // Mock other stats
        stats.setTodayClasses(1);
        stats.setAttendanceRate(90);

        return stats;
    }

    private List<StudentRegistrationDTO> getMockRegistrations() {
        List<StudentRegistrationDTO> registrations = new ArrayList<>();
        StudentRegistrationDTO reg1 = new StudentRegistrationDTO();
        reg1.setId("DK001");
        reg1.setClassName("Toán học nâng cao 10");
        reg1.setTeacherName("Thầy Nguyễn Văn Minh");
        reg1.setRegistrationDate("2024-09-01T08:00:00");
        reg1.setStatus("approved");
        reg1.setDescription("Lớp học chuyên sâu về đại số và hình học");
        registrations.add(reg1);

        return registrations;
    }

    private List<StudentAttendedClassDTO> getMockAttendedClasses() {
        List<StudentAttendedClassDTO> attendedClasses = new ArrayList<>();
        StudentAttendedClassDTO attended1 = new StudentAttendedClassDTO();
        attended1.setId("BH001");
        attended1.setClassName("Toán học nâng cao 10");
        attended1.setSessionNumber(1);
        attended1.setSessionDate("2024-09-10T08:00:00");
        attended1.setStartTime("08:00");
        attended1.setEndTime("10:00");
        attended1.setRoom("Phòng 101");
        attended1.setContent("Giới thiệu về phương trình bậc hai");
        attendedClasses.add(attended1);

        return attendedClasses;
    }

    private List<StudentSupportRequestDTO> getSupportRequests(String userId) {
        // In a real implementation, we would fetch support requests for this specific user
        // For now, return mock data since the entity doesn't have user reference yet
        List<StudentSupportRequestDTO> supportRequests = new ArrayList<>();
        StudentSupportRequestDTO request1 = new StudentSupportRequestDTO();
        request1.setId("YC001");
        request1.setType("technical");
        request1.setTitle("Không thể tải bài tập");
        request1.setDescription("Tôi không thể tải bài tập về máy. Lỗi hiển thị 'File not found'.");
        request1.setClassName("Toán học nâng cao 10");
        request1.setStatus("resolved");
        request1.setCreatedAt("2024-11-15T09:00:00");
        request1.setResponse("Vấn đề đã được khắc phục. Vui lòng thử lại.");
        request1.setRespondedAt("2024-11-15T11:30:00");
        supportRequests.add(request1);

        return supportRequests;
    }
}