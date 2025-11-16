package com.mathbridge.repository;

import com.mathbridge.entity.TaiKhoan_VaiTro;
import com.mathbridge.entity.TaiKhoanVaiTroId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaiKhoanVaiTroRepository extends JpaRepository<TaiKhoan_VaiTro, TaiKhoanVaiTroId> {

    // Lấy toàn bộ role của 1 tài khoản theo mã tài khoản
    List<TaiKhoan_VaiTro> findByTaiKhoan_IdTk(String idTk);
}
