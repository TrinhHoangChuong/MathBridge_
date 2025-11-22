package com.mathbridge.repository.Admin;

import com.mathbridge.entity.LopHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LopHocAdminRepository extends JpaRepository<LopHoc, String> {

    List<LopHoc> findByIdCt(String ID_CT);

    boolean existsByIdNv(String idNv);


    List<LopHoc> findByIdNv(String idNv);
}
