package com.mathbridge.repository.Admin;

import com.mathbridge.entity.CS_DaoTao_CT;
import com.mathbridge.entity.CSDaoTaoCtId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CSDaoTaoCTRepository extends JpaRepository<CS_DaoTao_CT, CSDaoTaoCtId> {
    List<CS_DaoTao_CT> findByChuongTrinh_IdCt(String idCt);
    List<CS_DaoTao_CT> findByCoSo_IdCs(String idCs);
}
