package com.mathbridge.service;

import com.mathbridge.dto.BaiTapDTO;
import com.mathbridge.dto.BaiNopDTO;
import com.mathbridge.entity.BaiTap;
import com.mathbridge.entity.BaiNop;
import com.mathbridge.entity.BuoiHocChiTiet;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.repository.BaiTapRepository;
import com.mathbridge.repository.BaiNopRepository;
import com.mathbridge.repository.BuoiHocChiTietRepository;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BaiTapServiceImpl implements BaiTapService {

    private final BaiTapRepository baiTapRepository;
    private final BaiNopRepository baiNopRepository;
    private final BuoiHocChiTietRepository buoiHocChiTietRepository;

    public BaiTapServiceImpl(BaiTapRepository baiTapRepository,
                             BaiNopRepository baiNopRepository,
                             BuoiHocChiTietRepository buoiHocChiTietRepository) {
        this.baiTapRepository = baiTapRepository;
        this.baiNopRepository = baiNopRepository;
        this.buoiHocChiTietRepository = buoiHocChiTietRepository;
    }

    @Override
    public List<BaiTapDTO> getBaiTapByLopHoc(String idLh) {
        List<BaiTap> baiTaps = baiTapRepository.findByLopHocId(idLh);
        return baiTaps.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BaiTapDTO> getBaiTapByGiaoVien(String idNv) {
        List<BaiTap> baiTaps = baiTapRepository.findByGiaoVienId(idNv);
        return baiTaps.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BaiTapDTO createBaiTap(BaiTapDTO baiTapDTO) {
        BaiTap baiTap = new BaiTap();
        
        // Generate ID
        String idBt = "BT" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        baiTap.setIdBt(idBt);
        
        // Set properties
        baiTap.setTieuDe(baiTapDTO.getTieuDe());
        baiTap.setMoTa(baiTapDTO.getMoTa());
        baiTap.setLoaiBt(baiTapDTO.getLoaiBt());
        baiTap.setFileUrl(baiTapDTO.getFileUrl());
        baiTap.setTaiLieuUrl(baiTapDTO.getTaiLieuUrl());
        baiTap.setNgayBatDau(baiTapDTO.getNgayBatDau());
        baiTap.setNgayKetThuc(baiTapDTO.getNgayKetThuc());
        baiTap.setGhiChu(baiTapDTO.getGhiChu());
        
        // Set BuoiHocChiTiet if provided
        if (baiTapDTO.getIdBh() != null) {
            BuoiHocChiTiet buoiHoc = buoiHocChiTietRepository.findById(baiTapDTO.getIdBh())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy buổi học"));
            baiTap.setBuoiHocChiTiet(buoiHoc);
        }
        
        BaiTap saved = baiTapRepository.save(baiTap);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public BaiTapDTO updateBaiTap(String idBt, BaiTapDTO baiTapDTO) {
        BaiTap baiTap = baiTapRepository.findById(idBt)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập"));
        
        baiTap.setTieuDe(baiTapDTO.getTieuDe());
        baiTap.setMoTa(baiTapDTO.getMoTa());
        baiTap.setLoaiBt(baiTapDTO.getLoaiBt());
        baiTap.setFileUrl(baiTapDTO.getFileUrl());
        baiTap.setTaiLieuUrl(baiTapDTO.getTaiLieuUrl());
        baiTap.setNgayBatDau(baiTapDTO.getNgayBatDau());
        baiTap.setNgayKetThuc(baiTapDTO.getNgayKetThuc());
        baiTap.setGhiChu(baiTapDTO.getGhiChu());
        
        BaiTap saved = baiTapRepository.save(baiTap);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteBaiTap(String idBt) {
        baiTapRepository.deleteById(idBt);
    }

    @Override
    public List<BaiNopDTO> getBaiNopByBaiTap(String idBt) {
        List<BaiNop> baiNops = baiNopRepository.findByBaiTapId(idBt);
        return baiNops.stream()
                .map(this::convertBaiNopToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BaiNopDTO chamDiemBaiNop(String idBn, BigDecimal diemSo, String nhanXet) {
        BaiNop baiNop = baiNopRepository.findById(idBn)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));
        
        baiNop.setDiemSo(diemSo);
        baiNop.setNhanXet(nhanXet);
        baiNop.setTrangThai("DA_CHAM");
        
        BaiNop saved = baiNopRepository.save(baiNop);
        return convertBaiNopToDTO(saved);
    }

    private BaiTapDTO convertToDTO(BaiTap baiTap) {
        BaiTapDTO dto = new BaiTapDTO();
        dto.setIdBt(baiTap.getIdBt());
        dto.setTieuDe(baiTap.getTieuDe());
        dto.setMoTa(baiTap.getMoTa());
        dto.setLoaiBt(baiTap.getLoaiBt());
        dto.setFileUrl(baiTap.getFileUrl());
        dto.setTaiLieuUrl(baiTap.getTaiLieuUrl());
        dto.setNgayBatDau(baiTap.getNgayBatDau());
        dto.setNgayKetThuc(baiTap.getNgayKetThuc());
        dto.setGhiChu(baiTap.getGhiChu());
        
        if (baiTap.getBuoiHocChiTiet() != null) {
            dto.setIdBh(baiTap.getBuoiHocChiTiet().getIdBh());
            dto.setTenCaHoc(baiTap.getBuoiHocChiTiet().getTenCaHoc());
            
            if (baiTap.getBuoiHocChiTiet().getLopHoc() != null) {
                dto.setIdLh(baiTap.getBuoiHocChiTiet().getLopHoc().getIdLh());
                dto.setTenLop(baiTap.getBuoiHocChiTiet().getLopHoc().getTenLop());
            }
        }
        
        // Count submissions
        long soBaiNop = baiNopRepository.countByBaiTapId(baiTap.getIdBt());
        long soBaiDaCham = baiNopRepository.countBaiDaChamByBaiTapId(baiTap.getIdBt());
        
        dto.setSoBaiNop((int) soBaiNop);
        dto.setSoBaiDaCham((int) soBaiDaCham);
        
        return dto;
    }

    private BaiNopDTO convertBaiNopToDTO(BaiNop baiNop) {
        BaiNopDTO dto = new BaiNopDTO();
        dto.setIdBn(baiNop.getIdBn());
        dto.setIdBt(baiNop.getBaiTap().getIdBt());
        dto.setIdHs(baiNop.getHocSinh().getIdHs());
        
        HocSinh hs = baiNop.getHocSinh();
        String hoTen = (hs.getHo() != null ? hs.getHo() : "") + 
                       (hs.getTenDem() != null ? " " + hs.getTenDem() : "") + 
                       (hs.getTen() != null ? " " + hs.getTen() : "");
        dto.setHoTen(hoTen.trim());
        
        dto.setFileUrl(baiNop.getFileUrl());
        dto.setDiemSo(baiNop.getDiemSo());
        dto.setNhanXet(baiNop.getNhanXet());
        dto.setTrangThai(baiNop.getTrangThai());
        dto.setGhiChu(baiNop.getGhiChu());
        
        return dto;
    }
}

