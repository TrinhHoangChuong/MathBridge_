package com.mathbridge.repository.Admin;

import com.mathbridge.entity.UngVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UngVienAdminRepository extends JpaRepository<UngVien, String> {
}
