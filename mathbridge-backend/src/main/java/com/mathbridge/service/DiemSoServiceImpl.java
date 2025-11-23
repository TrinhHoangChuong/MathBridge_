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
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class DiemSoServiceImpl implements DiemSoService {

    private final DangKyLHRepository dangKyLHRepository;
    private final BaiNopRepository baiNopRepository;
    private final KetQuaHocTapRepository ketQuaHocTapRepository;
    
    // Temporary storage for scores while teacher is entering them (in-memory)
    // Key: studentId, Value: Map with keys "15P", "45P", "HK"
    private final Map<String, Map<String, BigDecimal>> tempScores = new ConcurrentHashMap<>();

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
                        
                        // Get scores from temp storage (if teacher is currently entering)
                        Map<String, BigDecimal> tempStudentScores = tempScores.get(hs.getIdHs());
                        if (tempStudentScores != null) {
                            diem15Phut = tempStudentScores.get("15P");
                            diem45Phut = tempStudentScores.get("45P");
                            diemThiHK = tempStudentScores.get("HK");
                        }
                        
                        // Luôn lấy điểm từ BaiNop để hiển thị trong 3 cột (ưu tiên temp scores nếu có)
                        // Nếu không có temp scores, lấy từ BaiNop
                        if (diem15Phut == null) {
                            List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
                            diem15Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_15P");
                        }
                        if (diem45Phut == null) {
                            List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
                            diem45Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_45P");
                        }
                        if (diemThiHK == null) {
                            List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
                            diemThiHK = tinhDiemTheoLoai(baiNops, "THI_HK");
                        }
                        
                        // Set individual scores to DTO
                        dto.setDiem15Phut(diem15Phut);
                        dto.setDiem45Phut(diem45Phut);
                        dto.setDiemThiHK(diemThiHK);
                        
                        // Get DiemTrungBinh directly from KetQuaHocTap (đã tính: (15p + 45p + thi) / 3)
                        dto.setDiemTrungBinh(ketQua.getDiemTrungBinh());
                        
                        // Get DiemTongKet directly from KetQuaHocTap (đã tính: 20%*15p + 30%*45p + 50%*thi)
                        dto.setDiemTongKet(ketQua.getDiemTongKet());
                        
                        // Get XepLoai from KetQuaHocTap (dựa vào DiemTrungBinh)
                        dto.setXepLoai(ketQua.getXepLoai());
                    } else {
                        // Fallback: Calculate from BaiNop if KetQuaHocTap is empty
                        List<BaiNop> baiNops = baiNopRepository.findByHocSinhId(hs.getIdHs());
                        diem15Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_15P");
                        diem45Phut = tinhDiemTheoLoai(baiNops, "KIEM_TRA_45P");
                        diemThiHK = tinhDiemTheoLoai(baiNops, "THI_HK");
                        
                        // Set individual scores to DTO
                        dto.setDiem15Phut(diem15Phut);
                        dto.setDiem45Phut(diem45Phut);
                        dto.setDiemThiHK(diemThiHK);
                        
                        // Calculate DiemTrungBinh from BaiNop scores
                        BigDecimal diemTB = tinhDiemTrungBinhCong(diem15Phut, diem45Phut, diemThiHK);
                        dto.setDiemTrungBinh(diemTB);
                        dto.setXepLoai(xepLoai(diemTB));
                    }
                    
                    // Đảm bảo luôn set 3 điểm vào DTO (có thể null nếu chưa có)
                    if (dto.getDiem15Phut() == null) {
                        dto.setDiem15Phut(diem15Phut);
                    }
                    if (dto.getDiem45Phut() == null) {
                        dto.setDiem45Phut(diem45Phut);
                    }
                    if (dto.getDiemThiHK() == null) {
                        dto.setDiemThiHK(diemThiHK);
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
            ketQua.setDiemTrungBinh(BigDecimal.ZERO);
            ketQua.setDiemTongKet(BigDecimal.ZERO);
            ketQua.setXepLoai("N");
        }
        
        // Store the score temporarily in memory (giáo viên nhập từng điểm một)
        String loaiDiemUpper = loaiDiem.toUpperCase();
        String scoreKey;
        if (loaiDiemUpper.contains("15") || loaiDiemUpper.equals("15P") || loaiDiemUpper.equals("DIEM_15P")) {
            scoreKey = "15P";
        } else if (loaiDiemUpper.contains("45") || loaiDiemUpper.equals("45P") || loaiDiemUpper.equals("DIEM_45P")) {
            scoreKey = "45P";
        } else if (loaiDiemUpper.contains("HK") || loaiDiemUpper.contains("THI") || loaiDiemUpper.equals("DIEM_THI_HK")) {
            scoreKey = "HK";
        } else {
            scoreKey = loaiDiemUpper;
        }
        
        // Get or create temp scores map for this student
        Map<String, BigDecimal> studentScores = tempScores.computeIfAbsent(idHs, k -> new ConcurrentHashMap<>());
        studentScores.put(scoreKey, diemSo);
        
        // Get all 3 scores from temp storage
        BigDecimal diem15 = studentScores.get("15P");
        BigDecimal diem45 = studentScores.get("45P");
        BigDecimal diemHK = studentScores.get("HK");
        
        // Calculate DiemTrungBinh = (15p + 45p + thi) / 3 (chỉ khi có đủ 3 điểm)
        BigDecimal diemTrungBinh = tinhDiemTrungBinhCong(diem15, diem45, diemHK);
        
        // Calculate DiemTongKet = 20%*15p + 30%*45p + 50%*thi (chỉ khi có đủ 3 điểm)
        BigDecimal diemTongKet = tinhDiemTongKet(diem15, diem45, diemHK);
        
        // Update KetQuaHocTap - chỉ lưu 2 giá trị đã tính (DiemTrungBinh và DiemTongKet)
        if (diemTrungBinh != null && diemTongKet != null) {
            // Có đủ 3 điểm: lưu giá trị đã tính
            // DiemTrungBinh = (15p + 45p + thi) / 3 → lưu vào cột DiemTrungBinh
            ketQua.setDiemTrungBinh(diemTrungBinh);
            // DiemTongKet = 20%*15p + 30%*45p + 50%*thi → lưu vào cột DiemTongKet
            ketQua.setDiemTongKet(diemTongKet);
            // Xếp loại dựa vào DiemTrungBinh (không phải DiemTongKet)
            ketQua.setXepLoai(xepLoai(diemTrungBinh));
            
            System.out.println("=== SAVING SCORES ===");
            System.out.println("Student: " + idHs);
            System.out.println("Diem15: " + diem15);
            System.out.println("Diem45: " + diem45);
            System.out.println("DiemHK: " + diemHK);
            System.out.println("DiemTrungBinh (calculated): " + diemTrungBinh + " → Saving to DiemTrungBinh column");
            System.out.println("DiemTongKet (calculated): " + diemTongKet + " → Saving to DiemTongKet column");
            System.out.println("XepLoai (based on DiemTrungBinh): " + ketQua.getXepLoai());
            System.out.println("====================");
            
            // Clear temp scores after saving
            tempScores.remove(idHs);
        } else {
            // Chưa đủ 3 điểm: giữ giá trị cũ hoặc 0
            // Không cập nhật DiemTrungBinh và DiemTongKet cho đến khi có đủ 3 điểm
            if (ketQua.getDiemTrungBinh() == null || ketQua.getDiemTrungBinh().compareTo(BigDecimal.ZERO) == 0) {
                ketQua.setDiemTrungBinh(BigDecimal.ZERO);
                ketQua.setDiemTongKet(BigDecimal.ZERO);
                ketQua.setXepLoai("N");
            }
            // Giữ nguyên giá trị hiện tại, không cập nhật
        }
        
        // Save to database (luôn lưu để đảm bảo không mất dữ liệu)
        ketQuaHocTapRepository.save(ketQua);
        
        // Return updated DTO - trả về cả DiemTrungBinh và DiemTongKet để frontend hiển thị
        DiemSoDTO dto = new DiemSoDTO();
        dto.setIdHs(idHs);
        dto.setDiem15Phut(diem15);
        dto.setDiem45Phut(diem45);
        dto.setDiemThiHK(diemHK);
        
        // DiemTrungBinh = (15p + 45p + thi) / 3
        // Nếu đã tính được thì dùng, nếu chưa đủ 3 điểm thì tính tạm thời từ các điểm đã có
        if (diemTrungBinh != null) {
            dto.setDiemTrungBinh(diemTrungBinh);
        } else {
            // Tính tạm thời nếu có ít nhất 1 điểm
            int count = 0;
            BigDecimal sum = BigDecimal.ZERO;
            if (diem15 != null && diem15.compareTo(BigDecimal.ZERO) > 0) {
                sum = sum.add(diem15);
                count++;
            }
            if (diem45 != null && diem45.compareTo(BigDecimal.ZERO) > 0) {
                sum = sum.add(diem45);
                count++;
            }
            if (diemHK != null && diemHK.compareTo(BigDecimal.ZERO) > 0) {
                sum = sum.add(diemHK);
                count++;
            }
            if (count > 0) {
                BigDecimal tempAvg = sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
                dto.setDiemTrungBinh(tempAvg);
            } else {
                dto.setDiemTrungBinh(ketQua.getDiemTrungBinh());
            }
        }
        
        // DiemTongKet = 20%*15p + 30%*45p + 50%*thi (chỉ tính khi có đủ 3 điểm)
        dto.setDiemTongKet(diemTongKet != null ? diemTongKet : ketQua.getDiemTongKet());
        dto.setXepLoai(ketQua.getXepLoai());
        
        return dto;
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
     * Tính điểm trung bình cộng đơn giản: (15p + 45p + thi) / 3
     * Chỉ tính khi có đủ cả 3 loại điểm
     */
    private BigDecimal tinhDiemTrungBinhCong(BigDecimal diem15Phut, BigDecimal diem45Phut, BigDecimal diemThiHK) {
        // Chỉ tính điểm TB khi có đủ cả 3 loại điểm
        if (diem15Phut == null || diem45Phut == null || diemThiHK == null) {
            return null; // Chưa đủ điểm để tính
        }
        
        // Tính điểm trung bình cộng: (15p + 45p + thi) / 3
        BigDecimal tong = diem15Phut.add(diem45Phut).add(diemThiHK);
        BigDecimal diemTB = tong.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        
        return diemTB;
    }
    
    /**
     * Tính điểm tổng kết theo quy tắc:
     * - 20% điểm 15 phút
     * - 30% điểm 45 phút  
     * - 50% điểm thi học kỳ
     * 
     * Chỉ tính khi có đủ cả 3 loại điểm để đảm bảo tổng trọng số = 100%
     * Nếu thiếu bất kỳ điểm nào, trả về null (chưa đủ điểm để tính)
     */
    private BigDecimal tinhDiemTongKet(BigDecimal diem15Phut, BigDecimal diem45Phut, BigDecimal diemThiHK) {
        // Chỉ tính điểm tổng kết khi có đủ cả 3 loại điểm
        // Đảm bảo tổng trọng số = 20% + 30% + 50% = 100%
        if (diem15Phut == null || diem45Phut == null || diemThiHK == null) {
            return null; // Chưa đủ điểm để tính
        }
        
        // Tính điểm tổng kết có trọng số
        BigDecimal tong = BigDecimal.ZERO;
        tong = tong.add(diem15Phut.multiply(BigDecimal.valueOf(0.2)));  // 20%
        tong = tong.add(diem45Phut.multiply(BigDecimal.valueOf(0.3)));  // 30%
        tong = tong.add(diemThiHK.multiply(BigDecimal.valueOf(0.5)));   // 50%
        
        return tong.setScale(2, RoundingMode.HALF_UP);
    }

    private String xepLoai(BigDecimal diemTB) {
        if (diemTB == null || diemTB.compareTo(BigDecimal.ZERO) == 0) {
            return "N";
        }
        
        if (diemTB.compareTo(BigDecimal.valueOf(8.0)) >= 0) {
            return "Giỏi"; // Unicode: Giỏi (not "Gi?i")
        } else if (diemTB.compareTo(BigDecimal.valueOf(6.5)) >= 0) {
            return "Khá";
        } else if (diemTB.compareTo(BigDecimal.valueOf(5.0)) >= 0) {
            return "TB"; // Trung bình -> TB
        } else {
            return "Yếu";
        }
    }
}

