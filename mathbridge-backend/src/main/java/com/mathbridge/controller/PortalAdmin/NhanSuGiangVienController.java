package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.NhanSuGiangVienRequest;
import com.mathbridge.dto.PortalAdmin.Response.NhanSuGiangVienResponse;
import com.mathbridge.service.PortalAdmin.NhanSuGiangVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal/admin/nhansu")
@RequiredArgsConstructor
public class NhanSuGiangVienController {

    private final NhanSuGiangVienService nhanSuService;

    // ===== DROPDOWN =====

    /**
     * Danh sách cơ sở (CoSo) cho dropdown.
     * GET /coso
     */
    @GetMapping("/coso")
    public ResponseEntity<List<NhanSuGiangVienResponse.CampusOption>> getCampuses() {
        return ResponseEntity.ok(nhanSuService.getAllCampuses());
    }

    /**
     * Danh sách tất cả Role cho dropdown.
     * GET /roles
     */
    @GetMapping("/roles")
    public ResponseEntity<List<NhanSuGiangVienResponse.RoleOption>> getRoles() {
        return ResponseEntity.ok(nhanSuService.getAllRoles());
    }

    /**
     * Danh sách tài khoản khả dụng để gán cho nhân sự mới.
     * GET /accounts/available
     */
    @GetMapping("/accounts/available")
    public ResponseEntity<List<NhanSuGiangVienResponse.AccountOption>> getAvailableAccounts() {
        return ResponseEntity.ok(nhanSuService.getAvailableAccounts());
    }

    // ===== NHÂN SỰ =====

    /**
     * Tìm kiếm / lọc danh sách nhân sự.
     * POST /staff/search
     */
    @PostMapping("/staff/search")
    public ResponseEntity<List<NhanSuGiangVienResponse.StaffInfo>> searchStaff(
            @RequestBody(required = false) NhanSuGiangVienRequest filter
    ) {
        return ResponseEntity.ok(nhanSuService.searchStaff(filter));
    }

    /**
     * Lấy chi tiết 1 nhân sự.
     * GET /staff/{idNv}
     */
    @GetMapping("/staff/{idNv}")
    public ResponseEntity<NhanSuGiangVienResponse.StaffInfo> getStaffDetail(
            @PathVariable String idNv
    ) {
        return ResponseEntity.ok(nhanSuService.getStaffDetail(idNv));
    }

    /**
     * Tạo mới nhân sự.
     * POST /staff
     */
    @PostMapping("/staff")
    public ResponseEntity<NhanSuGiangVienResponse.StaffInfo> createStaff(
            @RequestBody NhanSuGiangVienRequest.StaffUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.createStaff(request));
    }

    /**
     * Cập nhật nhân sự.
     * PUT /staff/{idNv}
     */
    @PutMapping("/staff/{idNv}")
    public ResponseEntity<NhanSuGiangVienResponse.StaffInfo> updateStaff(
            @PathVariable String idNv,
            @RequestBody NhanSuGiangVienRequest.StaffUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.updateStaff(idNv, request));
    }

    /**
     * Cập nhật trạng thái hoạt động của nhân sự.
     * PATCH /staff/{idNv}/status?active=true|false
     * Trả về 204 No Content.
     */
    @PatchMapping("/staff/{idNv}/status")
    public ResponseEntity<Void> updateStaffStatus(
            @PathVariable String idNv,
            @RequestParam("active") boolean active
    ) {
        nhanSuService.updateStaffStatus(idNv, active);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xóa nhân sự (nghỉ việc).
     * DELETE /staff/{idNv}
     */
    @DeleteMapping("/staff/{idNv}")
    public ResponseEntity<Void> deleteStaff(@PathVariable String idNv) {
        nhanSuService.deleteStaff(idNv);
        return ResponseEntity.noContent().build();
    }

    // ===== HỢP ĐỒNG =====

    /**
     * Tìm kiếm hợp đồng.
     * POST /contracts/search
     */
    @PostMapping("/contracts/search")
    public ResponseEntity<List<NhanSuGiangVienResponse.ContractInfo>> searchContracts(
            @RequestBody(required = false) NhanSuGiangVienRequest.ContractSearch filter
    ) {
        return ResponseEntity.ok(nhanSuService.searchContracts(filter));
    }

    /**
     * Lấy chi tiết 1 hợp đồng.
     * GET /contracts/{idHd}
     */
    @GetMapping("/contracts/{idHd}")
    public ResponseEntity<NhanSuGiangVienResponse.ContractInfo> getContractDetail(
            @PathVariable String idHd
    ) {
        return ResponseEntity.ok(nhanSuService.getContractById(idHd));
    }

    /**
     * Tạo mới hợp đồng.
     * POST /contracts
     */
    @PostMapping("/contracts")
    public ResponseEntity<NhanSuGiangVienResponse.ContractInfo> createContract(
            @RequestBody NhanSuGiangVienRequest.ContractUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.createContract(request));
    }

    /**
     * Cập nhật hợp đồng.
     * PUT /contracts/{idHd}
     */
    @PutMapping("/contracts/{idHd}")
    public ResponseEntity<NhanSuGiangVienResponse.ContractInfo> updateContract(
            @PathVariable String idHd,
            @RequestBody NhanSuGiangVienRequest.ContractUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.updateContract(idHd, request));
    }

    /**
     * Xóa 1 hợp đồng.
     * DELETE /contracts/{idHd}
     */
    @DeleteMapping("/contracts/{idHd}")
    public ResponseEntity<Void> deleteContract(@PathVariable String idHd) {
        nhanSuService.deleteContract(idHd);
        return ResponseEntity.noContent().build();
    }
}
