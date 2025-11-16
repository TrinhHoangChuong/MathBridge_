package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.ProgramAdminCreateRequest;
import com.mathbridge.dto.PortalAdmin.Request.ProgramAdminUpdateRequest;
import com.mathbridge.dto.PortalAdmin.Response.ProgramAdminResponse;

import java.util.List;

public interface ProgramAdminService {

    List<ProgramAdminResponse> getAllPrograms();

    ProgramAdminResponse getProgramById(String id);

    ProgramAdminResponse createProgram(ProgramAdminCreateRequest request);

    ProgramAdminResponse updateProgram(String id, ProgramAdminUpdateRequest request);

    void deleteProgram(String id);
}
