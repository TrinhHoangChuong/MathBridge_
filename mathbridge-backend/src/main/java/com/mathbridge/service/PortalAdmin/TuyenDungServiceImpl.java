package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TuyenDungRequest;
import com.mathbridge.dto.PortalAdmin.Response.TuyenDungResponse;
import com.mathbridge.entity.TinTuyenDung;
import com.mathbridge.entity.UngVien;
import com.mathbridge.repository.Admin.Association25AdminRepository;
import com.mathbridge.repository.Admin.TinTuyenDungAdminRepository;
import com.mathbridge.repository.Admin.UngVienAdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class TuyenDungServiceImpl implements TuyenDungService {

    private final TinTuyenDungAdminRepository tinTuyenDungRepo;
    private final UngVienAdminRepository ungVienRepo;
    private final Association25AdminRepository associationRepo;

    public TuyenDungServiceImpl(
            TinTuyenDungAdminRepository tinTuyenDungRepo,
            UngVienAdminRepository ungVienRepo,
            Association25AdminRepository associationRepo
    ) {
        this.tinTuyenDungRepo = tinTuyenDungRepo;
        this.ungVienRepo = ungVienRepo;
        this.associationRepo = associationRepo;
    }

    // ==================== JOB ====================

    @Override
    @Transactional(readOnly = true)
    public List<TuyenDungResponse.JobSummary> getAllJobs() {
        List<TinTuyenDung> entities = tinTuyenDungRepo.findAll();
        List<TuyenDungResponse.JobSummary> result = new ArrayList<>();
        for (TinTuyenDung entity : entities) {
            long soUngVien = associationRepo.countCandidatesByJobId(entity.getIdTd());
            result.add(toJobSummary(entity, soUngVien));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public TuyenDungResponse.JobDetail getJobDetail(String idTd) {
        TinTuyenDung entity = tinTuyenDungRepo.findById(idTd)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin tuyển dụng: " + idTd));

        long soUngVien = associationRepo.countCandidatesByJobId(idTd);
        List<TuyenDungResponse.CandidateSummary> candidates = getCandidatesOfJob(idTd);

        return toJobDetail(entity, soUngVien, candidates);
    }

    @Override
    public TuyenDungResponse.JobDetail createJob(TuyenDungRequest.JobCreateOrUpdate request) {
        TinTuyenDung entity = new TinTuyenDung();
        applyJobRequestToEntity(request, entity);
        TinTuyenDung saved = tinTuyenDungRepo.save(entity);
        long soUngVien = associationRepo.countCandidatesByJobId(saved.getIdTd());
        return toJobDetail(saved, soUngVien, new ArrayList<>());
    }

    @Override
    public TuyenDungResponse.JobDetail updateJob(String idTd, TuyenDungRequest.JobCreateOrUpdate request) {
        TinTuyenDung entity = tinTuyenDungRepo.findById(idTd)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin tuyển dụng: " + idTd));

        applyJobRequestToEntity(request, entity);
        TinTuyenDung saved = tinTuyenDungRepo.save(entity);
        long soUngVien = associationRepo.countCandidatesByJobId(saved.getIdTd());
        List<TuyenDungResponse.CandidateSummary> candidates = getCandidatesOfJob(saved.getIdTd());
        return toJobDetail(saved, soUngVien, candidates);
    }

    @Override
    public void deleteJob(String idTd) {
        // xóa mapping trước (nếu cần đảm bảo FK trong DB thì điều chỉnh)
        // ở đây chỉ xóa record tin, mapping xử lý ở DB (ON DELETE) nếu có.
        tinTuyenDungRepo.deleteById(idTd);
    }

    // ==================== CANDIDATE ====================

    @Override
    @Transactional(readOnly = true)
    public List<TuyenDungResponse.CandidateSummary> getAllCandidates() {
        List<UngVien> entities = ungVienRepo.findAll();
        List<TuyenDungResponse.CandidateSummary> result = new ArrayList<>();
        for (UngVien entity : entities) {
            long soTin = associationRepo.countJobsByCandidateId(entity.getIdUv());
            result.add(toCandidateSummary(entity, soTin));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public TuyenDungResponse.CandidateDetail getCandidateDetail(String idUv) {
        UngVien entity = ungVienRepo.findById(idUv)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ứng viên: " + idUv));

        long soTin = associationRepo.countJobsByCandidateId(idUv);
        // Danh sách tin đã apply: có thể bổ sung join Association_25 + TinTuyenDung,
        // ở đây để đơn giản tạm thời trả về rỗng, FE vẫn có đủ info ứng viên.
        List<TuyenDungResponse.JobSummary> jobs = new ArrayList<>();

        return TuyenDungResponse.CandidateDetail.builder()
                .idUv(entity.getIdUv())
                .hoTen(entity.getHoTen())
                .email(entity.getEmail())
                .sdt(entity.getSdt())
                .cvUrl(entity.getCvUrl())
                .trangThaiHoSo(entity.getTrangThaiHoSo())
                .linkProfile(entity.getLinkProfile())
                .ghiChu(entity.getGhiChu())
                .soTinDaUngTuyen(soTin)
                .danhSachTinDaUngTuyen(jobs)
                .build();
    }

    @Override
    public TuyenDungResponse.CandidateDetail createCandidate(TuyenDungRequest.CandidateCreateOrUpdate request) {
        UngVien entity = new UngVien();
        applyCandidateRequestToEntity(request, entity);
        UngVien saved = ungVienRepo.save(entity);
        long soTin = associationRepo.countJobsByCandidateId(saved.getIdUv());

        return TuyenDungResponse.CandidateDetail.builder()
                .idUv(saved.getIdUv())
                .hoTen(saved.getHoTen())
                .email(saved.getEmail())
                .sdt(saved.getSdt())
                .cvUrl(saved.getCvUrl())
                .trangThaiHoSo(saved.getTrangThaiHoSo())
                .linkProfile(saved.getLinkProfile())
                .ghiChu(saved.getGhiChu())
                .soTinDaUngTuyen(soTin)
                .danhSachTinDaUngTuyen(new ArrayList<>())
                .build();
    }

    @Override
    public TuyenDungResponse.CandidateDetail updateCandidate(String idUv, TuyenDungRequest.CandidateCreateOrUpdate request) {
        UngVien entity = ungVienRepo.findById(idUv)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ứng viên: " + idUv));

        applyCandidateRequestToEntity(request, entity);
        UngVien saved = ungVienRepo.save(entity);
        long soTin = associationRepo.countJobsByCandidateId(saved.getIdUv());

        return TuyenDungResponse.CandidateDetail.builder()
                .idUv(saved.getIdUv())
                .hoTen(saved.getHoTen())
                .email(saved.getEmail())
                .sdt(saved.getSdt())
                .cvUrl(saved.getCvUrl())
                .trangThaiHoSo(saved.getTrangThaiHoSo())
                .linkProfile(saved.getLinkProfile())
                .ghiChu(saved.getGhiChu())
                .soTinDaUngTuyen(soTin)
                .danhSachTinDaUngTuyen(new ArrayList<>())
                .build();
    }

    @Override
    public void deleteCandidate(String idUv) {
        ungVienRepo.deleteById(idUv);
    }

    // ==================== MAPPING ====================

    @Override
    @Transactional(readOnly = true)
    public List<TuyenDungResponse.CandidateSummary> getCandidatesOfJob(String idTd) {
        List<String> candidateIds = associationRepo.findCandidateIdsByJobId(idTd);
        if (candidateIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<UngVien> ungViens = ungVienRepo.findAllById(candidateIds);
        List<TuyenDungResponse.CandidateSummary> result = new ArrayList<>();
        for (UngVien uv : ungViens) {
            long soTin = associationRepo.countJobsByCandidateId(uv.getIdUv());
            result.add(toCandidateSummary(uv, soTin));
        }
        return result;
    }

    @Override
    public void addCandidatesToJob(TuyenDungRequest.MappingCreate request) {
        if (request.getCandidateIds() == null) {
            return;
        }
        for (String idUv : request.getCandidateIds()) {
            associationRepo.insertMapping(request.getIdTd(), idUv);
        }
    }

    @Override
    public void removeCandidateFromJob(String idTd, String idUv) {
        associationRepo.deleteMapping(idTd, idUv);
    }

    // ==================== PRIVATE MAPPERS ====================

    private void applyJobRequestToEntity(TuyenDungRequest.JobCreateOrUpdate req, TinTuyenDung entity) {
        // mapping field -> entity, dùng đúng các thuộc tính đã map từ bảng TinTuyenDung
        entity.setIdTd(req.getIdTd());
        entity.setTieuDe(req.getTieuDe());
        entity.setViTri(req.getViTri());
        entity.setMoTaNgan(req.getMoTaNgan());
        entity.setMoTa(req.getMoTa());
        entity.setYeuCau(req.getYeuCau());
        entity.setCapBac(req.getCapBac());
        entity.setHinhThucLamViec(req.getHinhThucLamViec());
        entity.setMucLuongTu(req.getMucLuongTu());
        entity.setMucLuongDen(req.getMucLuongDen());
        entity.setKinhNghiem(req.getKinhNghiem());
        entity.setSoLuongTuyen(req.getSoLuongTuyen());
        entity.setHanNop(req.getHanNop());
        entity.setTrangThai(req.getTrangThai());
    }

    private void applyCandidateRequestToEntity(TuyenDungRequest.CandidateCreateOrUpdate req, UngVien entity) {
        entity.setIdUv(req.getIdUv());
        entity.setHoTen(req.getHoTen());
        entity.setEmail(req.getEmail());
        entity.setSdt(req.getSdt());
        entity.setCvUrl(req.getCvUrl());
        entity.setTrangThaiHoSo(req.getTrangThaiHoSo());
        entity.setLinkProfile(req.getLinkProfile());
        entity.setGhiChu(req.getGhiChu());
    }

    private TuyenDungResponse.JobSummary toJobSummary(TinTuyenDung entity, long soUngVien) {
        return TuyenDungResponse.JobSummary.builder()
                .idTd(entity.getIdTd())
                .tieuDe(entity.getTieuDe())
                .viTri(entity.getViTri())
                .capBac(entity.getCapBac())
                .mucLuongTu(entity.getMucLuongTu())
                .mucLuongDen(entity.getMucLuongDen())
                .kinhNghiem(entity.getKinhNghiem())
                .soLuongTuyen(entity.getSoLuongTuyen())
                .hanNop(entity.getHanNop())
                .trangThai(entity.getTrangThai())
                .soUngVien(soUngVien)
                .build();
    }

    private TuyenDungResponse.JobDetail toJobDetail(
            TinTuyenDung entity,
            long soUngVien,
            List<TuyenDungResponse.CandidateSummary> candidates
    ) {
        return TuyenDungResponse.JobDetail.builder()
                .idTd(entity.getIdTd())
                .tieuDe(entity.getTieuDe())
                .viTri(entity.getViTri())
                .moTaNgan(entity.getMoTaNgan())
                .moTa(entity.getMoTa())
                .yeuCau(entity.getYeuCau())
                .capBac(entity.getCapBac())
                .hinhThucLamViec(entity.getHinhThucLamViec())
                .mucLuongTu(entity.getMucLuongTu())
                .mucLuongDen(entity.getMucLuongDen())
                .kinhNghiem(entity.getKinhNghiem())
                .soLuongTuyen(entity.getSoLuongTuyen())
                .hanNop(entity.getHanNop())
                .trangThai(entity.getTrangThai())
                .soUngVien(soUngVien)
                .danhSachUngVien(candidates)
                .build();
    }

    private TuyenDungResponse.CandidateSummary toCandidateSummary(UngVien entity, long soTin) {
        return TuyenDungResponse.CandidateSummary.builder()
                .idUv(entity.getIdUv())
                .hoTen(entity.getHoTen())
                .email(entity.getEmail())
                .sdt(entity.getSdt())
                .cvUrl(entity.getCvUrl())
                .trangThaiHoSo(entity.getTrangThaiHoSo())
                .linkProfile(entity.getLinkProfile())
                .ghiChu(entity.getGhiChu())
                .soTinDaUngTuyen(soTin)
                .build();
    }
}
