package com.mathbridge.service;

import com.mathbridge.dto.LopHocDTO;
import com.mathbridge.dto.PortalAdmin.Request.LopHocRequest;
import com.mathbridge.dto.PortalAdmin.Response.LopHocResponse;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class LopHocServiceImpl implements LopHocService {

    private final LopHocRepository lopHocRepository;

    public LopHocServiceImpl(LopHocRepository lopHocRepository) {
        this.lopHocRepository = lopHocRepository;
    }

    @Override
    public List<LopHocDTO> getLopHocByGiaoVien(String idNv) {
        List<LopHoc> lopHocs = lopHocRepository.findByNhanVien_IdNv(idNv);
        return lopHocs.stream()
                .map(lh -> new LopHocDTO(
                        lh.getTenLop(),
                        lh.getLoaiNgay(),
                        lh.getSoBuoi(),
                        lh.getHinhThucHoc(),
                        lh.getNgayBatDau(),
                        lh.getMucGiaThang(),
                        lh.getTrangThai(),
                        lh.getMoTa()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Page<LopHocResponse> list(String ct, String nv, String status, String hinhThuc, LocalDateTime from, LocalDateTime to, String q, Pageable pageable) {
        return null;
    }

    @Override
    public LopHocResponse get(String idLh) {
        return null;
    }

    @Override
    public LopHocResponse create(LopHocRequest req) {
        return null;
    }

    @Override
    public LopHocResponse update(String idLh, LopHocRequest req) {
        return null;
    }

    // === bổ sung để khớp interface LopHocService ===
    @Override
    @Transactional
    public void delete(String idLh) {
        if (!lopHocRepository.existsById(idLh)) {
            throw new NoSuchElementException("Không tìm thấy lớp: " + idLh);
        }
        lopHocRepository.deleteById(idLh);
    }
}
