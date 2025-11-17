package com.mathbridge.service;

import com.mathbridge.dto.BuoiHocChiTietDTO;
import com.mathbridge.entity.BuoiHocChiTiet;
import com.mathbridge.entity.LopHoc;
import com.mathbridge.repository.BuoiHocChiTietRepository;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BuoiHocChiTietServiceImpl implements BuoiHocChiTietService {

    private final BuoiHocChiTietRepository buoiHocChiTietRepository;
    private final LopHocRepository lopHocRepository;

    public BuoiHocChiTietServiceImpl(BuoiHocChiTietRepository buoiHocChiTietRepository,
                                     LopHocRepository lopHocRepository) {
        this.buoiHocChiTietRepository = buoiHocChiTietRepository;
        this.lopHocRepository = lopHocRepository;
    }

    @Override
    public List<BuoiHocChiTietDTO> getBuoiHocByLopHoc(String idLh) {
        List<BuoiHocChiTiet> buoiHocs = buoiHocChiTietRepository.findByLopHocId(idLh);
        return buoiHocs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BuoiHocChiTietDTO> getBuoiHocByGiaoVien(String idNv) {
        List<BuoiHocChiTiet> buoiHocs = buoiHocChiTietRepository.findByGiaoVienId(idNv);
        return buoiHocs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BuoiHocChiTietDTO createBuoiHoc(BuoiHocChiTietDTO dto) {
        BuoiHocChiTiet buoiHoc = new BuoiHocChiTiet();
        
        String idBh = "BH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        buoiHoc.setIdBh(idBh);
        
        buoiHoc.setTenCaHoc(dto.getTenCaHoc());
        buoiHoc.setThuTuBuoiHoc(dto.getThuTuBuoiHoc());
        buoiHoc.setNgayHoc(dto.getNgayHoc());
        buoiHoc.setGioBatDau(dto.getGioBatDau());
        buoiHoc.setGioKetThuc(dto.getGioKetThuc());
        buoiHoc.setNoiDung(dto.getNoiDung());
        buoiHoc.setGhiChu(dto.getGhiChu());
        
        if (dto.getIdLh() != null) {
            LopHoc lopHoc = lopHocRepository.findById(dto.getIdLh())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));
            buoiHoc.setLopHoc(lopHoc);
        }
        
        // Set Phong if needed
        // buoiHoc.setPhong(...);
        
        BuoiHocChiTiet saved = buoiHocChiTietRepository.save(buoiHoc);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public BuoiHocChiTietDTO updateBuoiHoc(String idBh, BuoiHocChiTietDTO dto) {
        BuoiHocChiTiet buoiHoc = buoiHocChiTietRepository.findById(idBh)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy buổi học"));
        
        buoiHoc.setTenCaHoc(dto.getTenCaHoc());
        buoiHoc.setThuTuBuoiHoc(dto.getThuTuBuoiHoc());
        buoiHoc.setNgayHoc(dto.getNgayHoc());
        buoiHoc.setGioBatDau(dto.getGioBatDau());
        buoiHoc.setGioKetThuc(dto.getGioKetThuc());
        buoiHoc.setNoiDung(dto.getNoiDung());
        buoiHoc.setGhiChu(dto.getGhiChu());
        
        BuoiHocChiTiet saved = buoiHocChiTietRepository.save(buoiHoc);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteBuoiHoc(String idBh) {
        buoiHocChiTietRepository.deleteById(idBh);
    }

    private BuoiHocChiTietDTO convertToDTO(BuoiHocChiTiet buoiHoc) {
        BuoiHocChiTietDTO dto = new BuoiHocChiTietDTO();
        dto.setIdBh(buoiHoc.getIdBh());
        dto.setTenCaHoc(buoiHoc.getTenCaHoc());
        dto.setThuTuBuoiHoc(buoiHoc.getThuTuBuoiHoc());
        dto.setNgayHoc(buoiHoc.getNgayHoc());
        dto.setGioBatDau(buoiHoc.getGioBatDau());
        dto.setGioKetThuc(buoiHoc.getGioKetThuc());
        dto.setNoiDung(buoiHoc.getNoiDung());
        dto.setGhiChu(buoiHoc.getGhiChu());
        
        if (buoiHoc.getLopHoc() != null) {
            dto.setIdLh(buoiHoc.getLopHoc().getIdLh());
            dto.setTenLop(buoiHoc.getLopHoc().getTenLop());
            
            // Count students
            int soHocSinh = buoiHoc.getLopHoc().getDangKyLhs()!= null ?
                           buoiHoc.getLopHoc().getDangKyLhs().size() : 0;
            dto.setSoHocSinh(soHocSinh);
        }
        
        if (buoiHoc.getPhong() != null) {
            dto.setTenPhong(buoiHoc.getPhong().getTenPhong());
        }
        
        return dto;
    }
}

