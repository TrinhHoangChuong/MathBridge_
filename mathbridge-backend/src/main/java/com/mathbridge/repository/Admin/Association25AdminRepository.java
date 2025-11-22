package com.mathbridge.repository.Admin;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public class Association25AdminRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<String> findCandidateIdsByJobId(String idTd) {
        String sql = "SELECT ID_UV FROM Association_25 WHERE ID_TD = :idTd";
        @SuppressWarnings("unchecked")
        List<String> results = entityManager
                .createNativeQuery(sql)
                .setParameter("idTd", idTd)
                .getResultList();
        return results;
    }

    public long countCandidatesByJobId(String idTd) {
        String sql = "SELECT COUNT(*) FROM Association_25 WHERE ID_TD = :idTd";
        Object single = entityManager
                .createNativeQuery(sql)
                .setParameter("idTd", idTd)
                .getSingleResult();
        return ((Number) single).longValue();
    }

    public long countJobsByCandidateId(String idUv) {
        String sql = "SELECT COUNT(*) FROM Association_25 WHERE ID_UV = :idUv";
        Object single = entityManager
                .createNativeQuery(sql)
                .setParameter("idUv", idUv)
                .getSingleResult();
        return ((Number) single).longValue();
    }

    public void insertMapping(String idTd, String idUv) {
        String sql = "INSERT INTO Association_25 (ID_TD, ID_UV) VALUES (:idTd, :idUv)";
        entityManager.createNativeQuery(sql)
                .setParameter("idTd", idTd)
                .setParameter("idUv", idUv)
                .executeUpdate();
    }

    public void deleteMapping(String idTd, String idUv) {
        String sql = "DELETE FROM Association_25 WHERE ID_TD = :idTd AND ID_UV = :idUv";
        entityManager.createNativeQuery(sql)
                .setParameter("idTd", idTd)
                .setParameter("idUv", idUv)
                .executeUpdate();
    }
}
