package com.mathbridge.repository;

import com.mathbridge.entity.TinTuyenDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TinTuyenDungRepository extends JpaRepository<TinTuyenDung, Long> {
    Optional<TinTuyenDung> findBySlug(String slug);
}
