package com.mathbridge.repository;

import com.mathbridge.entity.LienHeTuVan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LienHeTuVanRepository extends JpaRepository<LienHeTuVan, String> {
}