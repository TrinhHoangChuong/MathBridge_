package com.mathbridge.repository;

import com.mathbridge.entity.NhanVien;
import com.mathbridge.entity.CoSo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {

    List<NhanVien> findByHoIgnoreCaseContaining(String ho);

    List<NhanVien> findByTenDemIgnoreCaseContaining(String tenDem);

    List<NhanVien> findByTenIgnoreCaseContaining(String ten);

    List<NhanVien> findByCoSo(CoSo coSo);

    List<NhanVien> findByCoSo_IdCs(String idCs);

    // Lấy danh sách giáo viên theo chức vụ
    List<NhanVien> findByChucVuIgnoreCase(String chucVu);
}
