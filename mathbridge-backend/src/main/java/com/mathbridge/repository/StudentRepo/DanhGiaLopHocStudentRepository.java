package com.mathbridge.repository.StudentRepo;

import com.mathbridge.entity.DanhGiaLopHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhGiaLopHocStudentRepository extends JpaRepository<DanhGiaLopHoc, String> {
    
    // Find by student ID
    List<DanhGiaLopHoc> findByHocSinh_IdHs(String idHS);
    
    // Find by class ID
    List<DanhGiaLopHoc> findByLopHoc_IdLh(String idLH);
    
    // Find by student ID and class ID
    @Query("SELECT dg FROM DanhGiaLopHoc dg WHERE dg.hocSinh.idHs = :idHS AND dg.lopHoc.idLh = :idLH")
    Optional<DanhGiaLopHoc> findByHocSinhIdAndLopHocId(@Param("idHS") String idHS, @Param("idLH") String idLH);
    
    // Find all ordered by time descending
    @Query("SELECT dg FROM DanhGiaLopHoc dg ORDER BY dg.thoiDiemDanhGia DESC")
    List<DanhGiaLopHoc> findAllOrderByThoiDiemDanhGiaDesc();

    // Lấy phần số lớn nhất của ID_DGLH dạng DG### (DG + số tuần tự)
    @Query(value = "SELECT ISNULL(MAX(CASE " +
                   "WHEN LEN(ID_DGLH) = 10 AND ISNUMERIC(SUBSTRING(ID_DGLH, 3, 8)) = 1 " +
                   "THEN TRY_CAST(SUBSTRING(ID_DGLH, 3, 8) AS INT) " +
                   "ELSE 0 END), 0) " +
                   "FROM DanhGiaLopHoc WHERE ID_DGLH LIKE 'DG%'", nativeQuery = true)
    int findMaxDglhNumber();
}

