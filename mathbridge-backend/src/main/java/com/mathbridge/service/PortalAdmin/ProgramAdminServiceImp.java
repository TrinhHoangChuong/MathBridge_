package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.ProgramAdminCreateRequest;
import com.mathbridge.dto.PortalAdmin.Request.ProgramAdminUpdateRequest;
import com.mathbridge.dto.PortalAdmin.Response.ProgramAdminResponse;
import com.mathbridge.entity.ChuongTrinh;
import com.mathbridge.repository.Admin.ChuongTrinhAdminRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ProgramAdminServiceImp implements ProgramAdminService {

    private final ChuongTrinhAdminRepository chuongTrinhAdminRepository;

    public ProgramAdminServiceImp(ChuongTrinhAdminRepository chuongTrinhAdminRepository) {
        this.chuongTrinhAdminRepository = chuongTrinhAdminRepository;
    }

    @Override
    public List<ProgramAdminResponse> getAllPrograms() {
        List<ChuongTrinh> entities = chuongTrinhAdminRepository.findAll();

        return entities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProgramAdminResponse getProgramById(String id) {
        ChuongTrinh entity = chuongTrinhAdminRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Program not found with id = " + id));

        return mapToResponse(entity);
    }

    @Override
    public ProgramAdminResponse createProgram(ProgramAdminCreateRequest request) {
        ChuongTrinh entity = new ChuongTrinh();
        entity.setIdCt(request.getIdCT());     // ID_CT
        entity.setTenCt(request.getTenCT());   // TenCT
        entity.setMoTa(request.getMoTa());     // MoTa

        ChuongTrinh saved = chuongTrinhAdminRepository.save(entity);
        return mapToResponse(saved);
    }

    @Override
    public ProgramAdminResponse updateProgram(String id, ProgramAdminUpdateRequest request) {
        ChuongTrinh entity = chuongTrinhAdminRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Program not found with id = " + id));

        entity.setTenCt(request.getTenCT());
        entity.setMoTa(request.getMoTa());

        ChuongTrinh saved = chuongTrinhAdminRepository.save(entity);
        return mapToResponse(saved);
    }

    @Override
    public void deleteProgram(String id) {
        if (!chuongTrinhAdminRepository.existsById(id)) {
            throw new NoSuchElementException("Program not found with id = " + id);
        }
        chuongTrinhAdminRepository.deleteById(id);
    }

    private ProgramAdminResponse mapToResponse(ChuongTrinh entity) {
        return new ProgramAdminResponse(
                entity.getIdCt(),
                entity.getTenCt(),
                entity.getMoTa()
        );
    }
}
