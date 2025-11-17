package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.ClassRequest;
import com.mathbridge.dto.PortalAdmin.Response.ClassResponse;
import com.mathbridge.entity.ChuongTrinh;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.entity.NhanVien;
import com.mathbridge.repository.Admin.ChuongTrinhAdminRepository;
import com.mathbridge.repository.Admin.LopHocAdminRepository;
import com.mathbridge.repository.Admin.NhanVienAdminRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassManagerServiceImpl implements ClassManagerService {

    private final LopHocAdminRepository lopHocAdminRepository;
    private final NhanVienAdminRepository nhanVienAdminRepository;
    private final ChuongTrinhAdminRepository chuongTrinhAdminRepository;

    public ClassManagerServiceImpl(
            LopHocAdminRepository lopHocAdminRepository,
            NhanVienAdminRepository nhanVienAdminRepository,
            ChuongTrinhAdminRepository chuongTrinhAdminRepository
    ) {
        this.lopHocAdminRepository = lopHocAdminRepository;
        this.nhanVienAdminRepository = nhanVienAdminRepository;
        this.chuongTrinhAdminRepository = chuongTrinhAdminRepository;
    }

    @Override
    public List<ClassResponse> getAllClasses() {
        return lopHocAdminRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ClassResponse getClassById(String id) {
        LopHoc entity = lopHocAdminRepository.findById(id).orElseThrow();
        return toResponse(entity);
    }

    @Override
    public ClassResponse createClass(ClassRequest request) {
        NhanVien nv = nhanVienAdminRepository.findById(request.getIdNv()).orElseThrow();
        ChuongTrinh ct = chuongTrinhAdminRepository.findById(request.getIdCt()).orElseThrow();

        LopHoc entity = new LopHoc();
        entity.setIdLh(request.getIdLh());
        entity.setNhanVien(nv);
        entity.setChuongTrinh(ct);
        entity.setTenLop(request.getTenLop());
        entity.setLoaiNgay(request.getLoaiNgay());
        entity.setSoBuoi(request.getSoBuoi());
        entity.setHinhThucHoc(request.getHinhThucHoc());
        entity.setNgayBatDau(LocalDateTime.parse(request.getNgayBatDau()));
        entity.setMucGiaThang(new BigDecimal(request.getMucGiaThang()));
        entity.setDanhGia(request.getDanhGia());
        entity.setTrangThai(request.getTrangThai());
        entity.setMoTa(request.getMoTa());

        lopHocAdminRepository.save(entity);
        return toResponse(entity);
    }

    @Override
    public ClassResponse updateClass(String id, ClassRequest request) {
        LopHoc entity = lopHocAdminRepository.findById(id).orElseThrow();
        NhanVien nv = nhanVienAdminRepository.findById(request.getIdNv()).orElseThrow();
        ChuongTrinh ct = chuongTrinhAdminRepository.findById(request.getIdCt()).orElseThrow();

        entity.setNhanVien(nv);
        entity.setChuongTrinh(ct);
        entity.setTenLop(request.getTenLop());
        entity.setLoaiNgay(request.getLoaiNgay());
        entity.setSoBuoi(request.getSoBuoi());
        entity.setHinhThucHoc(request.getHinhThucHoc());
        entity.setNgayBatDau(LocalDateTime.parse(request.getNgayBatDau()));
        entity.setMucGiaThang(new BigDecimal(request.getMucGiaThang()));
        entity.setDanhGia(request.getDanhGia());
        entity.setTrangThai(request.getTrangThai());
        entity.setMoTa(request.getMoTa());

        lopHocAdminRepository.save(entity);
        return toResponse(entity);
    }

    @Override
    public void deleteClass(String id) {
        lopHocAdminRepository.deleteById(id);
    }

    private ClassResponse toResponse(LopHoc entity) {
        ClassResponse res = new ClassResponse();

        res.setIdLh(entity.getIdLh());
        res.setIdNv(entity.getNhanVien().getIdNv());
        res.setIdCt(entity.getChuongTrinh().getIdCt());
        res.setTenLop(entity.getTenLop());
        res.setLoaiNgay(entity.getLoaiNgay());
        res.setSoBuoi(entity.getSoBuoi());
        res.setHinhThucHoc(entity.getHinhThucHoc());
        res.setNgayBatDau(entity.getNgayBatDau().toString());
        res.setMucGiaThang(entity.getMucGiaThang().toString());
        res.setDanhGia(entity.getDanhGia());
        res.setTrangThai(entity.getTrangThai());
        res.setMoTa(entity.getMoTa());

        return res;
    }
}
