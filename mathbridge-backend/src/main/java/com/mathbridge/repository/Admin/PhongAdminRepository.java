package com.mathbridge.repository.Admin;
import com.mathbridge.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhongAdminRepository extends JpaRepository<Phong, String> {


    List<Phong> findByIdCs(String idCs);
}
