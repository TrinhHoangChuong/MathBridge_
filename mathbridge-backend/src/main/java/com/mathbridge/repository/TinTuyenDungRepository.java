package com.mathbridge.repository;

import com.mathbridge.entity.TinTuyenDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TinTuyenDungRepository extends JpaRepository<TinTuyenDung, String> {
}
