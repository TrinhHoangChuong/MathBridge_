package com.mathbridge.repository.Admin;

import com.mathbridge.entity.TaiKhoanVaiTroId;
import com.mathbridge.entity.TaiKhoan_VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface TaiKhoanVaiTroAdminRepository extends JpaRepository<TaiKhoan_VaiTro, TaiKhoanVaiTroId> {
    boolean existsById_IdTkAndId_IdRole(String idTk, String idRole);

    List<TaiKhoan_VaiTro> findById_IdTk(String idTk);

    /**
     * Lấy tất cả bản ghi TaiKhoan_VaiTro theo list ID_TK.
     */
    List<TaiKhoan_VaiTro> findByTaiKhoan_IdTkIn(Collection<String> idTks);

    /**
     * Lấy tất cả vai trò của 1 tài khoản.
     */
    List<TaiKhoan_VaiTro> findByTaiKhoan_IdTk(String idTk);

    /**
     * Lấy các mapping theo 1 vai trò (dùng để kiểm tra trước khi xóa Role).
     */
    List<TaiKhoan_VaiTro> findByRole_IdRole(String idRole);
}
