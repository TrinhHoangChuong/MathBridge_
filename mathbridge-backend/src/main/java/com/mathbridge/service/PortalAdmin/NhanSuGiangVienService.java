package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.NhanSuGiangVienRequest;
import com.mathbridge.dto.PortalAdmin.Response.NhanSuGiangVienResponse;

import java.util.List;

public interface NhanSuGiangVienService {

    // ===== DROPDOWN =====
    List<NhanSuGiangVienResponse.CampusOption> getAllCampuses();
    List<NhanSuGiangVienResponse.RoleOption> getAllRoles();

    // ===== NHÂN SỰ =====
    List<NhanSuGiangVienResponse> searchStaff(NhanSuGiangVienRequest filter);

    NhanSuGiangVienResponse getStaffById(String idNv);

    NhanSuGiangVienResponse createStaff(NhanSuGiangVienRequest.StaffUpsert request);

    NhanSuGiangVienResponse updateStaff(String idNv, NhanSuGiangVienRequest.StaffUpsert request);

    void deleteStaff(String idNv);

    void updateStaffStatus(String idNv, boolean active);

    // ===== HỢP ĐỒNG =====
    List<NhanSuGiangVienResponse.ContractInfo> searchContracts(
            NhanSuGiangVienRequest.ContractSearch filter
    );

    NhanSuGiangVienResponse.ContractInfo getContractById(String idHd);

    NhanSuGiangVienResponse.ContractInfo createContract(
            NhanSuGiangVienRequest.ContractUpsert request
    );

    NhanSuGiangVienResponse.ContractInfo updateContract(
            String idHd,
            NhanSuGiangVienRequest.ContractUpsert request
    );

    void deleteContract(String idHd);
}
