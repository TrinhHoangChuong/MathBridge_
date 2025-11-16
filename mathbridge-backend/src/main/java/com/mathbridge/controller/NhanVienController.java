package com.mathbridge.controller;

import com.mathbridge.dto.GiaoVienCardDTO;
import com.mathbridge.dto.LopHocDTO;
import com.mathbridge.service.NhanVienService;
import com.mathbridge.service.LopHocService;

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
}
