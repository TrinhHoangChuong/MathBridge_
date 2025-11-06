package com.mathbridge.repository;

import com.mathbridge.entity.HocSinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface HocSinhRepository extends JpaRepository<HocSinh, String> {
    Optional<HocSinh> findBySdt(String sdt);
    Optional<HocSinh> findByEmail(String email);
    
    @Query("SELECT hs FROM HocSinh hs WHERE hs.taiKhoan.idTk = :idTk")
    Optional<HocSinh> findByTaiKhoan_IdTk(@Param("idTk") String idTk);

    // Lấy phần số lớn nhất của ID_HS dạng HS###
    @Query(value = "SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(ID_HS, 3, 10) AS INT)), 0) FROM HocSinh WHERE ID_HS LIKE 'HS%'", nativeQuery = true)
    int findMaxHsNumber();
}
