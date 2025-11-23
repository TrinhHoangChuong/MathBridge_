package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TuyenDungRequest;
import com.mathbridge.dto.PortalAdmin.Response.TuyenDungResponse;
import com.mathbridge.service.PortalAdmin.TuyenDungService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal/admin/tuyendung")
public class TuyenDungController {

    private final TuyenDungService tuyenDungService;

    public TuyenDungController(TuyenDungService tuyenDungService) {
        this.tuyenDungService = tuyenDungService;
    }

    // ============ JOB ============

    @GetMapping("/jobs")
    public ResponseEntity<List<TuyenDungResponse.JobSummary>> getAllJobs() {
        return ResponseEntity.ok(tuyenDungService.getAllJobs());
    }

    @GetMapping("/jobs/{idTd}")
    public ResponseEntity<TuyenDungResponse.JobDetail> getJobDetail(@PathVariable String idTd) {
        return ResponseEntity.ok(tuyenDungService.getJobDetail(idTd));
    }

    @PostMapping("/jobs")
    public ResponseEntity<TuyenDungResponse.JobDetail> createJob(
            @RequestBody TuyenDungRequest.JobCreateOrUpdate request
    ) {
        return ResponseEntity.ok(tuyenDungService.createJob(request));
    }

    @PutMapping("/jobs/{idTd}")
    public ResponseEntity<TuyenDungResponse.JobDetail> updateJob(
            @PathVariable String idTd,
            @RequestBody TuyenDungRequest.JobCreateOrUpdate request
    ) {
        return ResponseEntity.ok(tuyenDungService.updateJob(idTd, request));
    }

    @DeleteMapping("/jobs/{idTd}")
    public ResponseEntity<Void> deleteJob(@PathVariable String idTd) {
        tuyenDungService.deleteJob(idTd);
        return ResponseEntity.noContent().build();
    }

    // ============ CANDIDATE ============

    @GetMapping("/candidates")
    public ResponseEntity<List<TuyenDungResponse.CandidateSummary>> getAllCandidates() {
        return ResponseEntity.ok(tuyenDungService.getAllCandidates());
    }

    @GetMapping("/candidates/{idUv}")
    public ResponseEntity<TuyenDungResponse.CandidateDetail> getCandidateDetail(@PathVariable String idUv) {
        return ResponseEntity.ok(tuyenDungService.getCandidateDetail(idUv));
    }

    @PostMapping("/candidates")
    public ResponseEntity<TuyenDungResponse.CandidateDetail> createCandidate(
            @RequestBody TuyenDungRequest.CandidateCreateOrUpdate request
    ) {
        return ResponseEntity.ok(tuyenDungService.createCandidate(request));
    }

    @PutMapping("/candidates/{idUv}")
    public ResponseEntity<TuyenDungResponse.CandidateDetail> updateCandidate(
            @PathVariable String idUv,
            @RequestBody TuyenDungRequest.CandidateCreateOrUpdate request
    ) {
        return ResponseEntity.ok(tuyenDungService.updateCandidate(idUv, request));
    }

    @DeleteMapping("/candidates/{idUv}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable String idUv) {
        tuyenDungService.deleteCandidate(idUv);
        return ResponseEntity.noContent().build();
    }

    // ============ MAPPING JOB - CANDIDATE ============

    @GetMapping("/jobs/{idTd}/candidates")
    public ResponseEntity<List<TuyenDungResponse.CandidateSummary>> getCandidatesOfJob(
            @PathVariable String idTd
    ) {
        return ResponseEntity.ok(tuyenDungService.getCandidatesOfJob(idTd));
    }

    @PostMapping("/jobs/{idTd}/candidates")
    public ResponseEntity<Void> addCandidatesToJob(
            @PathVariable String idTd,
            @RequestBody TuyenDungRequest.MappingCreate request
    ) {
        // đảm bảo idTd trong path và trong body trùng nhau
        request.setIdTd(idTd);
        tuyenDungService.addCandidatesToJob(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/jobs/{idTd}/candidates/{idUv}")
    public ResponseEntity<Void> removeCandidateFromJob(
            @PathVariable String idTd,
            @PathVariable String idUv
    ) {
        tuyenDungService.removeCandidateFromJob(idTd, idUv);
        return ResponseEntity.noContent().build();
    }
}
