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

    // ===== DROPDOWN CƠ SỞ & VAI TRÒ =====

    @GetMapping("/coso")
    public ResponseEntity<List<NhanSuGiangVienResponse.CampusOption>> getCampuses() {
        return ResponseEntity.ok(nhanSuService.getAllCampuses());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<NhanSuGiangVienResponse.RoleOption>> getRoles() {
        return ResponseEntity.ok(nhanSuService.getAllRoles());
    }

    // ===== NHÂN SỰ =====

    // Tìm kiếm / lọc danh sách nhân viên
    @PostMapping("/staff/search")
    public ResponseEntity<List<NhanSuGiangVienResponse>> searchStaff(
            @RequestBody NhanSuGiangVienRequest filter
    ) {
        return ResponseEntity.ok(nhanSuService.searchStaff(filter));
    }

    // Lấy chi tiết 1 nhân viên
    @GetMapping("/staff/{idNv}")
    public ResponseEntity<NhanSuGiangVienResponse> getStaff(@PathVariable String idNv) {
        return ResponseEntity.ok(nhanSuService.getStaffById(idNv));
    }

    // Tạo mới nhân sự (auto tạo TK + gán role)
    @PostMapping("/staff")
    public ResponseEntity<NhanSuGiangVienResponse> createStaff(
            @RequestBody NhanSuGiangVienRequest.StaffUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.createStaff(request));
    }

    // Cập nhật thông tin nhân sự
    @PutMapping("/staff/{idNv}")
    public ResponseEntity<NhanSuGiangVienResponse> updateStaff(
            @PathVariable String idNv,
            @RequestBody NhanSuGiangVienRequest.StaffUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.updateStaff(idNv, request));
    }

    // Cập nhật trạng thái hoạt động
    // PATCH /staff/{idNv}/status?active=true|false
    @PatchMapping("/staff/{idNv}/status")
    public ResponseEntity<Void> updateStaffStatus(
            @PathVariable String idNv,
            @RequestParam("active") boolean active
    ) {
        nhanSuService.updateStaffStatus(idNv, active);
        return ResponseEntity.noContent().build();
    }

    // Xóa nhân sự + xóa hợp đồng + tài khoản + mapping role theo đúng thứ tự
    @DeleteMapping("/staff/{idNv}")
    public ResponseEntity<Void> deleteStaff(@PathVariable String idNv) {
        nhanSuService.deleteStaff(idNv);
        return ResponseEntity.noContent().build();
    }

    // ===== HỢP ĐỒNG =====

    // Tìm kiếm danh sách hợp đồng
    @PostMapping("/contracts/search")
    public ResponseEntity<List<NhanSuGiangVienResponse.ContractInfo>> searchContracts(
            @RequestBody NhanSuGiangVienRequest.ContractSearch filter
    ) {
        return ResponseEntity.ok(nhanSuService.searchContracts(filter));
    }

    // Lấy chi tiết 1 hợp đồng
    @GetMapping("/contracts/{idHd}")
    public ResponseEntity<NhanSuGiangVienResponse.ContractInfo> getContract(
            @PathVariable String idHd
    ) {
        return ResponseEntity.ok(nhanSuService.getContractById(idHd));
    }

    // Tạo mới hợp đồng
    @PostMapping("/contracts")
    public ResponseEntity<NhanSuGiangVienResponse.ContractInfo> createContract(
            @RequestBody NhanSuGiangVienRequest.ContractUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.createContract(request));
    }

    // Cập nhật hợp đồng
    @PutMapping("/contracts/{idHd}")
    public ResponseEntity<NhanSuGiangVienResponse.ContractInfo> updateContract(
            @PathVariable String idHd,
            @RequestBody NhanSuGiangVienRequest.ContractUpsert request
    ) {
        return ResponseEntity.ok(nhanSuService.updateContract(idHd, request));
    }

    // Xóa hợp đồng (không xóa nhân viên)
    @DeleteMapping("/contracts/{idHd}")
    public ResponseEntity<Void> deleteContract(@PathVariable String idHd) {
        nhanSuService.deleteContract(idHd);
        return ResponseEntity.noContent().build();
    }
}
