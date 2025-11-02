package com.mathbridge.repository;

import com.mathbridge.entity.HocSinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HocSinhRepository extends JpaRepository<HocSinh, String> {
    Optional<HocSinh> findBySdt(String sdt);
    Optional<HocSinh> findByEmail(String email);
}

