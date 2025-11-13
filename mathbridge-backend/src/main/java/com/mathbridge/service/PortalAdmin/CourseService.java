
package com.mathbridge.service.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Request.CourseRequest;
import com.mathbridge.dto.PortalAdmin.Response.CourseResponse;
import org.springframework.data.domain.*;

public interface CourseService {
    Page<CourseResponse> list(String q, Pageable pageable);
    CourseResponse get(String idCt);
    CourseResponse create(CourseRequest req);
    CourseResponse update(String idCt, CourseRequest req);
    void delete(String idCt);
}
