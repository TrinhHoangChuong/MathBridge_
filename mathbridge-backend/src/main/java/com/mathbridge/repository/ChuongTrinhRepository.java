package com.mathbridge.repository;

import com.mathbridge.entity.ChuongTrinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChuongTrinhRepository extends JpaRepository<ChuongTrinh, String> {
}

