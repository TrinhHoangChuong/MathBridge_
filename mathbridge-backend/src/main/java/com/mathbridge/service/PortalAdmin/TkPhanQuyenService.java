package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TkPhanQuyenRequest;
import com.mathbridge.dto.PortalAdmin.Response.TkPhanQuyenResponse;

import java.util.List;

public interface TkPhanQuyenService {

    // ===== ACCOUNTS =====

    TkPhanQuyenResponse.AccountPage searchAccounts(
            TkPhanQuyenRequest.AccountSearchRequest request
    );

    TkPhanQuyenResponse.AccountDto getAccountDetail(String idTk);

    TkPhanQuyenResponse.AccountDto createAccount(
            TkPhanQuyenRequest.AccountUpsertRequest request
    );

    TkPhanQuyenResponse.AccountDto updateAccount(
            String idTk,
            TkPhanQuyenRequest.AccountUpsertRequest request
    );

    void deleteAccount(String idTk);

    // ===== ROLES =====

    TkPhanQuyenResponse.RolePage searchRoles(
            TkPhanQuyenRequest.RoleSearchRequest request
    );

    List<TkPhanQuyenResponse.RoleDto> getAllRoles();

    TkPhanQuyenResponse.RoleDto createRole(
            TkPhanQuyenRequest.RoleUpsertRequest request
    );

    TkPhanQuyenResponse.RoleDto updateRole(
            String idRole,
            TkPhanQuyenRequest.RoleUpsertRequest request
    );

    void deleteRole(String idRole);
}
