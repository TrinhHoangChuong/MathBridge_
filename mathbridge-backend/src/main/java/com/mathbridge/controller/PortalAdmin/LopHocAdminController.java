// com/mathbridge/controller/PortalAdmin/LopHocController.java
package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.LopHocRequest;
import com.mathbridge.dto.PortalAdmin.Response.LopHocResponse;
import com.mathbridge.service.PortalAdmin.LopHocAdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/portal/admin/classes")
public class LopHocAdminController {

    private final LopHocAdminService service;
    public LopHocAdminController(LopHocAdminService service){ this.service = service; }

    @GetMapping
    public Page<LopHocResponse> list(@RequestParam(required=false) String ct,
                                     @RequestParam(required=false) String nv,
                                     @RequestParam(required=false) String status,
                                     @RequestParam(required=false) String hinhThuc,
                                     @RequestParam(required=false) LocalDateTime from,
                                     @RequestParam(required=false) LocalDateTime to,
                                     @RequestParam(required=false) String q,
                                     @RequestParam(defaultValue="0") int page,
                                     @RequestParam(defaultValue="20") int size,
                                     @RequestParam(defaultValue="ngayBatDau,desc") String sort) {
        String[] s = sort.split(",");
        Pageable pageable = PageRequest.of(page, size,
                "desc".equalsIgnoreCase(s.length>1?s[1]:"") ? Sort.by(s[0]).descending() : Sort.by(s[0]).ascending());
        return service.list(ct, nv, status, hinhThuc, from, to, q, pageable);
    }

    @GetMapping("/{id}")
    public LopHocResponse get(@PathVariable String id){ return service.get(id); }

    @PostMapping
    public ResponseEntity<LopHocResponse> create(@Valid @RequestBody LopHocRequest req){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public LopHocResponse update(@PathVariable String id, @Valid @RequestBody LopHocRequest req){
        req.setIdLh(id);
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
