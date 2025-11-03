package com.mathbridge.service;

import com.mathbridge.dto.AuthenticatedAccountDTO;
import com.mathbridge.dto.RegisterRequestDTO;

public interface RegistrationService {
    AuthenticatedAccountDTO registerStudent(RegisterRequestDTO req);
}
