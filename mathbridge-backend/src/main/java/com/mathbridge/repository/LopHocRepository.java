package com.mathbridge.repository;

import com.mathbridge.entity.LopHoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LopHocRepository extends JpaRepository<LopHoc, String> {

    // lấy tất cả lớp mà giáo viên này phụ trách
    List<LopHoc> findByNhanVien_IdNv(String idNv);

}
