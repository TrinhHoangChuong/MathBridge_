package com.mathbridge.service;

import com.mathbridge.repository.TaiKhoanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class StudentContextService {

    private static final Logger logger = LoggerFactory.getLogger(StudentContextService.class);

    private final TaiKhoanRepository taiKhoanRepository;

    public StudentContextService(TaiKhoanRepository taiKhoanRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
    }

    public String resolveStudentId(Authentication authentication) {
        if (authentication == null) {
            logger.debug("[StudentContextService] Authentication is null");
            return null;
        }

        if (!(authentication.getPrincipal() instanceof Jwt jwt)) {
            logger.debug("[StudentContextService] Principal is not Jwt: {}", authentication.getPrincipal().getClass().getName());
            return null;
        }

        String idTk = jwt.getClaimAsString("uid");
        logger.debug("[StudentContextService] idTk from claim 'uid': {}", idTk);

        if (idTk == null) {
            String email = jwt.getSubject();
            logger.debug("[StudentContextService] Email from subject: {}", email);
            if (email != null) {
                idTk = taiKhoanRepository.findByEmail(email)
                        .map(tk -> tk.getIdTk())
                        .orElse(null);
                logger.debug("[StudentContextService] idTk from email lookup: {}", idTk);
            }
        }

        if (idTk == null) {
            logger.debug("[StudentContextService] Cannot resolve idTk");
            return null;
        }

        return taiKhoanRepository.findById(idTk)
                .map(tk -> tk.getIdHs())
                .orElse(null);
    }
}

