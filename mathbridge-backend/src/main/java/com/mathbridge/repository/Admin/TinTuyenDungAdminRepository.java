package com.mathbridge.repository.Admin;

import com.mathbridge.entity.TinTuyenDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TinTuyenDungAdminRepository extends JpaRepository<TinTuyenDung, String> {
}
