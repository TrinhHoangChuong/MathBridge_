package com.mathbridge.repository.portaltutor;

import com.mathbridge.entity.LienHeTuVan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TuLienHeTuVanRepository extends JpaRepository<LienHeTuVan, String> {

    List<LienHeTuVan> findByThoiDiemTaoBetween(LocalDateTime start, LocalDateTime end);
}

