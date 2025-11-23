package com.mathbridge.repository.Admin;

import com.mathbridge.entity.HocSinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HocSinhAdminRepository extends JpaRepository<HocSinh, String> {

    @Query("SELECT hs FROM HocSinh hs WHERE hs.trangThaiHoatDong = :status")
    List<HocSinh> findByTrangThaiHoatDong(@Param("status") Boolean status);

    List<HocSinh> findByIdHsIn(List<String> studentIds);
}