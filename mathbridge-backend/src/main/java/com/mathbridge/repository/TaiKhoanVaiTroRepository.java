package com.mathbridge.repository;

import com.mathbridge.entity.TaiKhoanVaiTro;
import com.mathbridge.entity.TaiKhoanVaiTroId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaiKhoanVaiTroRepository extends JpaRepository<TaiKhoanVaiTro, TaiKhoanVaiTroId> {

    // Lấy toàn bộ role của 1 tài khoản theo mã tài khoản
    List<TaiKhoanVaiTro> findByTaiKhoan_IdTk(String idTk);
}
