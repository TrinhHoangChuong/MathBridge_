package com.mathbridge.service;

import com.mathbridge.dto.DiemSoDTO;

import java.math.BigDecimal;
import java.util.List;

public interface DiemSoService {
    List<DiemSoDTO> getDiemSoByLopHoc(String idLh);
    DiemSoDTO updateDiemSo(String idHs, String idLh, String loaiDiem, BigDecimal diemSo);
    void exportBaoCaoDiemSo(String idLh);
}

