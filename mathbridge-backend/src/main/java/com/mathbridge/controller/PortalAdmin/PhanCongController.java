package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.PhanCongRequest;
import com.mathbridge.dto.PortalAdmin.Response.PhanCongResponse;
import com.mathbridge.service.PortalAdmin.PhanCongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portal/admin/phancong-covan")
@RequiredArgsConstructor
public class PhanCongController {

    private final PhanCongService phanCongService;

    // ====== 1. Tìm kiếm cố vấn ======
    @PostMapping("/advisors/search")
    public ResponseEntity<PhanCongResponse.PagedResult<PhanCongResponse.AdvisorSummary>> searchAdvisors(
            @RequestBody PhanCongRequest.AdvisorSearchRequest request
    ) {
        return ResponseEntity.ok(phanCongService.searchAdvisors(request));
    }

    // ====== 2. Tìm học sinh khả dụng cho 1 cố vấn ======
    @PostMapping("/advisors/{idNv}/students/search")
    public ResponseEntity<PhanCongResponse.PagedResult<PhanCongResponse.StudentSummary>> searchStudentsForAdvisor(
            @PathVariable("idNv") String idNv,
            @RequestBody PhanCongRequest.StudentSearchRequest request
    ) {
        return ResponseEntity.ok(phanCongService.searchStudentsForAdvisor(idNv, request));
    }

    // ====== 3. Lấy danh sách phân công của 1 cố vấn ======
    @PostMapping("/advisors/{idNv}/assignments/search")
    public ResponseEntity<PhanCongResponse.PagedResult<PhanCongResponse.AssignmentSummary>> searchAssignmentsForAdvisor(
            @PathVariable("idNv") String idNv,
            @RequestBody PhanCongRequest.AssignmentSearchRequest request
    ) {
        return ResponseEntity.ok(phanCongService.searchAssignmentsForAdvisor(idNv, request));
    }

    // 4. Tạo phân công mới
    @PostMapping("/assignments")
    public ResponseEntity<Map<String, Object>> createAssignment(
            @RequestBody PhanCongRequest.CreateAssignmentRequest request
    ) {
        phanCongService.createAssignment(request);
        Map<String, Object> body = Map.of(
                "success", true,
                "message", "Tạo phân công thành công"
        );
        return ResponseEntity.ok(body);
    }

    // 5. Cập nhật phân công
    @PutMapping("/assignments")
    public ResponseEntity<Map<String, Object>> updateAssignment(
            @RequestBody PhanCongRequest.UpdateAssignmentRequest request
    ) {
        phanCongService.updateAssignment(request);
        Map<String, Object> body = Map.of(
                "success", true,
                "message", "Cập nhật phân công thành công"
        );
        return ResponseEntity.ok(body);
    }

    // 6. Kết thúc phân công
    @PutMapping("/assignments/end")
    public ResponseEntity<Map<String, Object>> endAssignment(
            @RequestBody PhanCongRequest.EndAssignmentRequest request
    ) {
        phanCongService.endAssignment(request);
        Map<String, Object> body = Map.of(
                "success", true,
                "message", "Kết thúc phân công thành công"
        );
        return ResponseEntity.ok(body);
    }
}
