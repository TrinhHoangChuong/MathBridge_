package com.mathbridge.service.PortalAdmin;

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

import java.util.List;

/**
 * Service cho module Tài chính (Portal Admin).
 */
public interface TaiChinhService {

    // ===== HÓA ĐƠN =====
    List<HoaDonDto> searchHoaDon(HoaDonSearchRequest request);

    HoaDonDto createHoaDon(HoaDonUpsertRequest request);

    HoaDonDto updateHoaDon(String idHoaDon, HoaDonUpsertRequest request);

    void deleteHoaDon(String idHoaDon);

    // ===== LỊCH SỬ THANH TOÁN =====
    List<LichSuThanhToanDto> searchLichSu(LichSuSearchRequest request);

    LichSuThanhToanDto createLichSu(LichSuUpsertRequest request);

    LichSuThanhToanDto updateLichSu(String idLs, LichSuUpsertRequest request);

    void deleteLichSu(String idLs);

    // ===== PHƯƠNG THỨC THANH TOÁN =====
    List<PhuongThucThanhToanDto> getAllPhuongThuc();

    PhuongThucThanhToanDto createPhuongThuc(PhuongThucUpsertRequest request);

    PhuongThucThanhToanDto updatePhuongThuc(String idPt, PhuongThucUpsertRequest request);

    void deletePhuongThuc(String idPt);

    // ===== DROPDOWN =====
    List<DropdownLopHocDto> getDropdownLopHoc();

    List<DropdownHocSinhDto> getDropdownHocSinh();
}
