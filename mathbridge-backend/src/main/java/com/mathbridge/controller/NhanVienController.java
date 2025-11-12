package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.GiaoVienCardDTO;
import com.mathbridge.dto.LopHocDTO;
import com.mathbridge.dto.NhanVienProfileDTO;
import com.mathbridge.dto.NhanVienProfileUpdateDTO;
import com.mathbridge.service.LopHocService;
import com.mathbridge.service.NhanVienService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/nhanvien")
@CrossOrigin(origins = "*")
public class NhanVienController {

    private final NhanVienService nhanVienService;
    private final LopHocService lopHocService;

    public NhanVienController(NhanVienService nhanVienService,
                              LopHocService lopHocService) {
        this.nhanVienService = nhanVienService;
        this.lopHocService = lopHocService;
    }

    @GetMapping("/giaovien")
    public List<GiaoVienCardDTO> getDanhSachGiaoVien() {
        return nhanVienService.getDanhSachGiaoVien();
    }

    @GetMapping("/{idNv}/lophoc")
    public List<LopHocDTO> getLopHocByGiaoVien(@PathVariable("idNv") String idNv) {
        return lopHocService.getLopHocByGiaoVien(idNv);
    }

    @GetMapping("/account/{idTk}")
    public ResponseEntity<ApiResponse<NhanVienProfileDTO>> getProfileByAccount(@PathVariable("idTk") String idTk) {
        return nhanVienService.getProfileByAccountId(idTk)
                .map(dto -> ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin nhân viên thành công", dto)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Không tìm thấy thông tin nhân viên", null)));
    }

    @PutMapping("/account/{idTk}")
    public ResponseEntity<ApiResponse<NhanVienProfileDTO>> updateProfileByAccount(@PathVariable("idTk") String idTk,
                                                                                  @RequestBody NhanVienProfileUpdateDTO request) {
        NhanVienProfileDTO dto = nhanVienService.updateProfileByAccountId(idTk, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thông tin nhân viên thành công", dto));
    }
}