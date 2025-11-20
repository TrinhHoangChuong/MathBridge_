package com.mathbridge.controller.portaltutor;

import com.mathbridge.dto.portaltutor.TuAssignedStudentResponseDTO;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.NhanVienRepository;
import com.mathbridge.service.portaltutor.TuAssignedStudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/portal/tutor/assigned-students")
@CrossOrigin(origins = "*")
public class TuAssignedStudentController {

    private final TuAssignedStudentService assignedStudentService;
    private final NhanVienRepository nhanVienRepository;

    public TuAssignedStudentController(TuAssignedStudentService assignedStudentService,
            NhanVienRepository nhanVienRepository) {
        this.assignedStudentService = assignedStudentService;
        this.nhanVienRepository = nhanVienRepository;
    }

    /**
     * Lay ID_NV tu ID_TK (TaiKhoan)
     */
    @GetMapping("/tutor-id")
    public ResponseEntity<Map<String, String>> getTutorId(@RequestParam(required = false) String idTk) {
        try {
            Map<String, String> response = new HashMap<>();

            if (idTk == null || idTk.trim().isEmpty()) {
                response.put("idNv", null);
                response.put("error", "ID_TK khong duoc de trong");
                return ResponseEntity.badRequest().body(response);
            }

            Optional<NhanVien> nhanVienOpt = nhanVienRepository.findByTaiKhoan_IdTk(idTk);
            if (nhanVienOpt.isPresent()) {
                response.put("idNv", nhanVienOpt.get().getIdNv());
                return ResponseEntity.ok(response);
            } else {
                response.put("idNv", null);
                response.put("error", "Khong tim thay nhan vien voi ID_TK: " + idTk);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Loi khi lay ID_NV: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lay danh sach hoc sinh dang duoc phan cong cho co van
     * Query param: idNv (ID cua co van)
     * Neu khong co idNv, tra ve tat ca (hoac co the lay tu token/session)
     */
    @GetMapping
    public ResponseEntity<List<TuAssignedStudentResponseDTO>> getAssignedStudents(
            @RequestParam(required = false) String idNv,
            @RequestParam(required = false, defaultValue = "active") String filter) {
        try {
            if (idNv == null || idNv.trim().isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<TuAssignedStudentResponseDTO> students;
            if ("all".equalsIgnoreCase(filter)) {
                students = assignedStudentService.getAllAssignedStudents(idNv);
            } else if ("active".equalsIgnoreCase(filter)) {
                students = assignedStudentService.getActiveAssignedStudents(idNv);
            } else {
                students = assignedStudentService.getAssignedStudentsByStatus(idNv, filter);
            }

            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Lay so luong hoc sinh dang duoc phan cong
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getAssignedStudentsCount(@RequestParam(required = false) String idNv) {
        try {
            if (idNv == null || idNv.trim().isEmpty()) {
                return ResponseEntity.ok(0L);
            }

            Long count = assignedStudentService.countActiveAssignedStudents(idNv);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Kết thúc phân công cho một học sinh bởi cố vấn
     * PUT /api/portal/tutor/assigned-students/{idHs}/finish?idNv=...
     */
    @PutMapping("/{idHs}/finish")
    public ResponseEntity<?> finishAssignedStudent(@PathVariable String idHs, @RequestParam String idNv) {
        try {
            TuAssignedStudentResponseDTO updated = assignedStudentService.finishAssignedStudent(idNv, idHs);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
