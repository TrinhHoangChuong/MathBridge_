package com.mathbridge.service;

import com.mathbridge.dto.*;
import com.mathbridge.entity.*;
import com.mathbridge.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final HocSinhRepository hocSinhRepository;
    private final DangKyLHRepository dangKyLHRepository;
    private final LopHocRepository lopHocRepository;

    public StudentService(HocSinhRepository hocSinhRepository,
                         DangKyLHRepository dangKyLHRepository,
                         LopHocRepository lopHocRepository) {
        this.hocSinhRepository = hocSinhRepository;
        this.dangKyLHRepository = dangKyLHRepository;
        this.lopHocRepository = lopHocRepository;
    }

    public StudentDashboardDTO getStudentDashboard(String studentId) {
        Optional<HocSinh> studentOpt = hocSinhRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return null;
        }

        HocSinh student = studentOpt.get();

        // Get classes
        List<StudentClassDTO> classes = getStudentClasses(studentId);

        // Get assignments
        List<StudentAssignmentDTO> assignments = getStudentAssignments(studentId);

        // Get grades
        List<StudentGradeDTO> grades = getStudentGrades(studentId);

        // Get stats
        StudentStatsDTO stats = getStudentStats(studentId);

        String fullName = (student.getHo() + " " +
                          (student.getTenDem() != null ? student.getTenDem() + " " : "") +
                          student.getTen()).trim();

        return new StudentDashboardDTO(
                student.getIdHs(),
                fullName,
                student.getEmail(),
                classes,
                assignments,
                grades,
                stats
        );
    }

    private List<StudentClassDTO> getStudentClasses(String studentId) {
        List<DangKyLH> registrations = dangKyLHRepository.findByHocSinhId(studentId);
        List<StudentClassDTO> classes = new ArrayList<>();

        for (DangKyLH reg : registrations) {
            LopHoc lopHoc = reg.getLopHoc();
            if (lopHoc != null) {
                // Mock teacher name - in real implementation, get from NhanVien entity
                String teacherName = "Giáo viên " + lopHoc.getIdLh();

                StudentClassDTO classDTO = new StudentClassDTO(
                        lopHoc.getIdLh(),
                        lopHoc.getTenLop(),
                        teacherName,
                        "Thứ 2,4,6 8:00-9:30", // Mock schedule
                        "Phòng A101", // Mock room
                        "Đang học",
                        45, // Mock student count
                        8.5, // Mock average grade
                        95 // Mock attendance
                );
                classes.add(classDTO);
            }
        }

        return classes;
    }

    private List<StudentAssignmentDTO> getStudentAssignments(String studentId) {
        // For now, return mock assignments since BaiTap and BaiNop repositories are not available
        List<StudentAssignmentDTO> assignments = new ArrayList<>();

        // Mock assignments for demonstration
        assignments.add(new StudentAssignmentDTO(
                "BT001",
                "Bài tập Đại số tuần 1",
                "Giải các bài tập về phương trình bậc hai",
                "Toán 10A1",
                LocalDateTime.now().plusDays(7),
                "pending",
                null,
                null,
                null,
                null
        ));

        assignments.add(new StudentAssignmentDTO(
                "BT002",
                "Kiểm tra Hình học",
                "Kiểm tra định kỳ về các định lý trong chương Hình học",
                "Toán 11B2",
                LocalDateTime.now().plusDays(10),
                "pending",
                null,
                null,
                null,
                null
        ));

        return assignments;
    }

    private List<StudentGradeDTO> getStudentGrades(String studentId) {
        // Mock grades for demonstration since KetQuaHocTap repository is not available
        List<StudentGradeDTO> grades = new ArrayList<>();

        grades.add(new StudentGradeDTO(
                "KQ001",
                "Toán học",
                "10A1",
                "Kiểm tra 15 phút",
                9.0,
                "A",
                LocalDateTime.now().minusDays(5),
                "Giáo viên Nguyễn Văn B",
                "Rất tốt, giải bài nhanh và chính xác"
        ));

        grades.add(new StudentGradeDTO(
                "KQ002",
                "Toán học",
                "10A1",
                "Bài tập về nhà",
                8.5,
                "B",
                LocalDateTime.now().minusDays(8),
                "Giáo viên Nguyễn Văn B",
                "Cần cải thiện cách trình bày"
        ));

        return grades;
    }

    private StudentStatsDTO getStudentStats(String studentId) {
        List<DangKyLH> registrations = dangKyLHRepository.findByHocSinhId(studentId);
        int totalClasses = registrations.size();

        // Mock stats for demonstration
        return new StudentStatsDTO(
                totalClasses > 0 ? totalClasses : 3, // Default to 3 if no registrations
                8, // Mock pending assignments
                8.5, // Mock average grade
                2, // Mock today classes
                15, // Mock total assignments
                7, // Mock completed assignments
                10, // Mock total grades
                95.0 // Mock attendance rate
        );
    }

    private String getGradeLetter(Double score) {
        if (score == null) return "N/A";
        if (score >= 9.0) return "A";
        if (score >= 8.0) return "B";
        if (score >= 7.0) return "C";
        if (score >= 6.0) return "D";
        return "F";
    }
}