package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.ClassScheduleAutoGenerateRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.ClassScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.StudentScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.TeacherScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Response.LichHocLichLamResponse.*;
import com.mathbridge.service.PortalAdmin.LichHocLichLamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller cho module "Lịch học & Lịch làm".
 * Base path: /api/portal/admin/lichhoc
 * Khớp 100% với FE lichhoc.api.js
 */
@RestController
@RequestMapping("/api/portal/admin/lichhoc")
@RequiredArgsConstructor
public class LichHocLichLamController {

    private final LichHocLichLamService lichHocLichLamService;

    /* ========= CLASS OPTIONS & DETAIL ========= */

    // GET /classes/options
    @GetMapping("/classes/options")
    public ResponseEntity<List<ClassOptionResponse>> getClassOptions() {
        return ResponseEntity.ok(lichHocLichLamService.getClassOptions());
    }

    // GET /classes/{idLh}
    @GetMapping("/classes/{idLh}")
    public ResponseEntity<ClassDetailResponse> getClassDetail(@PathVariable String idLh) {
        return ResponseEntity.ok(lichHocLichLamService.getClassDetail(idLh));
    }

    /* ========= CLASS SCHEDULE ========= */

    // POST /class-schedule/search
    @PostMapping("/class-schedule/search")
    public ResponseEntity<List<ClassScheduleItemResponse>> searchClassSchedule(
            @RequestBody ClassScheduleSearchRequest request
    ) {
        return ResponseEntity.ok(lichHocLichLamService.searchClassSchedule(request));
    }

    // POST /class-schedule/auto-generate
    @PostMapping("/class-schedule/auto-generate")
    public ResponseEntity<AutoGenerateResultResponse> autoGenerateSchedule(
            @RequestBody ClassScheduleAutoGenerateRequest request
    ) {
        return ResponseEntity.ok(lichHocLichLamService.autoGenerateSchedule(request));
    }

    /* ========= CAMPUS & ROOMS ========= */

    // GET /campuses
    @GetMapping("/campuses")
    public ResponseEntity<List<CampusOptionResponse>> getCampuses() {
        return ResponseEntity.ok(lichHocLichLamService.getCampuses());
    }

    // GET /campuses/{idCs}/rooms
    @GetMapping("/campuses/{idCs}/rooms")
    public ResponseEntity<List<RoomOptionResponse>> getRoomsByCampus(@PathVariable String idCs) {
        return ResponseEntity.ok(lichHocLichLamService.getRoomsByCampus(idCs));
    }

    /* ========= TEACHER VIEW ========= */

    // GET /teachers/options
    @GetMapping("/teachers/options")
    public ResponseEntity<List<TeacherOptionResponse>> getTeacherOptions() {
        return ResponseEntity.ok(lichHocLichLamService.getTeacherOptions());
    }

    // POST /teacher-schedule/search
    @PostMapping("/teacher-schedule/search")
    public ResponseEntity<List<TeacherScheduleItemResponse>> searchTeacherSchedule(
            @RequestBody TeacherScheduleSearchRequest request
    ) {
        return ResponseEntity.ok(lichHocLichLamService.searchTeacherSchedule(request));
    }

    /* ========= STUDENT VIEW ========= */

    // GET /students/options
    @GetMapping("/students/options")
    public ResponseEntity<List<StudentOptionResponse>> getStudentOptions() {
        return ResponseEntity.ok(lichHocLichLamService.getStudentOptions());
    }

    // POST /student-schedule/search
    @PostMapping("/student-schedule/search")
    public ResponseEntity<List<StudentScheduleItemResponse>> searchStudentSchedule(
            @RequestBody StudentScheduleSearchRequest request
    ) {
        return ResponseEntity.ok(lichHocLichLamService.searchStudentSchedule(request));
    }


    // PUT /class-schedule/{idBh}
    @PutMapping("/class-schedule/{idBh}")
    public ResponseEntity<AutoGenerateResultResponse> updateSession(
            @PathVariable String idBh,
            @RequestBody LichHocLichLamRequest.UpdateSessionRequest request
    ) {
        request.setIdBh(idBh); // đảm bảo idBh trong path và body đồng bộ
        return ResponseEntity.ok(lichHocLichLamService.updateSession(request));
    }
}
