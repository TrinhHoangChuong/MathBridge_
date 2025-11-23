package com.mathbridge.repository.Admin;

import com.mathbridge.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhongAdmimRepository extends JpaRepository<Phong, String> {
    List<Phong> findByIdCs(String idCs);
}
