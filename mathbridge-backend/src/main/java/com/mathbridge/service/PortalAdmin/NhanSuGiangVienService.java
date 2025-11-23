package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.NhanSuGiangVienRequest;
import com.mathbridge.dto.PortalAdmin.Response.NhanSuGiangVienResponse;

import java.util.List;

public interface NhanSuGiangVienService {

    // ===== DROPDOWN =====
    List<NhanSuGiangVienResponse.CampusOption> getAllCampuses();
    List<NhanSuGiangVienResponse.RoleOption> getAllRoles();

    /**
     * Danh sách tài khoản khả dụng để gán cho nhân sự mới:
     *  - Chưa được dùng bởi bất kỳ NhanVien nào.
     *  - Trạng thái phù hợp (ACTIVE / null).
     */
    List<NhanSuGiangVienResponse.AccountOption> getAvailableAccounts();

    // ===== NHÂN SỰ =====
    List<NhanSuGiangVienResponse.StaffInfo> searchStaff(NhanSuGiangVienRequest filter);

    NhanSuGiangVienResponse.StaffInfo getStaffDetail(String idNv);

    NhanSuGiangVienResponse.StaffInfo createStaff(NhanSuGiangVienRequest.StaffUpsert request);

    NhanSuGiangVienResponse.StaffInfo updateStaff(String idNv, NhanSuGiangVienRequest.StaffUpsert request);

    void updateStaffStatus(String idNv, boolean active);

    void deleteStaff(String idNv);

    // ===== HỢP ĐỒNG =====
    List<NhanSuGiangVienResponse.ContractInfo> searchContracts(NhanSuGiangVienRequest.ContractSearch filter);

    NhanSuGiangVienResponse.ContractInfo getContractById(String idHd);

    NhanSuGiangVienResponse.ContractInfo createContract(NhanSuGiangVienRequest.ContractUpsert request);

    NhanSuGiangVienResponse.ContractInfo updateContract(String idHd, NhanSuGiangVienRequest.ContractUpsert request);

    void deleteContract(String idHd);
}
