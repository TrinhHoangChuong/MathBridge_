package com.mathbridge.repository.Admin;

import com.mathbridge.entity.BaiTap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BaiTapAdminRepository extends JpaRepository<BaiTap, String> {

    // Lấy tất cả bài tập của 1 danh sách buổi học
    List<BaiTap> findByIdBhIn(Collection<String> idBhs);
}
