package com.mathbridge.repository;

import com.mathbridge.entity.BaiTapNoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaiTapNoiDungRepository extends JpaRepository<BaiTapNoiDung, String> {
}

