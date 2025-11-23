package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TkPhanQuyenRequest;
import com.mathbridge.dto.PortalAdmin.Response.TkPhanQuyenResponse;
import com.mathbridge.service.PortalAdmin.TkPhanQuyenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/portal/admin/tk-phanquyen")
public class TkPhanQuyenController {

    private final TkPhanQuyenService tkPhanQuyenService;

    // =======================
    // ACCOUNTS
    // =======================

    /**
     * POST /accounts/search
     * Body: AccountSearchRequest
     */
    @PostMapping("/accounts/search")
    public TkPhanQuyenResponse.AccountPage searchAccounts(
            @RequestBody TkPhanQuyenRequest.AccountSearchRequest request
    ) {
        return tkPhanQuyenService.searchAccounts(request);
    }

    /**
     * GET /accounts/{idTk}
     */
    @GetMapping("/accounts/{idTk}")
    public TkPhanQuyenResponse.AccountDto getAccountDetail(
            @PathVariable String idTk
    ) {
        return tkPhanQuyenService.getAccountDetail(idTk);
    }

    /**
     * POST /accounts
     * Tạo mới tài khoản + phân quyền
     */
    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public TkPhanQuyenResponse.AccountDto createAccount(
            @RequestBody TkPhanQuyenRequest.AccountUpsertRequest request
    ) {
        return tkPhanQuyenService.createAccount(request);
    }

    /**
     * PUT /accounts/{idTk}
     * Cập nhật tài khoản + phân quyền
     */
    @PutMapping("/accounts/{idTk}")
    public TkPhanQuyenResponse.AccountDto updateAccount(
            @PathVariable String idTk,
            @RequestBody TkPhanQuyenRequest.AccountUpsertRequest request
    ) {
        return tkPhanQuyenService.updateAccount(idTk, request);
    }

    /**
     * DELETE /accounts/{idTk}
     */
    @DeleteMapping("/accounts/{idTk}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@PathVariable String idTk) {
        tkPhanQuyenService.deleteAccount(idTk);
    }

    // =======================
    // ROLES
    // =======================

    /**
     * POST /roles/search
     */
    @PostMapping("/roles/search")
    public TkPhanQuyenResponse.RolePage searchRoles(
            @RequestBody TkPhanQuyenRequest.RoleSearchRequest request
    ) {
        return tkPhanQuyenService.searchRoles(request);
    }

    /**
     * GET /roles/all
     * Lấy toàn bộ roles (dropdown filter + multiselect)
     */
    @GetMapping("/roles/all")
    public List<TkPhanQuyenResponse.RoleDto> getAllRoles() {
        return tkPhanQuyenService.getAllRoles();
    }

    /**
     * POST /roles
     */
    @PostMapping("/roles")
    @ResponseStatus(HttpStatus.CREATED)
    public TkPhanQuyenResponse.RoleDto createRole(
            @RequestBody TkPhanQuyenRequest.RoleUpsertRequest request
    ) {
        return tkPhanQuyenService.createRole(request);
    }

    /**
     * PUT /roles/{idRole}
     */
    @PutMapping("/roles/{idRole}")
    public TkPhanQuyenResponse.RoleDto updateRole(
            @PathVariable String idRole,
            @RequestBody TkPhanQuyenRequest.RoleUpsertRequest request
    ) {
        return tkPhanQuyenService.updateRole(idRole, request);
    }

    /**
     * DELETE /roles/{idRole}
     */
    @DeleteMapping("/roles/{idRole}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRole(@PathVariable String idRole) {
        tkPhanQuyenService.deleteRole(idRole);
    }
}
