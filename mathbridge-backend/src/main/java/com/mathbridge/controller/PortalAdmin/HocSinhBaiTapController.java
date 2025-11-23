package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.HocSinhBaiTapRequest;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse;
import com.mathbridge.service.PortalAdmin.HocSinhBaiTapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal/admin/hocsinh-baitap")
@RequiredArgsConstructor
public class HocSinhBaiTapController {

    private final HocSinhBaiTapService hocSinhBaiTapService;

    // =========================================================
    // 1. LIST + FILTER HỌC SINH
    // =========================================================

    @PostMapping("/students/search")
    public ResponseEntity<HocSinhBaiTapResponse> searchStudents(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.searchStudents(request);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 2. CHI TIẾT 1 HỌC SINH
    // =========================================================

    @GetMapping("/students/{idHs}")
    public ResponseEntity<HocSinhBaiTapResponse> getStudentDetail(
            @PathVariable("idHs") String idHs
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.getStudentDetail(idHs);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 3. TẠO MỚI HỌC SINH
    // =========================================================

    @PostMapping("/students")
    public ResponseEntity<HocSinhBaiTapResponse> createStudent(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.createStudent(request);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 4. CẬP NHẬT HỌC SINH
    // =========================================================

    @PutMapping("/students/{idHs}")
    public ResponseEntity<HocSinhBaiTapResponse> updateStudent(
            @PathVariable("idHs") String idHs,
            @RequestBody HocSinhBaiTapRequest request
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.updateStudent(idHs, request);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 5. THÊM HỌC SINH VÀO LỚP
    // =========================================================

    @PostMapping("/students/{idHs}/classes")
    public ResponseEntity<HocSinhBaiTapResponse> addStudentToClass(
            @PathVariable("idHs") String idHs,
            @RequestBody HocSinhBaiTapRequest request
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.addStudentToClass(idHs, request);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 6. XOÁ HỌC SINH KHỎI LỚP
    // =========================================================

    @DeleteMapping("/students/{idHs}/classes/{idLh}")
    public ResponseEntity<Void> removeStudentFromClass(
            @PathVariable("idHs") String idHs,
            @PathVariable("idLh") String idLh
    ) {
        hocSinhBaiTapService.removeStudentFromClass(idHs, idLh);
        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // 7. TAB BÀI TẬP
    // =========================================================

    @PostMapping("/assignments/search")
    public ResponseEntity<HocSinhBaiTapResponse> searchAssignments(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        return ResponseEntity.ok(hocSinhBaiTapService.searchAssignments(request));
    }

    // =========================================================
    // 8. TAB BÀI NỘP & CHẤM ĐIỂM
    // =========================================================

    @PostMapping("/submissions/search")
    public ResponseEntity<HocSinhBaiTapResponse> searchSubmissions(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        return ResponseEntity.ok(hocSinhBaiTapService.searchSubmissions(request));
    }

    // =========================================================
    // 9. TAB ĐÁNH GIÁ & KẾT QUẢ
    // =========================================================

    @PostMapping("/evaluations/class")
    public ResponseEntity<HocSinhBaiTapResponse> getClassEvaluationAndResult(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        return ResponseEntity.ok(hocSinhBaiTapService.getClassEvaluationAndResult(request));
    }

    // =========================================================
    // 10. API CHO FILTER COMBOBOX
    // =========================================================

    @GetMapping("/classes/{classId}/sessions")
    public ResponseEntity<HocSinhBaiTapResponse> getSessionsByClass(
            @PathVariable("classId") String classId
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.getSessionsByClass(classId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/classes/{classId}/assignments")
    public ResponseEntity<HocSinhBaiTapResponse> getAssignmentsByClass(
            @PathVariable("classId") String classId
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.getAssignmentsByClass(classId);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 11. CHẤM ĐIỂM BÀI NỘP
    // =========================================================

    @PutMapping("/submissions/{idBn}/grade")
    public ResponseEntity<HocSinhBaiTapResponse> gradeSubmission(
            @PathVariable("idBn") String idBn,
            @RequestBody HocSinhBaiTapRequest request
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.gradeSubmission(idBn, request);
        return ResponseEntity.ok(response);
    }
}