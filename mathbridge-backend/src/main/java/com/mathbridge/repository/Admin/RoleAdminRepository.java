package com.mathbridge.repository.Admin;

import com.mathbridge.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleAdminRepository extends JpaRepository<Role, String> {
}
