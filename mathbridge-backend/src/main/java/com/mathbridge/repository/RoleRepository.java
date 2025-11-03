package com.mathbridge.repository;

import com.mathbridge.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, String> {
    // Tìm role theo tên vai trò
    Optional<Role> findByTenVaiTro(String tenVaiTro);
}
