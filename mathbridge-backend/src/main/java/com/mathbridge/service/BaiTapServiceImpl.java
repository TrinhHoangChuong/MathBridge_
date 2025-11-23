package com.mathbridge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mathbridge.dto.AssignmentQuestionDTO;
import com.mathbridge.dto.BaiTapDTO;
import com.mathbridge.dto.BaiNopDTO;
import com.mathbridge.entity.BaiTap;
import com.mathbridge.entity.BaiNop;
import com.mathbridge.entity.BaiTapNoiDung;
import com.mathbridge.entity.BuoiHocChiTiet;
import com.mathbridge.entity.HocSinh;
import com.mathbridge.entity.KetQuaHocTap;
import com.mathbridge.repository.BaiTapRepository;
import com.mathbridge.repository.BaiNopRepository;
import com.mathbridge.repository.BuoiHocChiTietRepository;
import com.mathbridge.repository.KetQuaHocTapRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BaiTapServiceImpl implements BaiTapService {

    private final BaiTapRepository baiTapRepository;
    private final BaiNopRepository baiNopRepository;
    private final BuoiHocChiTietRepository buoiHocChiTietRepository;
    private final KetQuaHocTapRepository ketQuaHocTapRepository;
    private final ObjectMapper objectMapper;

    public BaiTapServiceImpl(BaiTapRepository baiTapRepository,
                             BaiNopRepository baiNopRepository,
                             BuoiHocChiTietRepository buoiHocChiTietRepository,
                             KetQuaHocTapRepository ketQuaHocTapRepository,
                             ObjectMapper objectMapper) {
        this.baiTapRepository = baiTapRepository;
        this.baiNopRepository = baiNopRepository;
        this.buoiHocChiTietRepository = buoiHocChiTietRepository;
        this.ketQuaHocTapRepository = ketQuaHocTapRepository;
        this.objectMapper = objectMapper;
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
        System.out.println("=== getBaiTapByGiaoVien called with idNv: " + idNv + " ===");
        try {
            List<BaiTap> baiTaps = baiTapRepository.findByGiaoVienId(idNv);
            System.out.println("Found " + (baiTaps != null ? baiTaps.size() : 0) + " assignments");
            
            if (baiTaps == null || baiTaps.isEmpty()) {
                System.out.println("No assignments found for teacher: " + idNv);
                return Collections.emptyList();
            }
            
            List<BaiTapDTO> dtos = baiTaps.stream()
                    .map(bt -> {
                        try {
                            return convertToDTO(bt);
                        } catch (Exception e) {
                            System.err.println("Error converting BaiTap to DTO (idBt: " + bt.getIdBt() + "): " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            System.out.println("Successfully converted " + dtos.size() + " assignments to DTOs");
            return dtos;
        } catch (Exception e) {
            System.err.println("ERROR in getBaiTapByGiaoVien: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
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
        baiTap.setChoPhepLamBai(baiTapDTO.getChoPhepLamBai());
        baiTap.setHocSinhDuocPhep(baiTapDTO.getHocSinhDuocPhep());
        baiTap.setNgayBatDau(baiTapDTO.getNgayBatDau());
        baiTap.setNgayKetThuc(baiTapDTO.getNgayKetThuc());
        baiTap.setGhiChu(baiTapDTO.getGhiChu());
        applyContentFromDto(baiTap, baiTapDTO);
        
        BuoiHocChiTiet buoiHoc = resolveBuoiHocReference(baiTapDTO);
        if (buoiHoc != null) {
            baiTap.setBuoiHocChiTiet(buoiHoc);
            baiTap.setIdBh(buoiHoc.getIdBh());
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
        baiTap.setChoPhepLamBai(baiTapDTO.getChoPhepLamBai());
        baiTap.setHocSinhDuocPhep(baiTapDTO.getHocSinhDuocPhep());
        baiTap.setNgayBatDau(baiTapDTO.getNgayBatDau());
        baiTap.setNgayKetThuc(baiTapDTO.getNgayKetThuc());
        baiTap.setGhiChu(baiTapDTO.getGhiChu());
        applyContentFromDto(baiTap, baiTapDTO);
        
        BuoiHocChiTiet buoiHoc = resolveBuoiHocReference(baiTapDTO);
        if (buoiHoc != null) {
            baiTap.setBuoiHocChiTiet(buoiHoc);
            baiTap.setIdBh(buoiHoc.getIdBh());
        }
        
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
        
        // Save score to KetQuaHocTap
        try {
            String idHs = saved.getHocSinh().getIdHs();
            String loaiBt = saved.getBaiTap().getLoaiBt();
            
            // Find or create KetQuaHocTap
            List<KetQuaHocTap> existing = ketQuaHocTapRepository.findByHocSinhId(idHs);
            KetQuaHocTap ketQua = existing.isEmpty() ? null : existing.get(0);
            
            if (ketQua == null) {
                ketQua = new KetQuaHocTap();
                ketQua.setIdKq("KQ" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                ketQua.setIdHs(idHs);
                ketQua.setDiemSo("0,0,0");
                ketQua.setXepLoai("Chưa có");
            }
            
            // Parse current DiemSo string
            String[] diemParts = ketQua.getDiemSo() != null ? ketQua.getDiemSo().split(",") : new String[]{"0", "0", "0"};
            if (diemParts.length != 3) {
                diemParts = new String[]{"0", "0", "0"};
            }
            
            // Update based on loaiBt
            // KIEM_TRA_15P -> index 0, KIEM_TRA_45P -> index 1, THI_HK -> index 2
            if (loaiBt != null) {
                if (loaiBt.equals("KIEM_TRA_15P")) {
                    diemParts[0] = diemSo != null ? diemSo.toString() : "0";
                } else if (loaiBt.equals("KIEM_TRA_45P")) {
                    diemParts[1] = diemSo != null ? diemSo.toString() : "0";
                } else if (loaiBt.equals("THI_HK")) {
                    diemParts[2] = diemSo != null ? diemSo.toString() : "0";
                }
            }
            
            // Reconstruct DiemSo string
            ketQua.setDiemSo(String.join(",", diemParts));
            
            // Calculate average and classification
            BigDecimal diem15 = parseScore(diemParts[0]);
            BigDecimal diem45 = parseScore(diemParts[1]);
            BigDecimal diemHK = parseScore(diemParts[2]);
            BigDecimal diemTB = tinhDiemTrungBinh(diem15, diem45, diemHK);
            ketQua.setXepLoai(xepLoai(diemTB));
            
            ketQuaHocTapRepository.save(ketQua);
        } catch (Exception e) {
            System.err.println("Error saving to KetQuaHocTap: " + e.getMessage());
            e.printStackTrace();
            // Don't fail the entire operation if KetQuaHocTap save fails
        }
        
        return convertBaiNopToDTO(saved);
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
        
        return tong.setScale(2, java.math.RoundingMode.HALF_UP);
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

    private BaiTapDTO convertToDTO(BaiTap baiTap) {
        if (baiTap == null) {
            System.err.println("ERROR: convertToDTO called with null BaiTap");
            return null;
        }
        
        BaiTapDTO dto = new BaiTapDTO();
        dto.setIdBt(baiTap.getIdBt());
        dto.setTieuDe(baiTap.getTieuDe());
        dto.setMoTa(baiTap.getMoTa());
        dto.setLoaiBt(baiTap.getLoaiBt());
        
        // Handle new fields - may be null if database columns don't exist yet
        try {
            dto.setChoPhepLamBai(baiTap.getChoPhepLamBai());
        } catch (Exception e) {
            System.out.println("Warning: Could not get choPhepLamBai for BaiTap " + baiTap.getIdBt() + ": " + e.getMessage());
            dto.setChoPhepLamBai(false);
        }
        
        try {
            dto.setHocSinhDuocPhep(baiTap.getHocSinhDuocPhep());
        } catch (Exception e) {
            System.out.println("Warning: Could not get hocSinhDuocPhep for BaiTap " + baiTap.getIdBt() + ": " + e.getMessage());
            dto.setHocSinhDuocPhep(null);
        }
        
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

        if (baiTap.getNoiDungChiTiet() != null) {
            BaiTapNoiDung content = baiTap.getNoiDungChiTiet();
            dto.setThoiLuongPhut(content.getThoiLuongPhut());
            dto.setTuDongNop(content.getTuDongNop());
            dto.setCanhBao(content.getCanhBao());
            dto.setCheDoChamDiem(content.getCheDoChamDiem());
            dto.setQuestions(deserializeQuestions(content.getNoiDungJson()));
        } else {
            dto.setQuestions(Collections.emptyList());
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
        dto.setTongSoCau(baiNop.getTongSoCau());
        dto.setSoCauDung(baiNop.getSoCauDung());
        
        return dto;
    }

    private void applyContentFromDto(BaiTap baiTap, BaiTapDTO dto) {
        if (dto == null) {
            return;
        }

        boolean hasContent =
                dto.getThoiLuongPhut() != null ||
                dto.getTuDongNop() != null ||
                (dto.getCanhBao() != null && !dto.getCanhBao().isBlank()) ||
                (dto.getCheDoChamDiem() != null && !dto.getCheDoChamDiem().isBlank()) ||
                (dto.getQuestions() != null && !dto.getQuestions().isEmpty());

        if (!hasContent) {
            if (baiTap.getNoiDungChiTiet() != null) {
                baiTap.getNoiDungChiTiet().setNoiDungJson(null);
                baiTap.getNoiDungChiTiet().setThoiLuongPhut(null);
                baiTap.getNoiDungChiTiet().setTuDongNop(null);
                baiTap.getNoiDungChiTiet().setCanhBao(null);
                baiTap.getNoiDungChiTiet().setCheDoChamDiem(null);
            }
            return;
        }

        BaiTapNoiDung content = baiTap.getNoiDungChiTiet();
        if (content == null) {
            content = new BaiTapNoiDung();
            content.setBaiTap(baiTap);
            content.setIdBt(baiTap.getIdBt());
        }

        content.setThoiLuongPhut(dto.getThoiLuongPhut());
        content.setTuDongNop(dto.getTuDongNop());
        content.setCanhBao(dto.getCanhBao());
        content.setCheDoChamDiem(dto.getCheDoChamDiem());
        content.setNoiDungJson(serializeQuestions(dto.getQuestions()));
        baiTap.setNoiDungChiTiet(content);
    }

    private String serializeQuestions(List<AssignmentQuestionDTO> questions) {
        if (questions == null || questions.isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(questions);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Không thể lưu danh sách câu hỏi: " + e.getOriginalMessage(), e);
        }
    }

    private List<AssignmentQuestionDTO> deserializeQuestions(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<AssignmentQuestionDTO>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc dữ liệu câu hỏi: " + e.getMessage(), e);
        }
    }
    private BuoiHocChiTiet resolveBuoiHocReference(BaiTapDTO dto) {
        if (dto.getIdBh() != null) {
            return buoiHocChiTietRepository.findById(dto.getIdBh())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy buổi học với mã " + dto.getIdBh()));
        }

        if (dto.getIdLh() != null) {
            return buoiHocChiTietRepository.findFirstByLopHoc_IdLhOrderByNgayHocAsc(dto.getIdLh())
                    .orElseThrow(() -> new RuntimeException("Lớp học chưa có lịch buổi học. Vui lòng tạo buổi học trước khi giao bài."));
        }

        return null;
    }
}

