package com.mathbridge.repository;

import com.mathbridge.entity.LopHoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LopHocRepository extends JpaRepository<LopHoc, String> {

    // SELECT * FROM LopHoc WHERE ID_NV = :idNv
    List<LopHoc> findByNhanVien_IdNv(String idNv);
}
