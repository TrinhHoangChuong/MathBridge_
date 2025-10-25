package com.mathbridge.repository;
import com.mathbridge.entity.CoSo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoSoRepository extends JpaRepository<CoSo, String> {
    // JpaRepository<ENTITY, TYPE_OF_PRIMARY_KEY>
    // Ở đây khóa chính ID_CS là nvarchar(10) => String
}
