package com.mathbridge.repository;

import com.mathbridge.entity.PhuongThucThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhuongThucThanhToanRepository extends JpaRepository<PhuongThucThanhToan, String> {
    List<PhuongThucThanhToan> findAll();
}

