package com.mathbridge.service;

import com.mathbridge.dto.DiemSoDTO;
import com.mathbridge.entity.BaiNop;
import com.mathbridge.entity.DangKyLH;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.repository.DangKyLHRepository;
import com.mathbridge.repository.BaiNopRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiemSoServiceImpl implements DiemSoService {

    private final DangKyLHRepository dangKyLHRepository;
    private final BaiNopRepository baiNopRepository;

    public DiemSoServiceImpl(DangKyLHRepository dangKyLHRepository,
                            BaiNopRepository baiNopRepository) {
        this.dangKyLHRepository = dangKyLHRepository;
        this.baiNopRepository = baiNopRepository;
    }

    @Override
    public List<DiemSoDTO> getDiemSoByLopHoc(String idLh) {
        List<DangKyLH> dangKyLHs = dangKyLHRepository.findByLopHocId(idLh);
        
        return dangKyLHs.stream()
                .map(dk -> {
                    HocSinh hs = dk.getHocSinh();
                    DiemSoDTO dto = new DiemSoDTO();
                    dto.setIdHs(hs.getIdHs());
                    
                    String hoTen = (hs.getHo() != null ? hs.getHo() : "") + 
                                  (hs.getTenDem() != null ? " " + hs.getTenDem() : "") + 
                                  (hs.getTen() != null ? " " + hs.getTen() : "");
                    dto.setHoTen(hoTen.trim());
                    dto.setEmail(hs.getEmail());
                    
                    // Tính điểm từ bài nộp
                    List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
                    
                    // Tính điểm 15p, 45p, thi HK từ loại bài tập
                    BigDecimal diem15Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_15P");
                    BigDecimal diem45Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_45P");
                    BigDecimal diemThiHK = tinhDiemTheoLoai(baiNops, "THI_HK");
                    
                    dto.setDiem15Phut(diem15Phut);
                    dto.setDiem45Phut(diem45Phut);
                    dto.setDiemThiHK(diemThiHK);
                    
                    // Tính điểm trung bình
                    BigDecimal diemTB = tinhDiemTrungBinh(diem15Phut, diem45Phut, diemThiHK);
                    dto.setDiemTrungBinh(diemTB);
                    
                    // Xếp loại
                    dto.setXepLoai(xepLoai(diemTB));
                    
                    // Đếm số bài tập
                    long soBaiTap = baiNops.size();
                    long soBaiDaNop = baiNops.stream()
                            .filter(bn -> bn.getTrangThai() != null && 
                                         (bn.getTrangThai().equals("DA_NOP") || 
                                          bn.getTrangThai().equals("DA_CHAM")))
                            .count();
                    
                    dto.setSoBaiTap((int) soBaiTap);
                    dto.setSoBaiDaNop((int) soBaiDaNop);
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public DiemSoDTO updateDiemSo(String idHs, String idLh, String loaiDiem, BigDecimal diemSo) {
        // Implementation for updating grades
        // This would typically update BaiNop or create KetQuaHocTap
        return null;
    }

    @Override
    public void exportBaoCaoDiemSo(String idLh) {
        // Implementation for exporting grade report
    }

    private BigDecimal tinhDiemTheoLoai(List<BaiNop> baiNops, String loaiBt) {
        List<BaiNop> filtered = baiNops.stream()
                .filter(bn -> bn.getBaiTap() != null && 
                             bn.getBaiTap().getLoaiBt() != null &&
                             bn.getBaiTap().getLoaiBt().equals(loaiBt) &&
                             bn.getDiemSo() != null)
                .collect(Collectors.toList());
        
        if (filtered.isEmpty()) {
            return null;
        }
        
        BigDecimal tong = filtered.stream()
                .map(BaiNop::getDiemSo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return tong.divide(BigDecimal.valueOf(filtered.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal tinhDiemTrungBinh(BigDecimal diem15Phut, BigDecimal diem45Phut, BigDecimal diemThiHK) {
        int count = 0;
        BigDecimal tong = BigDecimal.ZERO;
        
        if (diem15Phut != null) {
            tong = tong.add(diem15Phut.multiply(BigDecimal.valueOf(0.2)));
            count++;
        }
        if (diem45Phut != null) {
            tong = tong.add(diem45Phut.multiply(BigDecimal.valueOf(0.3)));
            count++;
        }
        if (diemThiHK != null) {
            tong = tong.add(diemThiHK.multiply(BigDecimal.valueOf(0.5)));
            count++;
        }
        
        if (count == 0) {
            return null;
        }
        
        return tong.setScale(2, RoundingMode.HALF_UP);
    }

    private String xepLoai(BigDecimal diemTB) {
        if (diemTB == null) {
            return "Chưa có";
        }
        
        if (diemTB.compareTo(BigDecimal.valueOf(8.0)) >= 0) {
            return "Giỏi";
        } else if (diemTB.compareTo(BigDecimal.valueOf(6.5)) >= 0) {
            return "Khá";
        } else if (diemTB.compareTo(BigDecimal.valueOf(5.0)) >= 0) {
            return "Trung bình";
        } else {
            return "Yếu";
        }
    }
}

