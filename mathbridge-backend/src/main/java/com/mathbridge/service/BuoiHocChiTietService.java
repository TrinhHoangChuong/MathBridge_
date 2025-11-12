package com.mathbridge.service;

import com.mathbridge.dto.BuoiHocChiTietDTO;

import java.util.List;

public interface BuoiHocChiTietService {
    List<BuoiHocChiTietDTO> getBuoiHocByLopHoc(String idLh);
    List<BuoiHocChiTietDTO> getBuoiHocByGiaoVien(String idNv);
    BuoiHocChiTietDTO createBuoiHoc(BuoiHocChiTietDTO dto);
    BuoiHocChiTietDTO updateBuoiHoc(String idBh, BuoiHocChiTietDTO dto);
    void deleteBuoiHoc(String idBh);
}

