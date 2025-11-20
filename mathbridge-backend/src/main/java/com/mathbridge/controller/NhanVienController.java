package com.mathbridge.controller;

import com.mathbridge.dto.ApiResponse;
import com.mathbridge.dto.GiaoVienCardDTO;
import com.mathbridge.dto.LopHocDTO;
import com.mathbridge.dto.NhanVienProfileDTO;
import com.mathbridge.dto.NhanVienProfileUpdateDTO;
import com.mathbridge.service.NhanVienService;
import com.mathbridge.service.LopHocService;
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

    // GET /api/public/nhanvien/giaovien
    @GetMapping("/giaovien")
    public List<GiaoVienCardDTO> getDanhSachGiaoVien() {
        return nhanVienService.getDanhSachGiaoVien();
    }

    // GET /api/public/nhanvien/{idNv}/lophoc
    @GetMapping("/{idNv}/lophoc")
    public List<LopHocDTO> getLopHocByGiaoVien(@PathVariable("idNv") String idNv) {
        return lopHocService.getLopHocByGiaoVien(idNv);
    }

    // GET /api/public/nhanvien/account/{idTk}
    @GetMapping("/account/{idTk}")
    public ResponseEntity<ApiResponse<NhanVienProfileDTO>> getProfileByAccount(@PathVariable String idTk) {
        return nhanVienService.getProfileByAccountId(idTk)
                .map(profile -> ResponseEntity.ok(
                        new ApiResponse<>(true, "Lấy thông tin giáo viên thành công", profile)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Không tìm thấy thông tin giáo viên", null)));
    }

    // PUT /api/public/nhanvien/account/{idTk}
    @PutMapping("/account/{idTk}")
    public ResponseEntity<ApiResponse<NhanVienProfileDTO>> updateProfileByAccount(
            @PathVariable String idTk,
            @RequestBody NhanVienProfileUpdateDTO request) {
        try {
            NhanVienProfileDTO updated = nhanVienService.updateProfileByAccountId(idTk, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thông tin thành công", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Lỗi hệ thống khi cập nhật thông tin giáo viên", null));
        }
    }
}
