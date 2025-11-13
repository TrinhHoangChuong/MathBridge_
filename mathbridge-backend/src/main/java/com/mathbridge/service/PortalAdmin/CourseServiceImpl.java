// com/mathbridge/service/PortalAdmin/CourseServiceImpl.java
package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.CourseRequest;
import com.mathbridge.dto.PortalAdmin.Response.CourseResponse;
import com.mathbridge.entity.ChuongTrinh;
import com.mathbridge.repository.ChuongTrinhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final ChuongTrinhRepository repo;

    @Override
    @Transactional(readOnly = true)
    public Page<CourseResponse> list(String q, Pageable pageable) {
        Page<ChuongTrinh> page = (q == null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByTenCtContainingIgnoreCase(q, pageable);
        return page.map(this::toResp);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse get(String idCt) {
        ChuongTrinh e = repo.findById(idCt)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy chương trình: " + idCt));
        return toResp(e);
    }

    @Override
    @Transactional
    public CourseResponse create(CourseRequest req) {
        ChuongTrinh e = new ChuongTrinh();

        // Nếu client không truyền idCt, tự phát sinh (ví dụ: CTxxxxx hoặc UUID rút gọn)
        String id = (req.getIdCt() != null && !req.getIdCt().isBlank())
                ? req.getIdCt()
                : genId();
        if (repo.existsById(id)) {
            throw new IllegalArgumentException("ID_CT đã tồn tại: " + id);
        }

        e.setIdCt(id);
        e.setTenCt(req.getTenCt());
        e.setMoTa(req.getMoTa());
        return toResp(repo.save(e));
    }

    @Override
    @Transactional
    public CourseResponse update(String idCt, CourseRequest req) {
        ChuongTrinh e = repo.findById(idCt)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy chương trình: " + idCt));

        if (req.getTenCt() != null) e.setTenCt(req.getTenCt());
        if (req.getMoTa() != null) e.setMoTa(req.getMoTa());

        return toResp(repo.save(e));
    }

    @Override
    @Transactional
    public void delete(String idCt) {
        if (!repo.existsById(idCt)) {
            throw new NoSuchElementException("Không tìm thấy chương trình: " + idCt);
        }
        repo.deleteById(idCt);
    }

    private CourseResponse toResp(ChuongTrinh e) {
        CourseResponse r = new CourseResponse();
        r.setIdCt(e.getIdCt());
        r.setTenCt(e.getTenCt());
        r.setMoTa(e.getMoTa());
        return r;
    }

    private String genId() {
        // đơn giản: lấy 6 ký tự đầu của UUID, đảm bảo <= length 10
        return "CT" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}
