package com.mathbridge.service;

import com.mathbridge.entity.LopHoc;
import com.mathbridge.repository.LopHocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service xử lý business logic cho Lớp học (Course)
 * Quản lý các thao tác CRUD và query theo nhiều tiêu chí
 */
@Service
public class CourseService {

    @Autowired
    private LopHocRepository lopHocRepository;

    /**
     * Lấy tất cả lớp học
     * @return Danh sách tất cả lớp học trong database
     */
    public List<LopHoc> getAllCourses() {
        return lopHocRepository.findAll();
    }

    /**
     * Lấy lớp học theo chương trình
     * @param idCT Mã chương trình (CT001=Lớp 9, CT002=Lớp 10, CT003=Lớp 11, CT004=Lớp 12, CT005=Thi chứng chỉ)
     * @return Danh sách lớp học theo chương trình
     */
    public List<LopHoc> getCoursesByProgram(String idCT) {
        return lopHocRepository.findByChuongTrinh_IdCt(idCT);
    }

    /**
     * Lấy lớp học theo chương trình và hình thức học
     * @param idCT Mã chương trình
     * @param hinhThucHoc Hình thức học (ONLINE, OFFLINE, GIA SƯ)
     * @return Danh sách lớp học
     */
    public List<LopHoc> getCoursesByProgramAndMethod(String idCT, String hinhThucHoc) {
        return lopHocRepository.findByChuongTrinh_IdCtAndHinhThucHoc(idCT, hinhThucHoc);
    }

    /**
     * Lấy lớp học theo hình thức học
     * @param hinhThucHoc Hình thức: ONLINE, OFFLINE, GIA SƯ
     * @return Danh sách lớp học
     */
    public List<LopHoc> getCoursesByMethod(String hinhThucHoc) {
        return lopHocRepository.findByHinhThucHoc(hinhThucHoc);
    }

    /**
     * Lấy lớp học theo loại ngày học (2-4-6/3-5-7/4-6-CN)
     */
    public List<LopHoc> getCoursesByLoaiNgay(String loaiNgay) {
        return lopHocRepository.findByLoaiNgay(loaiNgay);
    }

    /**
     * Lấy lớp học theo trạng thái
     * @param trangThai Trạng thái: Đang mở, Dự Kiến
     * @return Danh sách lớp học
     */
    public List<LopHoc> getCoursesByStatus(String trangThai) {
        return lopHocRepository.findByTrangThai(trangThai);
    }

    /**
     * Lấy chi tiết một lớp học theo ID
     * @param idLH Mã lớp học
     * @return Thông tin lớp học (Optional)
     */
    public Optional<LopHoc> getCourseById(String idLH) {
        return lopHocRepository.findById(idLH);
    }
}

