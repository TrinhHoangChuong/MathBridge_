package com.mathbridge.repository.Admin;

import com.mathbridge.entity.CSDaoTaoCT;
import com.mathbridge.entity.CSDaoTaoCTId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CSDaoTaoCTRepository extends JpaRepository<CSDaoTaoCT, CSDaoTaoCTId> {
    List<CSDaoTaoCT> findByChuongTrinh_IdCt(String idCt);
    List<CSDaoTaoCT> findByCoSo_IdCs(String idCs);
}
