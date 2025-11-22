package com.mathbridge.repository.Admin;

import com.mathbridge.entity.KetQuaHocTap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface KetQuaHocTapAdminRepository extends JpaRepository<KetQuaHocTap, String> {

    Optional<KetQuaHocTap> findFirstByIdHs(String idHs);

    List<KetQuaHocTap> findByIdHs(String idHs);
    List<KetQuaHocTap> findByIdHsIn(Collection<String> idHs);
}
