// com/mathbridge/controller/PortalAdmin/CourseAdminController.java
package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.CourseRequest;
import com.mathbridge.dto.PortalAdmin.Response.CourseResponse;
import com.mathbridge.service.PortalAdmin.CourseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal/admin/courses")
public class CourseAdminController {

    private final CourseService service;
    public CourseAdminController(CourseService service){ this.service = service; }

    @GetMapping
    public Page<CourseResponse> list(@RequestParam(required=false) String q,
                                     @RequestParam(defaultValue="0") int page,
                                     @RequestParam(defaultValue="20") int size) {
        // sort theo property Java "tenCt" (không phải tên cột DB)
        return service.list(q, PageRequest.of(page, size, Sort.by("tenCt").ascending()));
    }

    @GetMapping("/{id}")
    public CourseResponse get(@PathVariable String id){ return service.get(id); }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest req){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public CourseResponse update(@PathVariable String id, @Valid @RequestBody CourseRequest req){
        req.setIdCt(id);
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
