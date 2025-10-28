package com.mathbridge.repository;

import com.mathbridge.entity.UngVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UngVienRepository extends JpaRepository<UngVien, String> {

}
