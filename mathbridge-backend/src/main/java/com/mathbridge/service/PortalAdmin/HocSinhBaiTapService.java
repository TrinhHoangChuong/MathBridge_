package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.HocSinhBaiTapRequest;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse;

public interface HocSinhBaiTapService {

    // =========================================================
    // 1. QUẢN LÝ HỌC SINH
    // =========================================================

    /**
     * Tìm kiếm và lọc danh sách học sinh
     */
    HocSinhBaiTapResponse searchStudents(HocSinhBaiTapRequest request);

    /**
     * Lấy chi tiết 1 học sinh (thông tin + lớp học + thống kê)
     */
    HocSinhBaiTapResponse getStudentDetail(String studentId);

    /**
     * Tạo mới học sinh
     */
    HocSinhBaiTapResponse createStudent(HocSinhBaiTapRequest request);

    /**
     * Cập nhật thông tin học sinh
     */
    HocSinhBaiTapResponse updateStudent(String studentId, HocSinhBaiTapRequest request);

    /**
     * Thêm học sinh vào lớp
     */
    HocSinhBaiTapResponse addStudentToClass(String studentId, HocSinhBaiTapRequest request);

    /**
     * Xóa học sinh khỏi lớp
     */
    void removeStudentFromClass(String studentId, String classId);

    // =========================================================
    // 2. TAB BÀI TẬP
    // =========================================================

    /**
     * Tìm kiếm bài tập theo chương trình/lớp/khung thời gian
     */
    HocSinhBaiTapResponse searchAssignments(HocSinhBaiTapRequest request);

    // =========================================================
    // 3. TAB BÀI NỘP & CHẤM ĐIỂM
    // =========================================================

    /**
     * Tìm kiếm bài nộp theo bộ lọc
     */
    HocSinhBaiTapResponse searchSubmissions(HocSinhBaiTapRequest request);

    /**
     * Chấm điểm bài nộp
     */
    HocSinhBaiTapResponse gradeSubmission(String submissionId, HocSinhBaiTapRequest request);

    // =========================================================
    // 4. TAB ĐÁNH GIÁ & KẾT QUẢ
    // =========================================================

    /**
     * Lấy đánh giá và kết quả của lớp học
     */
    HocSinhBaiTapResponse getClassEvaluationAndResult(HocSinhBaiTapRequest request);

    // =========================================================
    // 5. API HỖ TRỢ FILTER COMBOBOX
    // =========================================================

    /**
     * Lấy danh sách buổi học theo lớp (cho filter)
     */
    HocSinhBaiTapResponse getSessionsByClass(String classId);

    /**
     * Lấy danh sách bài tập theo lớp (cho filter)
     */
    HocSinhBaiTapResponse getAssignmentsByClass(String classId);
}