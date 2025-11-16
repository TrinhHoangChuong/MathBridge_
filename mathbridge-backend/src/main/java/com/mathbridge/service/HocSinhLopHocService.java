package com.mathbridge.service;

import com.mathbridge.dto.HocSinhLopHocDTO;

import java.util.List;

public interface HocSinhLopHocService {
    List<HocSinhLopHocDTO> getHocSinhByLopHoc(String idLh);
}

