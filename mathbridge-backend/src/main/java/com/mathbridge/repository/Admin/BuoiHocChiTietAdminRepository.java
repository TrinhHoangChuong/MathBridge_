package com.mathbridge.repository.Admin;

import com.mathbridge.entity.BuoiHocChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface BuoiHocChiTietAdminRepository extends JpaRepository<BuoiHocChiTiet, String> {
    List<BuoiHocChiTiet> findByLopHoc_IdLh(String idLh);

    long countByLopHoc_IdLh(String idLh);
}

