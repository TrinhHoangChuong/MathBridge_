package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.ClassRequest;
import com.mathbridge.dto.PortalAdmin.Response.ClassResponse;
import com.mathbridge.service.PortalAdmin.ClassManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal/admin/ClassManager")
public class ClassManagerController {

    private final ClassManagerService classManagerService;

    public ClassManagerController(ClassManagerService classManagerService) {
        this.classManagerService = classManagerService;
    }

    @GetMapping
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        return ResponseEntity.ok(classManagerService.getAllClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable String id) {
        return ResponseEntity.ok(classManagerService.getClassById(id));
    }

    @PostMapping
    public ResponseEntity<ClassResponse> createClass(@RequestBody ClassRequest request) {
        return ResponseEntity.ok(classManagerService.createClass(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassResponse> updateClass(
            @PathVariable String id,
            @RequestBody ClassRequest request
    ) {
        return ResponseEntity.ok(classManagerService.updateClass(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable String id) {
        classManagerService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }
}
