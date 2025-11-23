package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.HocSinhBaiTapRequest;
import com.mathbridge.dto.PortalAdmin.Response.HocSinhBaiTapResponse;
import com.mathbridge.service.PortalAdmin.HocSinhBaiTapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal/admin/hocsinh-baitap")
public class HocSinhBaiTapController {

    private final HocSinhBaiTapService hocSinhBaiTapService;

    public HocSinhBaiTapController(HocSinhBaiTapService hocSinhBaiTapService) {
        this.hocSinhBaiTapService = hocSinhBaiTapService;
    }

    // =========================================================
    // 1. LIST + FILTER HỌC SINH (tab Học sinh - bảng trái)
    // POST vì dùng body filter phức tạp
    // =========================================================

    @PostMapping("/students/search")
    public ResponseEntity<HocSinhBaiTapResponse> searchStudents(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        HocSinhBaiTapResponse response = hocSinhBaiTapService.searchStudents(request);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // 2. CHI TIẾT 1 HỌC SINH (tab Học sinh - cột phải)
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
    // body: { classIdToAdd: "LH001" }
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
    // ========================= TAB BÀI TẬP =========================
    @PostMapping("/assignments/search")
    public ResponseEntity<HocSinhBaiTapResponse> searchAssignments(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        return ResponseEntity.ok(hocSinhBaiTapService.searchAssignments(request));
    }

    // ===================== TAB BÀI NỘP & CHẤM ĐIỂM =================
    @PostMapping("/submissions/search")
    public ResponseEntity<HocSinhBaiTapResponse> searchSubmissions(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        return ResponseEntity.ok(hocSinhBaiTapService.searchSubmissions(request));
    }

    // ===================== TAB ĐÁNH GIÁ & KẾT QUẢ ==================
    @PostMapping("/evaluations/class")
    public ResponseEntity<HocSinhBaiTapResponse> getClassEvaluationAndResult(
            @RequestBody HocSinhBaiTapRequest request
    ) {
        return ResponseEntity.ok(hocSinhBaiTapService.getClassEvaluationAndResult(request));
    }

}
