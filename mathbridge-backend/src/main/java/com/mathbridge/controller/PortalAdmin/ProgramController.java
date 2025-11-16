package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.ProgramAdminCreateRequest;
import com.mathbridge.dto.PortalAdmin.Request.ProgramAdminUpdateRequest;
import com.mathbridge.dto.PortalAdmin.Response.ProgramAdminResponse;
import com.mathbridge.service.PortalAdmin.ProgramAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal/admin/program")
public class ProgramController {

    private final ProgramAdminService programService;

    public ProgramController(ProgramAdminService programService) {
        this.programService = programService;
    }

    /**
     * GET /api/portal/admin/program
     * -> Lấy danh sách tất cả chương trình
     */
    @GetMapping
    public ResponseEntity<List<ProgramAdminResponse>> getAllPrograms() {
        List<ProgramAdminResponse> programs = programService.getAllPrograms();
        return ResponseEntity.ok(programs);
    }

    /**
     * GET /api/portal/admin/program/{id}
     * -> Lấy chi tiết 1 chương trình theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProgramAdminResponse> getProgramById(@PathVariable("id") String id) {
        ProgramAdminResponse program = programService.getProgramById(id);
        return ResponseEntity.ok(program);
    }

    /**
     * POST /api/portal/admin/program
     * -> Tạo mới chương trình
     */
    @PostMapping
    public ResponseEntity<ProgramAdminResponse> createProgram(
            @RequestBody ProgramAdminCreateRequest request
    ) {
        ProgramAdminResponse created = programService.createProgram(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/portal/admin/program/{id}
     * -> Cập nhật chương trình
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProgramAdminResponse> updateProgram(
            @PathVariable("id") String id,
            @RequestBody ProgramAdminUpdateRequest request
    ) {
        ProgramAdminResponse updated = programService.updateProgram(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/portal/admin/program/{id}
     * -> Xoá chương trình
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgram(@PathVariable("id") String id) {
        programService.deleteProgram(id);
        return ResponseEntity.noContent().build();
    }
}
