package com.mathbridge.service;

import com.mathbridge.dto.GiaoVienCardDTO;
import com.mathbridge.dto.NhanVienProfileDTO;
import com.mathbridge.dto.NhanVienProfileUpdateDTO;

import java.util.List;
import java.util.Optional;

public interface NhanVienService {

    List<GiaoVienCardDTO> getDanhSachGiaoVien();

    Optional<NhanVienProfileDTO> getProfileByAccountId(String idTk);

    NhanVienProfileDTO updateProfileByAccountId(String idTk, NhanVienProfileUpdateDTO request);
}
