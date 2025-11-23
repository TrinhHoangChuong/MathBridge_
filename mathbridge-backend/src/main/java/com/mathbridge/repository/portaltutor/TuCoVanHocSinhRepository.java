package com.mathbridge.repository.portaltutor;

import com.mathbridge.entity.CoVanHocSinh;
import com.mathbridge.entity.CoVanHocSinhId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TuCoVanHocSinhRepository extends JpaRepository<CoVanHocSinh, CoVanHocSinhId> {
    
    /**
     * Lấy tất cả học sinh được phân công cho một cố vấn (ID_NV)
     * Chỉ lấy những học sinh đang được phân công (TrangThai = "Dang phu trach" 
     * và (NgayKetThuc IS NULL hoặc NgayKetThuc > hiện tại))
     */
    @Query("SELECT DISTINCT cvhs FROM CoVanHocSinh cvhs " +
           "LEFT JOIN FETCH cvhs.hocSinh hs " +
           "LEFT JOIN FETCH hs.taiKhoan " +
           "LEFT JOIN FETCH hs.dangKyLhs dk " +
           "LEFT JOIN FETCH dk.lopHoc lh " +
           "LEFT JOIN FETCH lh.chuongTrinh " +
           "WHERE cvhs.id.idNv = :idNv " +
           "AND (cvhs.trangThai = 'Dang phu trach' OR cvhs.trangThai IS NULL) " +
           "AND (cvhs.ngayKetThuc IS NULL OR cvhs.ngayKetThuc > :currentTime) " +
           "ORDER BY cvhs.id.ngayBatDau DESC")
    List<CoVanHocSinh> findActiveStudentsByTutorId(@Param("idNv") String idNv, 
                                                    @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Lấy tất cả học sinh được phân công (bao gồm cả đã kết thúc)
     */
    @Query("SELECT DISTINCT cvhs FROM CoVanHocSinh cvhs " +
           "LEFT JOIN FETCH cvhs.hocSinh hs " +
           "LEFT JOIN FETCH hs.taiKhoan " +
           "LEFT JOIN FETCH hs.dangKyLhs dk " +
           "LEFT JOIN FETCH dk.lopHoc lh " +
           "LEFT JOIN FETCH lh.chuongTrinh " +
           "WHERE cvhs.id.idNv = :idNv " +
           "ORDER BY cvhs.id.ngayBatDau DESC")
    List<CoVanHocSinh> findAllStudentsByTutorId(@Param("idNv") String idNv);
    
    /**
     * Lấy học sinh được phân công theo trạng thái
     */
    @Query("SELECT DISTINCT cvhs FROM CoVanHocSinh cvhs " +
           "LEFT JOIN FETCH cvhs.hocSinh hs " +
           "LEFT JOIN FETCH hs.taiKhoan " +
           "LEFT JOIN FETCH hs.dangKyLhs dk " +
           "LEFT JOIN FETCH dk.lopHoc lh " +
           "LEFT JOIN FETCH lh.chuongTrinh " +
           "WHERE cvhs.id.idNv = :idNv " +
           "AND cvhs.trangThai = :trangThai " +
           "ORDER BY cvhs.id.ngayBatDau DESC")
    List<CoVanHocSinh> findStudentsByTutorIdAndStatus(@Param("idNv") String idNv, 
                                                       @Param("trangThai") String trangThai);
    
    /**
     * Lấy thông tin phân công cụ thể của một học sinh và cố vấn
     */
    @Query("SELECT DISTINCT cvhs FROM CoVanHocSinh cvhs " +
           "LEFT JOIN FETCH cvhs.hocSinh hs " +
           "LEFT JOIN FETCH hs.taiKhoan " +
           "LEFT JOIN FETCH hs.dangKyLhs dk " +
           "LEFT JOIN FETCH dk.lopHoc lh " +
           "LEFT JOIN FETCH lh.chuongTrinh " +
           "LEFT JOIN FETCH cvhs.nhanVien nv " +
           "WHERE cvhs.id.idNv = :idNv " +
           "AND cvhs.id.idHs = :idHs " +
           "ORDER BY cvhs.id.ngayBatDau DESC")
    List<CoVanHocSinh> findByTutorIdAndStudentId(@Param("idNv") String idNv, 
                                                   @Param("idHs") String idHs);
    
    /**
     * Đếm số học sinh đang được phân công cho một cố vấn
     */
    @Query("SELECT COUNT(cvhs) FROM CoVanHocSinh cvhs " +
           "WHERE cvhs.id.idNv = :idNv " +
           "AND (cvhs.trangThai = 'Dang phu trach' OR cvhs.trangThai IS NULL) " +
           "AND (cvhs.ngayKetThuc IS NULL OR cvhs.ngayKetThuc > :currentTime)")
    Long countActiveStudentsByTutorId(@Param("idNv") String idNv, 
                                        @Param("currentTime") LocalDateTime currentTime);
}

 