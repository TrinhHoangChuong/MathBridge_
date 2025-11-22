package com.mathbridge.repository.Admin;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository cho bảng LichSuThanhToan, dùng native SQL bám sát CSDL.
 * Không thay đổi schema, không phụ thuộc entity mapping.
 */
@Repository
@RequiredArgsConstructor
public class LichSuThanhToanAdminRepository {

    @PersistenceContext
    private final EntityManager entityManager;

    /**
     * Tìm kiếm LichSuThanhToan + join TenPT theo điều kiện filter.
     *
     * @return List<Object[]>:
     *   [0] ID_LS (String)
     *   [1] ID_PT (String)
     *   [2] TongTien (BigDecimal)
     *   [3] TrangThaiThanhToan (String)
     *   [4] HinhThuc (String)
     *   [5] Thang (String)
     *   [6] GhiChu (String)
     *   [7] TenPT (String)
     */
    @SuppressWarnings("unchecked")
    public List<Object[]> search(String status, String methodId, String month) {
        String sql =
                "SELECT ls.ID_LS, ls.ID_PT, ls.TongTien, ls.TrangThaiThanhToan, " +
                        "ls.HinhThuc, ls.Thang, ls.GhiChu, pt.TenPT " +
                        "FROM LichSuThanhToan ls " +
                        "JOIN PhuongThucThanhToan pt ON pt.ID_PT = ls.ID_PT " +
                        "WHERE (:status IS NULL OR ls.TrangThaiThanhToan = :status) " +
                        "  AND (:methodId IS NULL OR ls.ID_PT = :methodId) " +
                        "  AND (:month IS NULL OR ls.Thang = :month) " +
                        "ORDER BY ls.ID_LS DESC";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("status", status);
        query.setParameter("methodId", methodId);
        query.setParameter("month", month);

        return query.getResultList();
    }

    /**
     * Lấy 1 dòng LichSuThanhToan + TenPT theo ID_LS.
     */
    public Object[] findOneWithTenPt(String idLs) {
        String sql =
                "SELECT ls.ID_LS, ls.ID_PT, ls.TongTien, ls.TrangThaiThanhToan, " +
                        "ls.HinhThuc, ls.Thang, ls.GhiChu, pt.TenPT " +
                        "FROM LichSuThanhToan ls " +
                        "JOIN PhuongThucThanhToan pt ON pt.ID_PT = ls.ID_PT " +
                        "WHERE ls.ID_LS = :idLs";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idLs", idLs);
        List<?> result = query.getResultList();
        if (result.isEmpty()) {
            return null;
        }
        return (Object[]) result.get(0);
    }

    /**
     * INSERT vào LichSuThanhToan.
     */
    public void insert(
            String idLs,
            String idPt,
            BigDecimal tongTien,
            String trangThaiThanhToan,
            String hinhThuc,
            String thang,
            String ghiChu
    ) {
        String sql =
                "INSERT INTO LichSuThanhToan " +
                        "(ID_LS, ID_PT, TongTien, TrangThaiThanhToan, HinhThuc, Thang, GhiChu) " +
                        "VALUES (:idLs, :idPt, :tongTien, :trangThai, :hinhThuc, :thang, :ghiChu)";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idLs", idLs);
        query.setParameter("idPt", idPt);
        query.setParameter("tongTien", tongTien);
        query.setParameter("trangThai", trangThaiThanhToan);
        query.setParameter("hinhThuc", hinhThuc);
        query.setParameter("thang", thang);
        query.setParameter("ghiChu", ghiChu);

        query.executeUpdate();
    }

    /**
     * UPDATE LichSuThanhToan.
     */
    public int update(
            String idLs,
            String idPt,
            BigDecimal tongTien,
            String trangThaiThanhToan,
            String hinhThuc,
            String thang,
            String ghiChu
    ) {
        String sql =
                "UPDATE LichSuThanhToan " +
                        "SET ID_PT = :idPt, " +
                        "    TongTien = :tongTien, " +
                        "    TrangThaiThanhToan = :trangThai, " +
                        "    HinhThuc = :hinhThuc, " +
                        "    Thang = :thang, " +
                        "    GhiChu = :ghiChu " +
                        "WHERE ID_LS = :idLs";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idPt", idPt);
        query.setParameter("tongTien", tongTien);
        query.setParameter("trangThai", trangThaiThanhToan);
        query.setParameter("hinhThuc", hinhThuc);
        query.setParameter("thang", thang);
        query.setParameter("ghiChu", ghiChu);
        query.setParameter("idLs", idLs);

        return query.executeUpdate();
    }

    /**
     * DELETE LichSuThanhToan theo ID_LS.
     */
    public int delete(String idLs) {
        String sql = "DELETE FROM LichSuThanhToan WHERE ID_LS = :idLs";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("idLs", idLs);
        return query.executeUpdate();
    }
}
