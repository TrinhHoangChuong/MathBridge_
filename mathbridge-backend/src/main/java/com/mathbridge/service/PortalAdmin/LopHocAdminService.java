
package com.mathbridge.service.PortalAdmin;


import com.mathbridge.dto.PortalAdmin.Request.LopHocRequest;
import com.mathbridge.dto.PortalAdmin.Response.LopHocResponse;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;

public interface LopHocAdminService {
    Page<LopHocResponse> list(String ct, String nv, String status, String hinhThuc,
                              LocalDateTime from, LocalDateTime to,
                              String q, Pageable pageable);
    LopHocResponse get(String idLh);
    LopHocResponse create(LopHocRequest req);
    LopHocResponse update(String idLh, LopHocRequest req);
    void delete(String idLh);
}
