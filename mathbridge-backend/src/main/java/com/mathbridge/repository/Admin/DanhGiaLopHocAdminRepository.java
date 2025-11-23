package com.mathbridge.repository.Admin;

import com.mathbridge.entity.DanhGiaLopHoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DanhGiaLopHocAdminRepository extends JpaRepository<DanhGiaLopHoc, String> {

    List<DanhGiaLopHoc> findByIdLh(String idLh);
}
