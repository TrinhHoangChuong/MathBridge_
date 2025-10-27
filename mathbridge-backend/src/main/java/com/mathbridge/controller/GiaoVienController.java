package com.mathbridge.controller;

import com.mathbridge.dto.LopHocDTO;
import com.mathbridge.dto.NhanVienCardDTO;
import com.mathbridge.service.LopHocService;
import com.mathbridge.service.NhanVienService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/public/nhanvien")
@CrossOrigin(origins = "*")
public class GiaoVienController {

    private final NhanVienService nhanVienService;
    private final LopHocService lopHocService;

    public GiaoVienController(NhanVienService nhanVienService,
                              LopHocService lopHocService) {
        this.nhanVienService = nhanVienService;
        this.lopHocService = lopHocService;
    }

    // LIST GIÁO VIÊN cho trang Teachers
    @GetMapping
    public Map<String, Object> getTeachers() {
        List<NhanVienCardDTO> teachers = nhanVienService.layDanhSachGiaoVienCards();

        Map<String, Object> res = new HashMap<>();
        res.put("teachers", teachers);
        return res;
    }

    // DETAIL 1 GIÁO VIÊN cho TeacherDetailClass
    @GetMapping("/{idNv}")
    public Map<String, Object> getTeacherInfo(@PathVariable("idNv") String idNv) {
        NhanVienCardDTO teacher = nhanVienService.layThongTinGiaoVien(idNv);

        Map<String, Object> res = new HashMap<>();
        res.put("teacher", teacher);
        return res;
    }

    // DANH SÁCH LỚP GIÁO VIÊN PHỤ TRÁCH
    @GetMapping("/{idNv}/lophoc")
    public Map<String, Object> getLopHocCuaGiaoVien(@PathVariable("idNv") String idNv) {
        List<LopHocDTO> classes = lopHocService.getLopHocByGiaoVien(idNv);

        Map<String, Object> res = new HashMap<>();
        res.put("classes", classes);
        return res;
    }
}
