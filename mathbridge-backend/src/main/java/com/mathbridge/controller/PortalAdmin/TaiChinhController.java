package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.HoaDonSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.HoaDonUpsertRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.LichSuSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.LichSuUpsertRequest;
import com.mathbridge.dto.PortalAdmin.Request.TaiChinhRequest.PhuongThucUpsertRequest;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.DropdownHocSinhDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.DropdownLopHocDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.HoaDonDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.LichSuThanhToanDto;
import com.mathbridge.dto.PortalAdmin.Response.TaiChinhResponse.PhuongThucThanhToanDto;
import com.mathbridge.service.PortalAdmin.TaiChinhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST cho module Tài chính (Portal Admin).
 * Khớp 100% với API FE taichinh.api.js đang gọi.
 */
@RestController
@RequestMapping("/api/portal/admin/taichinh")
@RequiredArgsConstructor
public class TaiChinhController {

    private final TaiChinhService taiChinhService;

    // ================== HÓA ĐƠN (HoaDon) ==================

    /**
     * POST /hoadon/search
     * Body: HoaDonSearchRequest
     */
    @PostMapping("/hoadon/search")
    public ResponseEntity<List<HoaDonDto>> searchHoaDon(
            @RequestBody HoaDonSearchRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.searchHoaDon(request));
    }

    /**
     * POST /hoadon
     * Body: HoaDonUpsertRequest
     */
    @PostMapping("/hoadon")
    public ResponseEntity<HoaDonDto> createHoaDon(
            @RequestBody HoaDonUpsertRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.createHoaDon(request));
    }

    /**
     * PUT /hoadon/{idHoaDon}
     */
    @PutMapping("/hoadon/{idHoaDon}")
    public ResponseEntity<HoaDonDto> updateHoaDon(
            @PathVariable String idHoaDon,
            @RequestBody HoaDonUpsertRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.updateHoaDon(idHoaDon, request));
    }

    /**
     * DELETE /hoadon/{idHoaDon}
     */
    @DeleteMapping("/hoadon/{idHoaDon}")
    public ResponseEntity<Void> deleteHoaDon(@PathVariable String idHoaDon) {
        taiChinhService.deleteHoaDon(idHoaDon);
        return ResponseEntity.noContent().build();
    }

    // ================== LỊCH SỬ THANH TOÁN ==================

    /**
     * POST /lichsu/search
     */
    @PostMapping("/lichsu/search")
    public ResponseEntity<List<LichSuThanhToanDto>> searchLichSu(
            @RequestBody LichSuSearchRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.searchLichSu(request));
    }

    /**
     * POST /lichsu
     */
    @PostMapping("/lichsu")
    public ResponseEntity<LichSuThanhToanDto> createLichSu(
            @RequestBody LichSuUpsertRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.createLichSu(request));
    }

    /**
     * PUT /lichsu/{idLs}
     */
    @PutMapping("/lichsu/{idLs}")
    public ResponseEntity<LichSuThanhToanDto> updateLichSu(
            @PathVariable String idLs,
            @RequestBody LichSuUpsertRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.updateLichSu(idLs, request));
    }

    /**
     * DELETE /lichsu/{idLs}
     */
    @DeleteMapping("/lichsu/{idLs}")
    public ResponseEntity<Void> deleteLichSu(@PathVariable String idLs) {
        taiChinhService.deleteLichSu(idLs);
        return ResponseEntity.noContent().build();
    }

    // ================== PHƯƠNG THỨC THANH TOÁN ==================

    /**
     * GET /phuongthuc
     */
    @GetMapping("/phuongthuc")
    public ResponseEntity<List<PhuongThucThanhToanDto>> getAllPhuongThuc() {
        return ResponseEntity.ok(taiChinhService.getAllPhuongThuc());
    }

    /**
     * POST /phuongthuc
     */
    @PostMapping("/phuongthuc")
    public ResponseEntity<PhuongThucThanhToanDto> createPhuongThuc(
            @RequestBody PhuongThucUpsertRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.createPhuongThuc(request));
    }

    /**
     * PUT /phuongthuc/{idPt}
     */
    @PutMapping("/phuongthuc/{idPt}")
    public ResponseEntity<PhuongThucThanhToanDto> updatePhuongThuc(
            @PathVariable String idPt,
            @RequestBody PhuongThucUpsertRequest request
    ) {
        return ResponseEntity.ok(taiChinhService.updatePhuongThuc(idPt, request));
    }

    /**
     * DELETE /phuongthuc/{idPt}
     */
    @DeleteMapping("/phuongthuc/{idPt}")
    public ResponseEntity<Void> deletePhuongThuc(@PathVariable String idPt) {
        taiChinhService.deletePhuongThuc(idPt);
        return ResponseEntity.noContent().build();
    }

    // ================== DROPDOWN ==================

    /**
     * GET /dropdowns/lophoc
     */
    @GetMapping("/dropdowns/lophoc")
    public ResponseEntity<List<DropdownLopHocDto>> getDropdownLopHoc() {
        return ResponseEntity.ok(taiChinhService.getDropdownLopHoc());
    }

    /**
     * GET /dropdowns/hocsinh
     */
    @GetMapping("/dropdowns/hocsinh")
    public ResponseEntity<List<DropdownHocSinhDto>> getDropdownHocSinh() {
        return ResponseEntity.ok(taiChinhService.getDropdownHocSinh());
    }
}
