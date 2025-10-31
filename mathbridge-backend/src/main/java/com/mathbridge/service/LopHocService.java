package com.mathbridge.service;

import com.mathbridge.dto.LopHocDTO;

import java.util.List;

public interface LopHocService {

    // lấy các lớp do giáo viên này phụ trách
    List<LopHocDTO> getLopHocByGiaoVien(String idNv);
}
