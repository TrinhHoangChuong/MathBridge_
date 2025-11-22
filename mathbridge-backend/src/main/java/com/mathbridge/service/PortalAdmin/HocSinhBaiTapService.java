package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.HocSinhBaiTapRequest;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse;

public interface HocSinhBaiTapService {

    // LIST + FILTER HỌC SINH (tab Học sinh - bảng trái)
    HocSinhBaiTapResponse searchStudents(HocSinhBaiTapRequest request);

    // CHI TIẾT 1 HỌC SINH (bảng phải)
    HocSinhBaiTapResponse getStudentDetail(String studentId);

    // TẠO MỚI 1 HỌC SINH
    HocSinhBaiTapResponse createStudent(HocSinhBaiTapRequest request);

    // CẬP NHẬT 1 HỌC SINH
    HocSinhBaiTapResponse updateStudent(String studentId, HocSinhBaiTapRequest request);

    // THÊM HỌC SINH VÀO 1 LỚP (DangKyLH)
    HocSinhBaiTapResponse addStudentToClass(String studentId, HocSinhBaiTapRequest request);

    // XOÁ HỌC SINH RA KHỎI 1 LỚP
    void removeStudentFromClass(String studentId, String classId);

    // --------- TAB BÀI TẬP ----------
    HocSinhBaiTapResponse searchAssignments(HocSinhBaiTapRequest request);

    // --------- TAB BÀI NỘP & CHẤM ĐIỂM ----------
    HocSinhBaiTapResponse searchSubmissions(HocSinhBaiTapRequest request);

    // --------- TAB ĐÁNH GIÁ & KẾT QUẢ ----------
    HocSinhBaiTapResponse getClassEvaluationAndResult(HocSinhBaiTapRequest request);

}
