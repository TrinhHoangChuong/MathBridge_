package com.mathbridge.repository.Admin;

import com.mathbridge.entity.CoSo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoSoAdminRepository extends JpaRepository<CoSo, String> {
}
