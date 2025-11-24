package com.mathbridge.service;

import com.mathbridge.dto.BaiTapDTO;
import com.mathbridge.dto.BaiNopDTO;

import java.math.BigDecimal;
import java.util.List;

public interface BaiTapService {
    List<BaiTapDTO> getBaiTapByLopHoc(String idLh);
    List<BaiTapDTO> getBaiTapByGiaoVien(String idNv);
    List<BaiTapDTO> getBaiTapByBuoiHoc(String idBh);
    BaiTapDTO createBaiTap(BaiTapDTO baiTapDTO);
    BaiTapDTO updateBaiTap(String idBt, BaiTapDTO baiTapDTO);
    void deleteBaiTap(String idBt);
    List<BaiNopDTO> getBaiNopByBaiTap(String idBt);
    BaiNopDTO chamDiemBaiNop(String idBn, BigDecimal diemSo, String nhanXet);
}

