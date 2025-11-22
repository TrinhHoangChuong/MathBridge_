package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.TuyenDungRequest;
import com.mathbridge.dto.PortalAdmin.Response.TuyenDungResponse;

import java.util.List;

public interface TuyenDungService {

    // Tin tuyển dụng
    List<TuyenDungResponse.JobSummary> getAllJobs();

    TuyenDungResponse.JobDetail getJobDetail(String idTd);

    TuyenDungResponse.JobDetail createJob(TuyenDungRequest.JobCreateOrUpdate request);

    TuyenDungResponse.JobDetail updateJob(String idTd, TuyenDungRequest.JobCreateOrUpdate request);

    void deleteJob(String idTd);

    // Ứng viên
    List<TuyenDungResponse.CandidateSummary> getAllCandidates();

    TuyenDungResponse.CandidateDetail getCandidateDetail(String idUv);

    TuyenDungResponse.CandidateDetail createCandidate(TuyenDungRequest.CandidateCreateOrUpdate request);

    TuyenDungResponse.CandidateDetail updateCandidate(String idUv, TuyenDungRequest.CandidateCreateOrUpdate request);

    void deleteCandidate(String idUv);

    // Ghép ứng viên - tin
    List<TuyenDungResponse.CandidateSummary> getCandidatesOfJob(String idTd);

    void addCandidatesToJob(TuyenDungRequest.MappingCreate request);

    void removeCandidateFromJob(String idTd, String idUv);
}
