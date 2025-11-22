package com.mathbridge.repository.Admin;

import com.mathbridge.entity.CoVanHocSinhId;
import com.mathbridge.entity.CoVan_HocSinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoVanHocSinhAdminRepository extends JpaRepository<CoVan_HocSinh, CoVanHocSinhId> {
    boolean existsById_IdNv(String idNv);
}

