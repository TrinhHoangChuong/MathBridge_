package com.mathbridge.service;

import com.mathbridge.dto.LopHocDTO;

import java.util.List;

public interface LopHocService {

    // PUBLIC API – dùng cho controller /nhanvien/{idNv}/lophoc
    List<LopHocDTO> getLopHocByGiaoVien(String idNv);
}
