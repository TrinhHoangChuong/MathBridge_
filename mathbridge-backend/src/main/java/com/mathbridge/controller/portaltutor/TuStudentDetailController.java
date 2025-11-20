package com.mathbridge.controller.portaltutor;

import com.mathbridge.dto.PortalStudentDTO.StudentDashboardDTO;
import com.mathbridge.service.portaltutor.TuAssignedStudentService;
import com.mathbridge.service.portaltutor.TuStudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portal/tutor")
public class TuStudentDetailController {

    private final TuAssignedStudentService assignedStudentService;
    private final TuStudentService tuStudentService;

    public TuStudentDetailController(TuAssignedStudentService assignedStudentService, TuStudentService tuStudentService) {
        this.assignedStudentService = assignedStudentService;
        this.tuStudentService = tuStudentService;
    }

    /**
     * Trả về dashboard chi tiết của học sinh cho cố vấn nếu cố vấn đang phụ trách học sinh đó.
     * Yêu cầu: truyền `idNv` (ID cố vấn) như query param hoặc phân giải từ token ở phía frontend.
     */
    @GetMapping("/students/{idHs}/dashboard")
    public ResponseEntity<?> getStudentDashboardForTutor(@PathVariable String idHs,
                                                         @RequestParam(name = "idNv", required = false) String idNv) {
        if (idNv == null || idNv.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing idNv parameter");
        }

        boolean allowed = assignedStudentService.isTutorAssignedToStudent(idNv, idHs);
        if (!allowed) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tutor is not assigned to this student");
        }

        StudentDashboardDTO dashboard = tuStudentService.getStudentDashboardForTutor(idNv, idHs);
        return ResponseEntity.ok(dashboard);
    }
}
