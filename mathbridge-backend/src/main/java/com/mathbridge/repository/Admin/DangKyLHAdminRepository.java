package com.mathbridge.repository.Admin;

import com.mathbridge.entity.DangKyLH;
import com.mathbridge.entity.DangKyLhId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface DangKyLHAdminRepository extends JpaRepository<DangKyLH, DangKyLhId> {

    @Query("SELECT dk FROM DangKyLH dk WHERE dk.hocSinh.idHs = :studentId")
    List<DangKyLH> findByHocSinh_IdHs(@Param("studentId") String studentId);

    @Query("SELECT dk FROM DangKyLH dk WHERE dk.hocSinh.idHs IN :studentIds")
    List<DangKyLH> findByHocSinh_IdHsIn(@Param("studentIds") List<String> studentIds);

    @Query("SELECT dk FROM DangKyLH dk WHERE dk.lopHoc.idLh = :classId")
    List<DangKyLH> findByLopHoc_IdLh(@Param("classId") String classId);

    @Query("SELECT dk FROM DangKyLH dk WHERE dk.lopHoc.idLh IN :classIds")
    List<DangKyLH> findByLopHoc_IdLhIn(@Param("classIds") List<String> classIds);

    @Query("SELECT dk FROM DangKyLH dk WHERE dk.hocSinh.idHs = :studentId AND dk.lopHoc.idLh = :classId")
    List<DangKyLH> findByHocSinh_IdHsAndLopHoc_IdLh(@Param("studentId") String studentId, @Param("classId") String classId);
}
