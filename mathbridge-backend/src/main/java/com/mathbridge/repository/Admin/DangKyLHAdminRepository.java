package com.mathbridge.repository.Admin;

import com.mathbridge.entity.DangKyLH;
import com.mathbridge.entity.DangKyLhId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface DangKyLHAdminRepository extends JpaRepository<DangKyLH, DangKyLhId> {

    List<DangKyLH> findByHocSinh_IdHsIn(Collection<String> studentIds);

    List<DangKyLH> findByHocSinh_IdHs(String idHs);

    List<DangKyLH> findByLopHoc_IdLhIn(Collection<String> classIds);

    List<DangKyLH> findByHocSinh_IdHsAndLopHoc_IdLh(String idHs, String idLh);

    // cho tab Đánh giá & kết quả (1 lớp)
    List<DangKyLH> findByLopHoc_IdLh(String idLh);

}
