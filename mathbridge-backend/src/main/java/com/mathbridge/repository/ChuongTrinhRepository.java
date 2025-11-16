
package com.mathbridge.repository;

import com.mathbridge.entity.ChuongTrinh;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChuongTrinhRepository extends JpaRepository<ChuongTrinh, String> {
    Page<ChuongTrinh> findByTenCtContainingIgnoreCase(String q, Pageable pageable);
}
