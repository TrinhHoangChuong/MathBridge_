package com.mathbridge.repository.Admin;

import com.mathbridge.entity.DanhGiaBuoiHoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface DanhGiaBuoiHocAdminRepository extends JpaRepository<DanhGiaBuoiHoc, String> {

    List<DanhGiaBuoiHoc> findByIdBhIn(Collection<String> idsBh);
}
