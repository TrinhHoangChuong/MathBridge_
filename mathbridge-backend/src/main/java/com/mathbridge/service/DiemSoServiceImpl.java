package com.mathbridge.service;

import com.mathbridge.dto.DiemSoDTO;
import com.mathbridge.entity.BaiNop;
import com.mathbridge.entity.DangKyLH;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.KetQuaHocTap;
import com.mathbridge.repository.DangKyLHRepository;
import com.mathbridge.repository.BaiNopRepository;
import com.mathbridge.repository.KetQuaHocTapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DiemSoServiceImpl implements DiemSoService {

    private final DangKyLHRepository dangKyLHRepository;
    private final BaiNopRepository baiNopRepository;
    private final KetQuaHocTapRepository ketQuaHocTapRepository;

    public DiemSoServiceImpl(DangKyLHRepository dangKyLHRepository,
                            BaiNopRepository baiNopRepository,
                            KetQuaHocTapRepository ketQuaHocTapRepository) {
        this.dangKyLHRepository = dangKyLHRepository;
        this.baiNopRepository = baiNopRepository;
        this.ketQuaHocTapRepository = ketQuaHocTapRepository;
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
                    
                    // Get scores from KetQuaHocTap (primary source)
                    List<KetQuaHocTap> ketQuaList = ketQuaHocTapRepository.findByHocSinhId(hs.getIdHs());
                    BigDecimal diem15Phut = null;
                    BigDecimal diem45Phut = null;
                    BigDecimal diemThiHK = null;
                    
                    if (!ketQuaList.isEmpty()) {
                        KetQuaHocTap ketQua = ketQuaList.get(0);
                        if (ketQua.getDiemSo() != null && !ketQua.getDiemSo().isEmpty()) {
                            String[] diemParts = ketQua.getDiemSo().split(",");
                            if (diemParts.length >= 1) diem15Phut = parseScore(diemParts[0]);
                            if (diemParts.length >= 2) diem45Phut = parseScore(diemParts[1]);
                            if (diemParts.length >= 3) diemThiHK = parseScore(diemParts[2]);
                        }
                    }
                    
                    // Fallback: Calculate from BaiNop if KetQuaHocTap is empty
                    if (diem15Phut == null && diem45Phut == null && diemThiHK == null) {
                        List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
                        diem15Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_15P");
                        diem45Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_45P");
                        diemThiHK = tinhDiemTheoLoai(baiNops, "THI_HK");
                    }
                    
                    dto.setDiem15Phut(diem15Phut);
                    dto.setDiem45Phut(diem45Phut);
                    dto.setDiemThiHK(diemThiHK);
                    
                    // Calculate average
                    BigDecimal diemTB = tinhDiemTrungBinh(diem15Phut, diem45Phut, diemThiHK);
                    dto.setDiemTrungBinh(diemTB);
                    
                    // Classification
                    if (!ketQuaList.isEmpty() && ketQuaList.get(0).getXepLoai() != null) {
                        dto.setXepLoai(ketQuaList.get(0).getXepLoai());
                    } else {
                        dto.setXepLoai(xepLoai(diemTB));
                    }
                    
                    // Count assignments
                    List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
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
    @Transactional
    public DiemSoDTO updateDiemSo(String idHs, String idLh, String loaiDiem, BigDecimal diemSo) {
        // Find or create KetQuaHocTap for this student
        List<KetQuaHocTap> existing = ketQuaHocTapRepository.findByHocSinhId(idHs);
        KetQuaHocTap ketQua = existing.isEmpty() ? null : existing.get(0);
        
        if (ketQua == null) {
            // Create new KetQuaHocTap
            ketQua = new KetQuaHocTap();
            ketQua.setIdKq("KQ" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            ketQua.setIdHs(idHs);
            ketQua.setDiemSo("0,0,0"); // Initialize with zeros
            ketQua.setXepLoai("Chưa có");
        }
        
        // Parse current DiemSo string (format: "1,2,3")
        String[] diemParts = ketQua.getDiemSo() != null ? ketQua.getDiemSo().split(",") : new String[]{"0", "0", "0"};
        if (diemParts.length != 3) {
            diemParts = new String[]{"0", "0", "0"};
        }
        
        // Update the appropriate score based on loaiDiem
        // loaiDiem: "15P" or "DIEM_15P" -> index 0, "45P" or "DIEM_45P" -> index 1, "HK" or "DIEM_THI_HK" -> index 2
        String loaiDiemUpper = loaiDiem.toUpperCase();
        if (loaiDiemUpper.contains("15") || loaiDiemUpper.equals("15P") || loaiDiemUpper.equals("DIEM_15P")) {
            diemParts[0] = diemSo != null ? diemSo.toString() : "0";
        } else if (loaiDiemUpper.contains("45") || loaiDiemUpper.equals("45P") || loaiDiemUpper.equals("DIEM_45P")) {
            diemParts[1] = diemSo != null ? diemSo.toString() : "0";
        } else if (loaiDiemUpper.contains("HK") || loaiDiemUpper.contains("THI") || loaiDiemUpper.equals("DIEM_THI_HK")) {
            diemParts[2] = diemSo != null ? diemSo.toString() : "0";
        }
        
        // Reconstruct DiemSo string
        String newDiemSo = String.join(",", diemParts);
        ketQua.setDiemSo(newDiemSo);
        
        // Calculate average and classification
        BigDecimal diem15 = parseScore(diemParts[0]);
        BigDecimal diem45 = parseScore(diemParts[1]);
        BigDecimal diemHK = parseScore(diemParts[2]);
        BigDecimal diemTB = tinhDiemTrungBinh(diem15, diem45, diemHK);
        ketQua.setXepLoai(xepLoai(diemTB));
        
        // Save to database
        ketQuaHocTapRepository.save(ketQua);
        
        // Return updated DTO
        DiemSoDTO dto = new DiemSoDTO();
        dto.setIdHs(idHs);
        dto.setDiem15Phut(diem15);
        dto.setDiem45Phut(diem45);
        dto.setDiemThiHK(diemHK);
        dto.setDiemTrungBinh(diemTB);
        dto.setXepLoai(ketQua.getXepLoai());
        
        return dto;
    }
    
    private BigDecimal parseScore(String scoreStr) {
        try {
            if (scoreStr == null || scoreStr.trim().isEmpty() || scoreStr.equals("0")) {
                return null;
            }
            return new BigDecimal(scoreStr.trim());
        } catch (Exception e) {
            return null;
        }
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

