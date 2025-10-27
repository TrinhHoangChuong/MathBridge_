package com.mathbridge.service;

import com.mathbridge.dto.NhanVienCardDTO;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.NhanVienRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NhanVienService {

    private final NhanVienRepository nhanVienRepository;

    public NhanVienService(NhanVienRepository nhanVienRepository) {
        this.nhanVienRepository = nhanVienRepository;
    }

    // Hàm dùng cho trang /teachers.html
    public List<NhanVienCardDTO> layDanhSachGiaoVienCards() {

        // TODO: nếu bạn chỉ muốn lấy giáo viên (chứ không phải tất cả nhân viên),
        // thì thay findAll() bằng 1 query custom, ví dụ findByChucVu("Giáo viên")
        List<NhanVien> ds = nhanVienRepository.findAll();

        return ds.stream()
                .map(nv -> {
                    // Ghép full name
                    String fullName =
                            (nv.getHo() != null ? nv.getHo().trim() + " " : "") +
                                    (nv.getTenDem() != null ? nv.getTenDem().trim() + " " : "") +
                                    (nv.getTen() != null ? nv.getTen().trim() : "");

                    return new NhanVienCardDTO(
                            nv.getIdNv(),                // idNv
                            fullName.trim(),             // hoTen
                            nv.getChuyenMon(),           // chuyenMon  (ví dụ "Toán lớp 12", "SAT Math", ...)
                            nv.getKinhNghiem()           // kinhNghiem (số năm)
                    );
                })
                .collect(Collectors.toList());
    }

    // Hàm phục vụ trang chi tiết giảng viên (TeacherDetailClass)
    // -> thông tin 1 người cụ thể
    public NhanVienCardDTO layThongTinGiaoVien(String idNv) {
        NhanVien nv = nhanVienRepository.findById(idNv)
                .orElse(null);
        if (nv == null) return null;

        String fullName =
                (nv.getHo() != null ? nv.getHo().trim() + " " : "") +
                        (nv.getTenDem() != null ? nv.getTenDem().trim() + " " : "") +
                        (nv.getTen() != null ? nv.getTen().trim() : "");

        return new NhanVienCardDTO(
                nv.getIdNv(),
                fullName.trim(),
                nv.getChuyenMon(),
                nv.getKinhNghiem()
        );
    }
}
