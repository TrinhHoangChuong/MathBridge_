
package com.mathbridge.service.PortalAdmin;


import com.mathbridge.dto.PortalAdmin.Request.LopHocRequest;
import com.mathbridge.dto.PortalAdmin.Response.LopHocResponse;
import com.mathbridge.entity.*;
import com.mathbridge.repository.*;
import com.mathbridge.repository.Admin.BuoiHocChiTietRepository;
import com.mathbridge.repository.Admin.HoaDonRepository;
import com.mathbridge.repository.Admin.NhanVienRepository;
import com.mathbridge.service.PortalAdmin.LopHocAdminService;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.*;
import java.time.LocalDateTime;

@Service
@Transactional
public class LopHocAdminServiceImpl implements LopHocAdminService {

    private final LopHocRepository lopRepo;
    private final NhanVienRepository nvRepo;
    private final ChuongTrinhRepository ctRepo;
    private final BuoiHocChiTietRepository bhRepo;
    private final DangKyLHRepository dkRepo;
    private final HoaDonRepository hdRepo;

    public LopHocAdminServiceImpl(LopHocRepository lopRepo, NhanVienRepository nvRepo,
                                  ChuongTrinhRepository ctRepo, BuoiHocChiTietRepository bhRepo,
                                  DangKyLHRepository dkRepo, HoaDonRepository hdRepo) {
        this.lopRepo = lopRepo; this.nvRepo = nvRepo; this.ctRepo = ctRepo;
        this.bhRepo = bhRepo; this.dkRepo = dkRepo; this.hdRepo = hdRepo;
    }

    @Override @Transactional(readOnly = true)
    public Page<LopHocResponse> list(String ct, String nv, String status, String hinhThuc,
                                     LocalDateTime from, LocalDateTime to,
                                     String q, Pageable pageable) {

        Specification<LopHoc> spec = (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (ct!=null && !ct.isBlank())   ps.add(cb.equal(root.get("chuongTrinh").get("idCt"), ct));
            if (nv!=null && !nv.isBlank())   ps.add(cb.equal(root.get("nhanVien").get("idNv"), nv));
            if (status!=null && !status.isBlank()) ps.add(cb.equal(root.get("trangThai"), status));
            if (hinhThuc!=null && !hinhThuc.isBlank()) ps.add(cb.equal(root.get("hinhThucHoc"), hinhThuc));
            if (from!=null) ps.add(cb.greaterThanOrEqualTo(root.get("ngayBatDau"), from));
            if (to!=null)   ps.add(cb.lessThanOrEqualTo(root.get("ngayBatDau"), to));
            if (q!=null && !q.isBlank())
                ps.add(cb.like(cb.lower(root.get("tenLop")), "%"+q.trim().toLowerCase()+"%"));
            return cb.and(ps.toArray(new Predicate[0]));
        };

        return lopRepo.findAll(spec, pageable).map(this::toDto);
    }

    @Override @Transactional(readOnly = true)
    public LopHocResponse get(String idLh) {
        LopHoc lh = lopRepo.findById(idLh)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy lớp: " + idLh));
        return toDto(lh);
    }

    @Override
    public LopHocResponse create(LopHocRequest req) {
        if (lopRepo.existsById(req.getIdLh())) throw new IllegalStateException("ID_LH đã tồn tại");
        LopHoc lh = new LopHoc();
        apply(lh, req);
        lopRepo.save(lh);
        return toDto(lh);
    }

    @Override
    public LopHocResponse update(String idLh, LopHocRequest req) {
        LopHoc lh = lopRepo.findById(idLh)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy lớp: " + idLh));
        apply(lh, req);
        return toDto(lh);
    }

    @Override
    public void delete(String idLh) {
        long c1 = bhRepo.countByLopHoc_IdLh(idLh);
        long c2 = dkRepo.countByLopHoc_IdLh(idLh);
        long c3 = hdRepo.countByLopHoc_IdLh(idLh);
        if (c1+c2+c3 > 0) throw new IllegalStateException(
                "Không thể xóa lớp còn tham chiếu: BuoiHoc="+c1+", DangKy="+c2+", HoaDon="+c3);
        lopRepo.deleteById(idLh);
    }

    /* helpers */
    private void apply(LopHoc lh, LopHocRequest r) {
        NhanVien nv = nvRepo.findById(r.getIdNv())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân viên: " + r.getIdNv()));
        ChuongTrinh ct = ctRepo.findById(r.getIdCt())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy chương trình: " + r.getIdCt()));
        lh.setIdLh(r.getIdLh()); lh.setNhanVien(nv); lh.setChuongTrinh(ct);
        lh.setTenLop(r.getTenLop()); lh.setLoaiNgay(r.getLoaiNgay()); lh.setSoBuoi(r.getSoBuoi());
        lh.setHinhThucHoc(r.getHinhThucHoc()); lh.setNgayBatDau(r.getNgayBatDau());
        lh.setMucGiaThang(r.getMucGiaThang()); lh.setDanhGia(r.getDanhGia());
        lh.setTrangThai(r.getTrangThai()); lh.setMoTa(r.getMoTa());
    }

    private LopHocResponse toDto(LopHoc lh){
        String tenCt = lh.getChuongTrinh()!=null ? lh.getChuongTrinh().getTenCt() : null;
        String tenNv = lh.getNhanVien()!=null ?
                (lh.getNhanVien().getHo()+" "+(lh.getNhanVien().getTenDem()==null?"":lh.getNhanVien().getTenDem()+" ")+lh.getNhanVien().getTen()).trim() : null;
        return new LopHocResponse(
                lh.getIdLh(),
                lh.getNhanVien()!=null?lh.getNhanVien().getIdNv():null,
                lh.getChuongTrinh()!=null?lh.getChuongTrinh().getIdCt():null,
                lh.getTenLop(), lh.getLoaiNgay(), lh.getSoBuoi(), lh.getHinhThucHoc(),
                lh.getNgayBatDau(), lh.getMucGiaThang(), lh.getDanhGia(), lh.getTrangThai(), lh.getMoTa(),
                tenCt, tenNv
        );
    }
}
