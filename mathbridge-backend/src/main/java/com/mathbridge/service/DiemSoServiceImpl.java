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
                        
                        // Get DiemTB directly from KetQuaHocTap if available
                        if (ketQua.getDiemTB() != null) {
                            dto.setDiemTrungBinh(ketQua.getDiemTB());
                        } else {
                            // Calculate if not stored
                            BigDecimal diemTB = tinhDiemTrungBinh(diem15Phut, diem45Phut, diemThiHK);
                            dto.setDiemTrungBinh(diemTB);
                        }
                        
                        // Get XepLoai from KetQuaHocTap
                        if (ketQua.getXepLoai() != null) {
                            dto.setXepLoai(ketQua.getXepLoai());
                        } else {
                            BigDecimal diemTB = dto.getDiemTrungBinh();
                            dto.setXepLoai(xepLoai(diemTB));
                        }
                    } else {
                        // Fallback: Calculate from BaiNop if KetQuaHocTap is empty
                        List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
                        diem15Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_15P");
                        diem45Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_45P");
                        diemThiHK = tinhDiemTheoLoai(baiNops, "THI_HK");
                        
                        BigDecimal diemTB = tinhDiemTrungBinh(diem15Phut, diem45Phut, diemThiHK);
                        dto.setDiemTrungBinh(diemTB);
                        dto.setXepLoai(xepLoai(diemTB));
                    }
                    
                    dto.setDiem15Phut(diem15Phut);
                    dto.setDiem45Phut(diem45Phut);
                    dto.setDiemThiHK(diemThiHK);
                    
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
            // Generate ID based on student ID: HS001 -> KQ001, HS114 -> KQ114
            String idKq;
            if (idHs != null && idHs.length() >= 2) {
                // Extract numeric part from student ID (e.g., "HS001" -> "001", "HS114" -> "114")
                String numericPart = idHs.substring(2); // Skip "HS" prefix
                // Ensure numeric part is at least 3 digits, pad with zeros if needed
                while (numericPart.length() < 3) {
                    numericPart = "0" + numericPart;
                }
                // Create ID: KQ + numeric part (e.g., "KQ001", "KQ114")
                idKq = "KQ" + numericPart;
                // Ensure ID is exactly 10 characters (pad with zeros if needed)
                if (idKq.length() < 10) {
                    while (idKq.length() < 10) {
                        idKq += "0";
                    }
                } else if (idKq.length() > 10) {
                    idKq = idKq.substring(0, 10);
                }
            } else {
                // Fallback: use UUID if idHs format is unexpected
                String randomId = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
                idKq = "KQ" + randomId;
                if (idKq.length() > 10) {
                    idKq = idKq.substring(0, 10);
                } else if (idKq.length() < 10) {
                    while (idKq.length() < 10) {
                        idKq += "0";
                    }
                }
            }
            ketQua.setIdKq(idKq);
            ketQua.setIdHs(idHs);
            ketQua.setDiemSo(",,,"); // Initialize with empty strings (will be parsed as null)
            ketQua.setDiemTB(null); // No average score yet
            ketQua.setXepLoai("N");
        }
        
        // Parse current DiemSo string (format: "10,8,9" where 1st=15p, 2nd=45p, 3rd=HK)
        String[] diemParts;
        if (ketQua.getDiemSo() != null && !ketQua.getDiemSo().trim().isEmpty()) {
            diemParts = ketQua.getDiemSo().split(",");
            // Ensure we have exactly 3 parts
            if (diemParts.length != 3) {
                diemParts = new String[]{"", "", ""};
            }
        } else {
            diemParts = new String[]{"", "", ""};
        }
        
        // Update the appropriate score based on loaiDiem
        // loaiDiem: "15P" or "DIEM_15P" -> index 0, "45P" or "DIEM_45P" -> index 1, "HK" or "DIEM_THI_HK" -> index 2
        // Use empty string "" to represent null (will be parsed as null later)
        String loaiDiemUpper = loaiDiem.toUpperCase();
        if (loaiDiemUpper.contains("15") || loaiDiemUpper.equals("15P") || loaiDiemUpper.equals("DIEM_15P")) {
            diemParts[0] = diemSo != null ? diemSo.toString() : "";
        } else if (loaiDiemUpper.contains("45") || loaiDiemUpper.equals("45P") || loaiDiemUpper.equals("DIEM_45P")) {
            diemParts[1] = diemSo != null ? diemSo.toString() : "";
        } else if (loaiDiemUpper.contains("HK") || loaiDiemUpper.contains("THI") || loaiDiemUpper.equals("DIEM_THI_HK")) {
            diemParts[2] = diemSo != null ? diemSo.toString() : "";
        }
        
        // Reconstruct DiemSo string
        String newDiemSo = String.join(",", diemParts);
        ketQua.setDiemSo(newDiemSo);
        
        // Calculate average and classification
        BigDecimal diem15 = parseScore(diemParts[0]);
        BigDecimal diem45 = parseScore(diemParts[1]);
        BigDecimal diemHK = parseScore(diemParts[2]);
        
        // Calculate average if at least one score is provided (not null)
        BigDecimal diemTB = null;
        if (diem15 != null || diem45 != null || diemHK != null) {
            diemTB = tinhDiemTrungBinh(diem15, diem45, diemHK);
        }
        
        ketQua.setDiemTB(diemTB);
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
            if (scoreStr == null || scoreStr.trim().isEmpty()) {
                return null;
            }
            // Allow 0 as a valid score (teacher can input 0)
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

    /**
     * Tính điểm trung bình theo quy tắc:
     * - 20% điểm 15 phút
     * - 30% điểm 45 phút  
     * - 50% điểm thi học kỳ
     * 
     * Chỉ tính khi có đủ cả 3 loại điểm để đảm bảo tổng trọng số = 100%
     * Nếu thiếu bất kỳ điểm nào, trả về null (chưa đủ điểm để tính)
     */
    private BigDecimal tinhDiemTrungBinh(BigDecimal diem15Phut, BigDecimal diem45Phut, BigDecimal diemThiHK) {
        // Chỉ tính điểm TB khi có đủ cả 3 loại điểm
        // Đảm bảo tổng trọng số = 20% + 30% + 50% = 100%
        if (diem15Phut == null || diem45Phut == null || diemThiHK == null) {
            return null; // Chưa đủ điểm để tính
        }
        
        // Tính điểm trung bình có trọng số
        BigDecimal tong = BigDecimal.ZERO;
        tong = tong.add(diem15Phut.multiply(BigDecimal.valueOf(0.2)));  // 20%
        tong = tong.add(diem45Phut.multiply(BigDecimal.valueOf(0.3)));  // 30%
        tong = tong.add(diemThiHK.multiply(BigDecimal.valueOf(0.5)));   // 50%
        
        return tong.setScale(2, RoundingMode.HALF_UP);
    }

    private String xepLoai(BigDecimal diemTB) {
        if (diemTB == null) {
            return "N";
        }
        
        if (diemTB.compareTo(BigDecimal.valueOf(8.0)) >= 0) {
            return "Giỏi";
        } else if (diemTB.compareTo(BigDecimal.valueOf(6.5)) >= 0) {
            return "Khá";
        } else if (diemTB.compareTo(BigDecimal.valueOf(5.0)) >= 0) {
            return "TB";
        } else {
            return "Yếu";
        }
    }
}

