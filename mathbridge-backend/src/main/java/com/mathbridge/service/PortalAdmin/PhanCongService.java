package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.PhanCongRequest;
import com.mathbridge.dto.PortalAdmin.Response.PhanCongResponse;

public interface PhanCongService {

    // 1. Tìm kiếm danh sách cố vấn (NhanVien)
    PhanCongResponse.PagedResult<PhanCongResponse.AdvisorSummary> searchAdvisors(
            PhanCongRequest.AdvisorSearchRequest request
    );

    // 2. Tìm học sinh khả dụng cho 1 cố vấn
    PhanCongResponse.PagedResult<PhanCongResponse.StudentSummary> searchStudentsForAdvisor(
            String idNv,
            PhanCongRequest.StudentSearchRequest request
    );

    // 3. Lấy danh sách phân công (CoVan_HocSinh) của 1 cố vấn
    PhanCongResponse.PagedResult<PhanCongResponse.AssignmentSummary> searchAssignmentsForAdvisor(
            String idNv,
            PhanCongRequest.AssignmentSearchRequest request
    );

    // 4. Tạo phân công mới
    void createAssignment(PhanCongRequest.CreateAssignmentRequest request);

    // 5. Cập nhật phân công
    void updateAssignment(PhanCongRequest.UpdateAssignmentRequest request);

    // 6. Kết thúc phân công
    void endAssignment(PhanCongRequest.EndAssignmentRequest request);
}
