package com.mathbridge.repository.Admin;

import com.mathbridge.entity.BaiNop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BaiNopAdminRepository extends JpaRepository<BaiNop, String> {

    // Lấy tất cả bài nộp của 1 học sinh
    List<BaiNop> findByIdHs(String idHs);
    // thêm cho tab Bài nộp
    List<BaiNop> findByIdBtIn(Collection<String> assignmentIds);
}
