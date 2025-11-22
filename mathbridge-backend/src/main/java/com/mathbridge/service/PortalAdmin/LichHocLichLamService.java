package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.ClassScheduleAutoGenerateRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.ClassScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.StudentScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Request.LichHocLichLamRequest.TeacherScheduleSearchRequest;
import com.mathbridge.dto.PortalAdmin.Response.LichHocLichLamResponse.*;

import java.util.List;

/**
 * Service cho module Lịch học & Lịch làm.
 */
public interface LichHocLichLamService {

    // CLASS OPTIONS & DETAIL
    List<ClassOptionResponse> getClassOptions();

    ClassDetailResponse getClassDetail(String idLh);

    // CLASS SCHEDULE
    List<ClassScheduleItemResponse> searchClassSchedule(ClassScheduleSearchRequest request);

    AutoGenerateResultResponse autoGenerateSchedule(ClassScheduleAutoGenerateRequest request);

    // CAMPUS & ROOMS
    List<CampusOptionResponse> getCampuses();

    List<RoomOptionResponse> getRoomsByCampus(String idCs);

    // TEACHERS
    List<TeacherOptionResponse> getTeacherOptions();

    List<TeacherScheduleItemResponse> searchTeacherSchedule(TeacherScheduleSearchRequest request);

    // STUDENTS
    List<StudentOptionResponse> getStudentOptions();

    List<StudentScheduleItemResponse> searchStudentSchedule(StudentScheduleSearchRequest request);

    AutoGenerateResultResponse updateSession(LichHocLichLamRequest.UpdateSessionRequest request);
}
