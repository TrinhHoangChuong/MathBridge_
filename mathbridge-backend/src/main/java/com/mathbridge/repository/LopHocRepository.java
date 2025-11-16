package com.mathbridge.repository;

import com.mathbridge.entity.LopHoc;
import org.hibernate.query.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.awt.print.Pageable;
import java.util.List;

public interface LopHocRepository extends JpaRepository<LopHoc, String>, JpaSpecificationExecutor<LopHoc> {

    // SELECT * FROM LopHoc WHERE ID_NV = :idNv
    List<LopHoc> findByNhanVien_IdNv(String idNv);

    // SELECT * FROM LopHoc WHERE ID_CT = :idCT
    List<LopHoc> findByChuongTrinh_IdCt(String idCt);

    // SELECT * FROM LopHoc WHERE ID_CT = :idCT AND HinhThucHoc = :hinhThucHoc
    List<LopHoc> findByChuongTrinh_IdCtAndHinhThucHoc(String idCt, String hinhThucHoc);

    // SELECT * FROM LopHoc WHERE HinhThucHoc = :hinhThucHoc
    List<LopHoc> findByHinhThucHoc(String hinhThucHoc);

    // SELECT * FROM LopHoc WHERE TrangThai = :trangThai
    List<LopHoc> findByTrangThai(String trangThai);

    // SELECT * FROM LopHoc WHERE LoaiNgay = :loaiNgay
    List<LopHoc> findByLoaiNgay(String loaiNgay);

    //CRUD admin
    long countByChuongTrinh_IdCt(String idCt);

}
