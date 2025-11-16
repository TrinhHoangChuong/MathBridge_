//package com.mathbridge.service;
//
//import com.mathbridge.dto.HocSinhLopHocDTO;
//import com.mathbridge.entity.DangKyLH;
//import com.mathbridge.repository.DangKyLHRepository;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class HocSinhLopHocServiceImpl implements HocSinhLopHocService {
//
//    private final DangKyLHRepository dangKyLHRepository;
//
//    public HocSinhLopHocServiceImpl(DangKyLHRepository dangKyLHRepository) {
//        this.dangKyLHRepository = dangKyLHRepository;
//    }
//
//    @Override
//    public List<HocSinhLopHocDTO> getHocSinhByLopHoc(String idLh) {
//        List<DangKyLH> dangKyLHs = dangKyLHRepository.findByLopHocId(idLh);
//
//        return dangKyLHs.stream()
//                .map(dk -> {
//                    var hs = dk.getHocSinh();
//                    return new HocSinhLopHocDTO(
//                            hs.getIdHs(),
//                            hs.getHo(),
//                            hs.getTenDem(),
//                            hs.getTen(),
//                            hs.getEmail(),
//                            hs.getSdt(),
//                            dk.getTrangThai(),
//                            null // Ngày đăng ký không có trong entity, có thể thêm sau
//                    );
//                })
//                .collect(Collectors.toList());
//    }
//}
//
