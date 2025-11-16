package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.ClassRequest;
import com.mathbridge.dto.PortalAdmin.Response.ClassResponse;

import java.util.List;

public interface ClassManagerService {
    List<ClassResponse> getAllClasses();
    ClassResponse getClassById(String id);
    ClassResponse createClass(ClassRequest request);
    ClassResponse updateClass(String id, ClassRequest request);
    void deleteClass(String id);
}
